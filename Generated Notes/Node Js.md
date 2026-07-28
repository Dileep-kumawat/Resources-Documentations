## 1. Introduction to Node.js

### What is Node.js?

* Runtime environment that executes JavaScript **outside the browser**.
* Built on **Google Chrome’s V8 Engine**.
* Mainly used for:

  * Backend servers
  * APIs
  * Real-time apps
  * CLI tools
  * Automation scripts

---

## Why Node.js Became Popular

### Traditional Server Model

* One request = one thread
* Many users = heavy memory usage

### Node.js Model

* **Single-threaded**
* Uses **Event Loop**
* Handles many requests asynchronously

### Result

* Fast
* Scalable
* Efficient for I/O-heavy apps

---

# Event-Driven + Non-Blocking I/O

## Blocking Example

```js
const data = fs.readFileSync("file.txt");
console.log(data.toString());
console.log("Done");
```

* Program waits until file finishes reading.

---

## Non-Blocking Example

```js
fs.readFile("file.txt", (err, data) => {
  console.log(data.toString());
});

console.log("Done");
```

### Output

```txt
Done
(file content later)
```

### Why?

Node continues execution while file reads in background.

---

# Event Loop (Core Concept)

Node continuously checks:

1. Is there a task?
2. Is callback ready?
3. Execute callback

### Example

```js
setTimeout(() => {
  console.log("Timer Done");
}, 2000);

console.log("Start");
```

### Output

```txt
Start
Timer Done
```

---

# npm (Node Package Manager)

## What is npm?

Default package manager for Node.js.

Used to:

* Install packages
* Manage dependencies
* Run scripts

---

## Important Commands

### Initialize Project

```bash
npm init
```

### Install Package

```bash
npm install express
```

Shortcut:

```bash
npm i express
```

### Install Dev Dependency

```bash
npm install nodemon --save-dev
```

---

## package.json

Stores:

* Project info
* Scripts
* Dependencies

Example:

```json
{
  "name": "app",
  "scripts": {
    "start": "node index.js"
  }
}
```

---

# CommonJS Modules

Node uses:

```js
require()
module.exports
```

---

## Export Example

### math.js

```js
function add(a, b) {
  return a + b;
}

module.exports = add;
```

---

## Import Example

### app.js

```js
const add = require("./math");

console.log(add(2, 3));
```

---

# Module Types

| Type                | Purpose             |
| ------------------- | ------------------- |
| Core Modules        | Built into Node     |
| Local Modules       | Your own files      |
| Third-party Modules | Installed using npm |

---

# 2. Core Modules

# fs Module (File System)

Used for:

* Reading files
* Writing files
* Creating/deleting files

---

## Import

```js
const fs = require("fs");
```

---

## Read File

```js
fs.readFile("data.txt", "utf8", (err, data) => {
  console.log(data);
});
```

---

## Write File

```js
fs.writeFile("data.txt", "Hello", (err) => {
  console.log("Written");
});
```

---

## Append File

```js
fs.appendFile("data.txt", "\nNew Line", () => {});
```

---

# http Module

Creates web servers.

---

## Basic Server

```js
const http = require("http");

const server = http.createServer((req, res) => {
  res.write("Hello");
  res.end();
});

server.listen(3000);
```

---

## Important Methods

| Method         | Purpose          |
| -------------- | ---------------- |
| createServer() | Create server    |
| listen()       | Start server     |
| req            | Incoming request |
| res            | Send response    |

---

# path Module

Used to work with file paths safely.

---

## Import

```js
const path = require("path");
```

---

## Important Methods

### Join Paths

```js
path.join(__dirname, "files", "data.txt");
```

### File Extension

```js
path.extname("app.js");
```

### Base Name

```js
path.basename("/users/app.js");
```

---

# os Module

Interact with operating system.

---

## Examples

```js
const os = require("os");

console.log(os.platform());
console.log(os.arch());
console.log(os.cpus());
console.log(os.freemem());
```

---

# 3. Streams & Buffers

# Buffers

Used to store binary data temporarily.

Example:

```js
const buffer = Buffer.from("Hello");
console.log(buffer);
```

Useful for:

* File handling
* Images
* Videos
* Network data

---

# Streams

Streams process data **piece by piece** instead of loading everything into memory.

Useful for:

* Large files
* Video streaming
* Data transfer

---

# Types of Streams

| Stream    | Purpose      |
| --------- | ------------ |
| Readable  | Read data    |
| Writable  | Write data   |
| Duplex    | Read + Write |
| Transform | Modify data  |

---

# Read Stream Example

```js
const fs = require("fs");

const readStream = fs.createReadStream("big.txt", "utf8");

readStream.on("data", (chunk) => {
  console.log(chunk);
});
```

---

# Write Stream Example

```js
const writeStream = fs.createWriteStream("output.txt");

writeStream.write("Hello");
```

---

# Pipe Method

Connect streams directly.

```js
readStream.pipe(writeStream);
```

Efficient because:

* Less memory usage
* Faster processing

---

# 4. Environment Variables

Used to store:

* API keys
* Database passwords
* Config values

Never hardcode secrets.

---

# dotenv Package

Install:

```bash
npm install dotenv
```

---

# Create `.env`

```env
PORT=5000
DB_PASSWORD=secret
```

---

# Use Environment Variables

```js
require("dotenv").config();

console.log(process.env.PORT);
```

---

# Why Use Environment Variables?

| Benefit     | Reason                |
| ----------- | --------------------- |
| Security    | Hide secrets          |
| Flexibility | Different configs     |
| Deployment  | Easy production setup |

---

# Most Important Concepts to Remember

## 1. Node.js is asynchronous

* Doesn’t wait for tasks to finish.
* Uses callbacks/events/promises.

---

## 2. Event Loop is everything

Node survives high traffic because of:

* Event loop
* Non-blocking I/O

---

## 3. Streams save memory

Large files should use streams instead of loading fully.

---

## 4. npm ecosystem is huge

Most functionality comes from packages.

---

# Quick Recall Cheatsheet

| Topic            | Key Idea                   |
| ---------------- | -------------------------- |
| Node.js          | JS runtime outside browser |
| V8 Engine        | Executes JS                |
| Non-blocking I/O | Doesn’t wait               |
| Event Loop       | Handles async tasks        |
| npm              | Package manager            |
| require()        | Import module              |
| module.exports   | Export module              |
| fs               | File operations            |
| http             | Create server              |
| path             | File path utilities        |
| os               | System information         |
| Buffer           | Binary data                |
| Stream           | Process data in chunks     |
| dotenv           | Load env variables         |
| process.env      | Access env variables       |

---

# Mini Interview Questions

### Why is Node.js fast?

Because of:

* V8 engine
* Event loop
* Non-blocking architecture

---

### Difference between synchronous and asynchronous?

| Sync     | Async        |
| -------- | ------------ |
| Waits    | Doesn’t wait |
| Blocking | Non-blocking |

---

### Why use streams?

To handle large files efficiently with low memory usage.

---

### What is CommonJS?

Node’s module system using:

```js
require()
module.exports
```

---

# One-Line Summary

> Node.js = JavaScript runtime using an event-driven, non-blocking architecture for scalable backend applications.
