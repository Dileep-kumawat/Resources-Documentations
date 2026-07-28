# Multer — Complete Revision Notes (Express.js File Upload Middleware)

## 1. What is Multer?

Multer is a middleware for handling file uploads in Express.js applications.

It processes:

* `multipart/form-data`
* File uploads from forms
* Multiple files
* Mixed text + files

Built on top of **Busboy** for efficiency. ([npm][1])

---

# 2. Why Multer is Needed

Express cannot handle file uploads by default.

Without Multer:

* `req.body` works for JSON/urlencoded
* File data is ignored

Multer:

* Parses uploaded files
* Adds:

  * `req.file`
  * `req.files`
  * `req.body`

---

# 3. Installation

```bash
npm install multer
```

([npm][1])

---

# 4. Basic Setup

```js
const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({ dest: "uploads/" });
```

### Meaning:

* `multer()` → creates middleware
* `dest` → folder where files are stored

---

# 5. HTML Form Requirement

Multer ONLY works with:

```html
enctype="multipart/form-data"
```

Example:

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar">
  <button>Upload</button>
</form>
```

Critical point:

* `name="avatar"` MUST match `upload.single("avatar")`

---

# 6. Single File Upload

```js
app.post("/upload", upload.single("avatar"), (req, res) => {

    console.log(req.file);

    res.send("Uploaded");
});
```

---

# 7. `req.file` Object

Contains uploaded file info:

```js
{
  fieldname,
  originalname,
  encoding,
  mimetype,
  destination,
  filename,
  path,
  size
}
```

Most used:

* `originalname`
* `mimetype`
* `size`
* `path`

---

# 8. Multiple File Upload

```js
app.post("/photos", upload.array("photos", 5), (req, res) => {

    console.log(req.files);

});
```

### Meaning:

* `"photos"` → input field name
* `5` → max files allowed

---

# 9. Multiple Different Fields

```js
const multiUpload = upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 5 }
]);

app.post("/profile", multiUpload, (req, res) => {

    console.log(req.files);

});
```

---

# 10. Text-only Multipart Form

```js
app.post("/data", upload.none(), (req, res) => {

    console.log(req.body);

});
```

Used when:

* Form is multipart
* No files uploaded

---

# 11. Storage Engines

Multer has TWO main storage options:

| Storage Type   | Meaning                  |
| -------------- | ------------------------ |
| Disk Storage   | Save files in folder     |
| Memory Storage | Store file in RAM buffer |

---

# 12. Disk Storage (Important)

Used in real projects.

```js
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage });
```

---

# 13. Memory Storage

```js
const storage = multer.memoryStorage();

const upload = multer({ storage });
```

File becomes:

```js
req.file.buffer
```

Used for:

* Cloud uploads
* Image processing
* AWS S3
* Cloudinary

---

# 14. File Validation (`fileFilter`)

Very important for interviews.

```js
const fileFilter = (req, file, cb) => {

    if(file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Only PNG allowed"));
    }

};
```

Usage:

```js
const upload = multer({
    storage,
    fileFilter
});
```

---

# 15. File Size Limit

```js
const upload = multer({

    limits: {
        fileSize: 1024 * 1024 * 5
    }

});
```

### Here:

* 5 MB max

---

# 16. Important Middleware Methods

| Method     | Purpose                   |
| ---------- | ------------------------- |
| `single()` | One file                  |
| `array()`  | Multiple files same field |
| `fields()` | Multiple fields           |
| `none()`   | No files                  |
| `any()`    | Any file upload           |

---

# 17. `single()` vs `array()` vs `fields()`

| Method     | Returns            |
| ---------- | ------------------ |
| `single()` | `req.file`         |
| `array()`  | `req.files` array  |
| `fields()` | `req.files` object |

---

# 18. Common Errors

## 1. `Unexpected field`

Cause:

* Input name mismatch

Wrong:

```html
<input name="photo">
```

```js
upload.single("avatar")
```

---

## 2. `LIMIT_FILE_SIZE`

Cause:

* Uploaded file too large

---

## 3. File not uploading

Cause:

* Missing:

```html
enctype="multipart/form-data"
```

---

# 19. Error Handling

```js
app.post("/upload", (req, res) => {

    upload.single("avatar")(req, res, (err) => {

        if(err instanceof multer.MulterError) {
            return res.send(err.message);
        }

        if(err) {
            return res.send(err.message);
        }

        res.send("Success");

    });

});
```

([npm][1])

---

# 20. Serving Uploaded Files

```js
app.use("/uploads", express.static("uploads"));
```

Now files accessible via:

```txt
http://localhost:3000/uploads/file.jpg
```

---

# 21. Folder Structure

```txt
project/
│
├── uploads/
├── app.js
├── package.json
```

---

# 22. Real-world Usage

Multer is commonly used for:

* Profile picture upload
* Resume upload
* Product images
* PDF uploads
* Video uploads
* Cloud storage upload

---

# 23. Best Practices

## DO:

* Validate file type
* Limit file size
* Rename files uniquely
* Store uploads outside root if sensitive

## DON'T:

* Trust file extension only
* Allow unlimited uploads
* Store huge files in memory

---

# 24. Important Interview Questions

## Q1. Why use Multer?

To handle `multipart/form-data` and file uploads in Express.

---

## Q2. Difference between diskStorage and memoryStorage?

| diskStorage            | memoryStorage         |
| ---------------------- | --------------------- |
| Saves file on disk     | Saves in RAM          |
| Better for large files | Better for processing |
| Permanent              | Temporary             |

---

## Q3. What does `upload.single("avatar")` do?

Accepts ONE uploaded file from field `avatar`.

---

## Q4. Why enctype is required?

Without:

```html
multipart/form-data
```

files are not sent properly.

---

## Q5. Where does Multer store uploaded file info?

* `req.file`
* `req.files`

---

# 25. Complete Example (Most Important)

```js
const express = require("express");
const multer = require("multer");

const app = express();

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({

    storage,

    limits: {
        fileSize: 1024 * 1024 * 5
    },

    fileFilter: (req, file, cb) => {

        if(file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Images only"));
        }

    }

});

app.post("/upload", upload.single("avatar"), (req, res) => {

    res.json({
        message: "Uploaded",
        file: req.file
    });

});

app.listen(3000);
```

---

# 26. One-Line Revision

## Multer Flow

```txt
Form → multipart/form-data → Multer Middleware → req.file / req.files
```

---

# 27. Ultra-fast Recall Sheet

```txt
multer()              → create middleware
dest                  → upload folder
single()              → one file
array()               → many files
fields()              → many fields
none()                → text only
req.file              → single file data
req.files             → multiple files
diskStorage()         → save to disk
memoryStorage()       → save in RAM
fileFilter            → validate type
limits.fileSize       → size limit
multipart/form-data   → mandatory
```

---

# 28. Biggest Mistakes Beginners Make

* Forgetting `enctype`
* Field name mismatch
* No validation
* Using memory storage for large files
* Not handling errors
* Exposing uploads publicly

---

# 29. Mental Model

Think of Multer as:

```txt
Body-parser for FILES
```

Express parses JSON.
Multer parses uploaded files.

---

# 30. Final Exam Shortcut

If you forget everything:

```txt
Multer = Express middleware used to handle multipart/form-data and file uploads.
```

([npm][1])

[1]: https://www.npmjs.com/package/multer?utm_source=chatgpt.com "multer - npm"
