# AWS S3 — Quick Recall Notes (MERN Stack Dev)

## 1. What is S3
- **Simple Storage Service** — object storage (not block/file storage).
- Stores **objects** (files) inside **buckets** (containers).
- Use cases in MERN apps: user profile pics, product images, video uploads, PDF invoices, backups, static frontend hosting, log storage.

## 2. Core Concepts
| Term | Meaning |
|---|---|
| **Bucket** | Top-level container, globally unique name, tied to a region |
| **Object** | The actual file + metadata, identified by a **Key** (path-like string) |
| **Key** | Full "path" of object, e.g. `users/123/avatar.png` (no real folders, just prefixes) |
| **Region** | Where bucket physically lives (pick close to users for latency) |
| **ARN** | `arn:aws:s3:::bucket-name/key` — used in IAM policies |
| **Storage Class** | Standard, Intelligent-Tiering, Glacier, etc. (cost vs retrieval speed) |

## 3. Access Control (most confusing part — focus here)
- **IAM Policies** — attached to users/roles, define what actions allowed.
- **Bucket Policy** — JSON attached to bucket, controls access at bucket level.
- **ACLs** — older, object/bucket level, mostly avoid in new projects.
- **Block Public Access** — AWS default ON for new buckets; must explicitly disable if you want public read (e.g., public images).
- **Presigned URLs** — temporary signed URL granting time-limited access without making bucket public. **Most used in MERN apps.**

## 4. Typical MERN Upload Flow (IMPORTANT — interview favorite)

### Pattern A: Backend Proxy Upload
```
Client → Express API (multer) → S3 (AWS SDK) → return URL → save URL in MongoDB
```
- Simple, but file passes through your server (bandwidth cost, slower).

### Pattern B: Presigned URL Upload (preferred, scalable)
```
1. Client asks Express: "I want to upload file X"
2. Express generates a presigned PUT URL (using AWS SDK) — does NOT touch file
3. Client uploads directly to S3 using that URL (PUT request)
4. Client tells Express "upload done" → Express saves S3 key/URL in MongoDB
```
- File never touches your server → faster, cheaper, scalable.
- This is the **standard production pattern** for image/video uploads.

## 5. AWS SDK v3 (Node.js) — Essentials
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Direct upload from server
await s3.send(new PutObjectCommand({
  Bucket: "my-bucket",
  Key: "users/123/avatar.png",
  Body: fileBuffer,
  ContentType: "image/png",
}));

// Generate presigned URL for client-side upload
const command = new PutObjectCommand({ Bucket: "my-bucket", Key: "uploads/file.png" });
const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 sec validity

// Delete object
await s3.send(new DeleteObjectCommand({ Bucket: "my-bucket", Key: "users/123/avatar.png" }));
```

## 6. Multer + S3 (common Express setup)
```bash
npm install multer multer-s3
```
```js
import multer from "multer";
import multerS3 from "multer-s3";

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "my-bucket",
    key: (req, file, cb) => cb(null, `uploads/${Date.now()}-${file.originalname}`),
  }),
});

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ url: req.file.location }); // S3 file URL
});
```

## 7. Storing in MongoDB
- Don't store the file itself — store the **S3 key or full URL** as a string field in your schema.
```js
const userSchema = new Schema({
  name: String,
  avatarUrl: String, // e.g. https://bucket.s3.region.amazonaws.com/users/123/avatar.png
});
```

## 8. Security Checklist (env + IAM)
- Never hardcode AWS keys — use `.env` + `process.env`.
- Create a dedicated **IAM user** with a policy scoped only to your bucket (not full S3 access).
- Example minimal IAM policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```
- Use **CORS configuration** on bucket if uploading directly from browser (Pattern B):
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourapp.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"]
  }
]
```

## 9. Common Gotchas
- **403 Forbidden** → check bucket policy / Block Public Access / IAM permissions.
- **CORS error on direct upload** → forgot to set bucket CORS config.
- Bucket names must be globally unique, lowercase, no underscores.
- Presigned URLs expire — handle expiry gracefully on frontend.
- Large files → use **multipart upload** (S3 SDK handles automatically above a size threshold).
- Don't make whole bucket public just for a few images — prefer presigned GET URLs or CloudFront for serving private content.

## 10. Other Useful Features (good to know, not core)
- **Static website hosting** — host React build directly from S3 bucket.
- **Lifecycle rules** — auto-delete/move old files to cheaper storage class.
- **Versioning** — keep history of object changes.
- **CloudFront** — CDN in front of S3 for faster global delivery + caching.
- **Pre-signed GET URL** — same concept as PUT, used to let user *view/download* private file temporarily.

## 11. One-Line Mental Model
> S3 = a giant, secure, scalable key-value file store in the cloud. In MERN, you usually generate presigned URLs from Express so the client uploads directly to S3, and you only save the resulting URL/key in MongoDB.

## 12. Quick Revision Flow (read in this order when revising)
1. Bucket/Object/Key basics
2. Public vs Private access, Block Public Access
3. Presigned URL concept (why it's preferred)
4. SDK v3 code snippets (Put/Get/Delete/presign)
5. Multer-S3 setup
6. IAM policy + CORS
7. Gotchas list
