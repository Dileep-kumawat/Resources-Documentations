# MongoDB GridFS — Complete Developer Notes
> **Stack:** MERN (MongoDB · Express · React · Node.js) + Mongoose  
> **Purpose:** Quick-recall reference — scan headings, read only what you forgot.

---

## 1. What is GridFS?

GridFS is MongoDB's **specification for storing and retrieving large files** (> 16 MB BSON limit) by splitting them into smaller **chunks** stored as separate documents.

- Works for **any file**: images, videos, PDFs, audio, CSVs, etc.
- Files **≤ 16 MB** → store as base64 in a normal document (simpler).
- Files **> 16 MB** → GridFS is the answer.
- Built into the MongoDB driver; no extra DB needed.

### Why not just use the filesystem?
| Concern | GridFS Advantage |
|---|---|
| Scalability | Scales with MongoDB (replica sets, sharding) |
| Access control | Unified auth with your DB |
| Metadata | Store arbitrary metadata alongside the file |
| Replication | Files replicate automatically with the DB |

---

## 2. How GridFS Works Internally

GridFS uses **two collections** under a named bucket (default: `fs`):

```
fs.files   → one document per file (metadata)
fs.chunks  → one document per 255 KB chunk of the file
```

### `fs.files` document shape
```json
{
  "_id": ObjectId,
  "filename": "avatar.png",
  "length": 1048576,
  "chunkSize": 261120,
  "uploadDate": ISODate,
  "metadata": { "userId": "abc123", "tag": "profile" }
}
```

### `fs.chunks` document shape
```json
{
  "_id": ObjectId,
  "files_id": ObjectId,   // references fs.files._id
  "n": 0,                 // chunk sequence number (0-based)
  "data": BinData         // raw binary, max 255 KB
}
```

**Read flow:** driver fetches all chunks ordered by `n`, streams them back as one continuous file.

---

## 3. Setup

### Dependencies
```bash
npm install mongoose multer multer-gridfs-storage gridfs-stream
# OR the newer approach (no gridfs-stream needed):
npm install mongoose multer multer-gridfs-storage
```

| Package | Role |
|---|---|
| `mongoose` | MongoDB ODM |
| `multer` | Middleware for `multipart/form-data` |
| `multer-gridfs-storage` | Multer storage engine that writes to GridFS |
| `gridfs-stream` | (Legacy) streaming read/write helper |

---

## 4. Connection & GridFS Initialization

```js
// db.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb'); // native driver class

let gfsBucket;

mongoose.connect(process.env.MONGO_URI);

const conn = mongoose.connection;

conn.once('open', () => {
  // GridFSBucket is the modern API (Mongo driver v3.x+)
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads',   // collections: uploads.files, uploads.chunks
  });
  console.log('GridFSBucket ready');
});

module.exports = { getGfsBucket: () => gfsBucket };
```

> **Key point:** `GridFSBucket` comes from the **native MongoDB driver**, accessed via `mongoose.connection.db`. It is the modern replacement for the old `gridfs-stream` package.

---

## 5. Upload — Writing Files to GridFS

### 5a. Multer + multer-gridfs-storage (recommended for HTTP uploads)

```js
// upload.js
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      bucketName: 'uploads',           // must match bucket in db.js
      filename: `${Date.now()}-${file.originalname}`,
      metadata: { uploadedBy: req.user?.id },
    };
  },
});

// Optional: filter by MIME type
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
```

### 5b. Route
```js
// routes/files.js
const router = require('express').Router();
const upload = require('../upload');

// Single file
router.post('/upload', upload.single('file'), (req, res) => {
  // req.file contains GridFS metadata after upload
  res.json({
    fileId: req.file.id,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Multiple files
router.post('/upload-many', upload.array('files', 10), (req, res) => {
  res.json(req.files.map(f => ({ fileId: f.id, filename: f.filename })));
});
```

### 5c. Programmatic Upload (Node stream → GridFS)
```js
const { getGfsBucket } = require('./db');
const fs = require('fs');

async function uploadFile(localPath, filename) {
  const bucket = getGfsBucket();
  const readStream = fs.createReadStream(localPath);
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: { source: 'server' },
  });

  await new Promise((resolve, reject) => {
    readStream.pipe(uploadStream)
      .on('finish', resolve)
      .on('error', reject);
  });

  return uploadStream.id; // ObjectId of the new file
}
```

---

## 6. Download — Reading Files from GridFS

### 6a. Stream file to HTTP response
```js
const { getGfsBucket } = require('../db');
const { ObjectId } = require('mongoose').Types;

router.get('/file/:id', async (req, res) => {
  try {
    const bucket = getGfsBucket();
    const fileId = new ObjectId(req.params.id);

    // Check file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ error: 'File not found' });

    const file = files[0];

    // Set content type from metadata or guess
    res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);

    // Stream directly to response
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    res.status(400).json({ error: 'Invalid file ID' });
  }
});
```

### 6b. Download by filename
```js
bucket.openDownloadStreamByName('avatar.png').pipe(res);
```

### 6c. Partial / range download
```js
bucket.openDownloadStream(fileId, { start: 0, end: 500000 }).pipe(res);
```

---

## 7. Listing & Querying Files

```js
// List all files in bucket
router.get('/files', async (req, res) => {
  const bucket = getGfsBucket();
  const files = await bucket.find({}).toArray();
  res.json(files);
});

// Filter by metadata
const userFiles = await bucket
  .find({ 'metadata.uploadedBy': userId })
  .sort({ uploadDate: -1 })
  .toArray();

// Find by filename
const file = await bucket.find({ filename: 'report.pdf' }).next();
```

---

## 8. Deletion

```js
router.delete('/file/:id', async (req, res) => {
  try {
    const bucket = getGfsBucket();
    await bucket.delete(new ObjectId(req.params.id));
    // Deletes from BOTH uploads.files AND uploads.chunks
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(404).json({ error: 'File not found or already deleted' });
  }
});
```

> **Important:** `bucket.delete()` removes from both collections atomically. Never delete from `fs.files` manually — orphaned chunks will remain.

---

## 9. Serving Images Inline (React Frontend)

### Option A — Direct `<img>` src pointing to your API
```jsx
// React component
const FilePreview = ({ fileId }) => (
  <img
    src={`/api/file/${fileId}`}
    alt="Uploaded file"
    style={{ maxWidth: '100%' }}
  />
);
```

### Option B — Blob URL (download first, then display)
```jsx
const [src, setSrc] = useState('');

useEffect(() => {
  fetch(`/api/file/${fileId}`)
    .then(res => res.blob())
    .then(blob => setSrc(URL.createObjectURL(blob)));
  return () => URL.revokeObjectURL(src); // cleanup
}, [fileId]);

return <img src={src} alt="preview" />;
```

---

## 10. Storing Metadata Separately (Mongoose Model Pattern)

GridFS metadata inside `fs.files` is flexible but hard to query with Mongoose validators. Common pattern: **store a reference in a Mongoose model**.

```js
// models/Upload.js
const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  gridFsId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  filename:   { type: String, required: true },
  mimetype:   { type: String },
  size:       { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Upload', UploadSchema);
```

```js
// In upload route, after multer
const Upload = require('../models/Upload');

router.post('/upload', upload.single('file'), async (req, res) => {
  const doc = await Upload.create({
    gridFsId:   req.file.id,
    filename:   req.file.filename,
    mimetype:   req.file.mimetype,
    size:       req.file.size,
    uploadedBy: req.user.id,
  });
  res.json(doc);
});
```

**Deletion must clean both:**
```js
await bucket.delete(upload.gridFsId);
await Upload.findByIdAndDelete(uploadDocId);
```

---

## 11. Common Patterns & Recipes

### Rename a file
```js
await bucket.rename(fileId, 'new-filename.png');
```

### Check if file exists before streaming
```js
const exists = (await bucket.find({ _id: fileId }).toArray()).length > 0;
```

### Copy file (manual, no built-in copy)
```js
const downloadStream = bucket.openDownloadStream(sourceId);
const uploadStream   = bucket.openUploadStream('copy-of-file.png');
downloadStream.pipe(uploadStream);
const newId = await new Promise(r => uploadStream.on('finish', () => r(uploadStream.id)));
```

### Upload from URL (fetch → pipe)
```js
const https = require('https');

https.get(remoteUrl, (response) => {
  const uploadStream = bucket.openUploadStream('remote-file.jpg');
  response.pipe(uploadStream);
});
```

---

## 12. Indexes & Performance

GridFS **auto-creates indexes** on:
- `fs.files`: `{ filename: 1, uploadDate: 1 }`
- `fs.chunks`: `{ files_id: 1, n: 1 }` (unique)

For custom queries, add your own:
```js
// After connection open
conn.db.collection('uploads.files').createIndex({ 'metadata.uploadedBy': 1 });
```

**Chunk size:** default is 255 KB. Change per upload:
```js
bucket.openUploadStream('big-video.mp4', { chunkSizeBytes: 1024 * 1024 }); // 1 MB chunks
```
Larger chunks = fewer documents = faster sequential reads.  
Smaller chunks = better random access / seeks.

---

## 13. Error Handling Checklist

| Scenario | Handling |
|---|---|
| Invalid ObjectId string | Wrap `new ObjectId(id)` in try/catch or validate with `mongoose.isValidObjectId(id)` |
| File not found | `bucket.find({ _id: id }).toArray()` returns `[]` → 404 |
| Stream errors | Listen for `.on('error', ...)` on both upload and download streams |
| Multer file type rejection | `fileFilter` calls `cb(new Error('...'), false)` → catch in `multer` error middleware |
| Multer size limit | `multer({ limits: { fileSize: 50 * 1024 * 1024 } })` → 413 |

```js
// Global multer error middleware (Express)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: 'File too large' });
  next(err);
});
```

---

## 14. Security Considerations

- **Validate MIME type** server-side (never trust `Content-Type` header alone).
- **Scan for malware** before storing (integrate ClamAV or a cloud API).
- **Auth-gate** download routes — GridFS has no built-in ACL.
- **Rate-limit** upload endpoints to prevent storage exhaustion.
- **Sanitize filenames** — strip path traversal chars (`../`).
- **Serve files through your API**, not direct MongoDB connections, to enforce access control.

---

## 15. Quick Mental Model

```
User uploads file
      │
      ▼
  Multer (middleware)
      │ multipart/form-data parsed
      ▼
  multer-gridfs-storage
      │ splits into 255 KB chunks
      ▼
  MongoDB
  ┌─────────────────────┐
  │  uploads.files      │  ← one document (metadata)
  │  uploads.chunks × N │  ← N chunk documents
  └─────────────────────┘
      │
      ▼  (download)
  GridFSBucket.openDownloadStream()
      │ reassembles chunks in order
      ▼
  res.pipe() → Client
```

---

## 16. Full Minimal Working Example

```
project/
├── db.js
├── upload.js
├── routes/
│   └── files.js
├── models/
│   └── Upload.js
└── server.js
```

```js
// server.js
const express = require('express');
const mongoose = require('mongoose');
require('./db');                        // opens connection, initializes bucket

const app = express();
app.use(express.json());
app.use('/api', require('./routes/files'));

app.listen(5000, () => console.log('Server on :5000'));
```

---

## 17. Key Things to Remember

1. **`GridFSBucket`** (native driver) is the modern API — prefer over `gridfs-stream`.
2. Two collections, always: `.files` and `.chunks` — never delete from one alone.
3. `bucket.delete(id)` handles both collections — always use it.
4. `multer-gridfs-storage` is the glue between Express/Multer and GridFS for HTTP uploads.
5. For React, just point `<img src>` to your streaming API route.
6. Validate file IDs with `mongoose.isValidObjectId()` before creating `ObjectId`.
7. Store a Mongoose model reference alongside GridFS for rich querying & relational lookups.
8. GridFS is **not** a CDN — add one (Cloudflare, CloudFront) in front for caching/performance at scale.
