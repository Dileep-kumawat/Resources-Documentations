# Morgan Logger — Complete Recall Notes (Express.js)

## What is Morgan?

`morgan` is an HTTP request logger middleware for Node.js + Express.

It logs incoming requests automatically.

Used for:

* Debugging
* Monitoring traffic
* Tracking API usage
* Error investigation

Official package:

[Morgan npm package](https://www.npmjs.com/package/morgan?utm_source=chatgpt.com)

---

# 1. Installation

```bash
npm install morgan
```

---

# 2. Basic Setup

```js
const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));

app.listen(3000);
```

---

# 3. How Morgan Works

Flow:

```text
Client Request
     ↓
Morgan Middleware Logs Request
     ↓
Express Route Handles Request
     ↓
Response Sent
```

Morgan intercepts request/response info and prints logs.

---

# 4. Common Formats (VERY IMPORTANT)

## A) dev

Best for development.

```js
app.use(morgan("dev"));
```

Output:

```bash
GET /users 200 15ms
```

Features:

* Colored status codes
* Short output
* Easy debugging

---

## B) tiny

Minimal logging.

```js
app.use(morgan("tiny"));
```

Example:

```bash
GET /users 200 - - 5 ms
```

---

## C) combined

Apache-style detailed logs.

```js
app.use(morgan("combined"));
```

Example:

```bash
::1 - - [08/May/2026:10:00:00 +0000] "GET /users HTTP/1.1" 200 123
```

Used in production.

---

## D) common

Less detailed than combined.

```js
app.use(morgan("common"));
```

---

## E) short

Shorter than common.

```js
app.use(morgan("short"));
```

---

# 5. Most Used Tokens (HIGH VALUE)

Morgan uses **tokens**.

Tokens = placeholders for request data.

| Token                  | Meaning       |
| ---------------------- | ------------- |
| `:method`              | HTTP method   |
| `:url`                 | Request URL   |
| `:status`              | Status code   |
| `:response-time`       | Time taken    |
| `:date`                | Current date  |
| `:res[content-length]` | Response size |
| `:remote-addr`         | Client IP     |

---

# 6. Custom Format

VERY IMPORTANT in interviews.

```js
app.use(
  morgan(":method :url :status :response-time ms")
);
```

Output:

```bash
GET /api/users 200 12 ms
```

---

# 7. Creating Custom Tokens

## Syntax

```js
morgan.token("name", callback);
```

## Example

```js
morgan.token("id", (req) => {
  return req.headers["x-request-id"];
});

app.use(
  morgan(":id :method :url")
);
```

Output:

```bash
abc123 GET /users
```

---

# 8. Save Logs to File

Production apps usually store logs.

```js
const fs = require("fs");
const path = require("path");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", {
  stream: accessLogStream
}));
```

---

# 9. Skip Logging

Useful for:

* Health checks
* Static files
* Successful responses only

Example:

```js
app.use(
  morgan("dev", {
    skip: (req, res) => res.statusCode < 400
  })
);
```

Logs only errors.

---

# 10. Morgan + Express Flow (IMPORTANT)

Middleware order matters.

## Correct

```js
app.use(morgan("dev"));
app.use(express.json());
```

Morgan should usually come early.

---

# 11. Morgan in Production

Development:

```js
morgan("dev")
```

Production:

```js
morgan("combined")
```

Why?

* More details
* Better auditing
* Better debugging

---

# 12. Morgan vs Winston (COMMON CONFUSION)

| Morgan              | Winston                |
| ------------------- | ---------------------- |
| HTTP request logger | General logging system |
| Logs requests only  | Logs anything          |
| Middleware          | Full logger library    |
| Simple              | Advanced               |

Reality:

* Serious apps often use BOTH.

Example:

* Morgan → API requests
* Winston → App errors/events

---

# 13. Typical Real Project Setup

```js
const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(3000);
```

---

# 14. Important Interview Questions

## Q1: Why use Morgan?

To automatically log HTTP requests.

---

## Q2: Is Morgan middleware?

Yes.

---

## Q3: Difference between Morgan and console.log?

Morgan:

* Structured logs
* Automatic request details
* Better debugging

console.log:

* Manual logging only

---

## Q4: Can Morgan write logs to files?

Yes, using streams.

---

## Q5: Can we create custom log formats?

Yes.

---

# 15. Most Important Things to Remember

## Core Idea

> Morgan logs HTTP requests in Express apps.

---

## Golden Syntax

```js
app.use(morgan("dev"));
```

---

## Custom Format

```js
morgan(":method :url :status")
```

---

## Custom Token

```js
morgan.token("name", callback)
```

---

## Save Logs

```js
stream: accessLogStream
```

---

# 16. Quick Memory Revision Sheet

```text
Morgan
│
├── Express middleware
├── Logs HTTP requests
│
├── Install
│   └── npm install morgan
│
├── Basic
│   └── app.use(morgan("dev"))
│
├── Formats
│   ├── dev
│   ├── tiny
│   ├── combined
│   ├── common
│   └── short
│
├── Tokens
│   ├── :method
│   ├── :url
│   ├── :status
│   └── :response-time
│
├── Custom format
│   └── morgan(":method :url")
│
├── Custom token
│   └── morgan.token()
│
├── Save logs
│   └── stream
│
└── Skip logs
    └── skip()
```

---

# 17. One-Line Summary

> Morgan is an Express middleware that automatically logs HTTP requests using predefined or custom formats.
