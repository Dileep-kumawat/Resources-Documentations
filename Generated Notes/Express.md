# Express.js

## 1. What is Express.js?

Express.js is a minimal backend framework built on top of Node.js for building:

* APIs
* Web servers
* Backend logic
* Middleware pipelines
* Authentication systems
* Full-stack applications

Think of it as:

> “A routing + middleware system for Node.js”

---

# 2. Why Express Exists

Without Express:

* You manually handle routes
* Parse requests manually
* Handle headers manually
* Write repetitive backend code

Express simplifies:

* Routing
* Request handling
* Middleware
* Error handling
* APIs

---

# 3. Installation

## Create Project

```bash
mkdir app
cd app
npm init -y
```

## Install Express

```bash
npm install express
```

---

# 4. Basic Server

```js
const express = require("express");

const app = express();

app.listen(3000, () => {
    console.log("Server running");
});
```

---

# 5. First Route

```js
app.get("/", (req, res) => {
    res.send("Hello");
});
```

---

# 6. Core Architecture

Express works mainly with:

| Component  | Purpose                     |
| ---------- | --------------------------- |
| app        | Main application            |
| req        | Incoming request            |
| res        | Response to client          |
| middleware | Functions between req & res |
| routes     | URL handlers                |

---

# 7. Request Object (`req`)

Contains client data.

## Common Properties

```js
req.params
req.query
req.body
req.headers
req.method
req.url
```

---

## Example

```js
app.get("/user/:id", (req, res) => {
    console.log(req.params.id);
});
```

If:

```bash
/user/45
```

Output:

```js
45
```

---

# 8. Response Object (`res`)

Used to send data back.

## Common Methods

```js
res.send()
res.json()
res.status()
res.redirect()
res.render()
```

---

## Examples

### Text

```js
res.send("Hello");
```

### JSON

```js
res.json({name: "Dileep"});
```

### Status

```js
res.status(404).send("Not found");
```

---

# 9. Routing

Routes define endpoints.

---

## GET

```js
app.get("/home", (req, res) => {
    res.send("GET request");
});
```

---

## POST

```js
app.post("/add", (req, res) => {
    res.send("POST request");
});
```

---

## PUT

```js
app.put("/update", (req, res) => {
    res.send("PUT request");
});
```

---

## DELETE

```js
app.delete("/delete", (req, res) => {
    res.send("DELETE request");
});
```

---

# 10. HTTP Methods Quick Recall

| Method | Purpose        |
| ------ | -------------- |
| GET    | Read data      |
| POST   | Create data    |
| PUT    | Update full    |
| PATCH  | Update partial |
| DELETE | Remove         |

---

# 11. Middleware (MOST IMPORTANT)

Middleware =
Functions executed before response.

This is the heart of Express.

---

## Middleware Flow

```txt
Request
   ↓
Middleware 1
   ↓
Middleware 2
   ↓
Route Handler
   ↓
Response
```

---

# 12. Middleware Syntax

```js
app.use((req, res, next) => {
    console.log("Middleware");
    next();
});
```

`next()` passes control forward.

Without `next()`:
request hangs.

---

# 13. Types of Middleware

| Type        | Purpose           |
| ----------- | ----------------- |
| Application | Entire app        |
| Router      | Specific router   |
| Built-in    | Express provided  |
| Error       | Handle errors     |
| Third-party | External packages |

---

# 14. Built-in Middleware

## JSON Parser

```js
app.use(express.json());
```

Required for:

```js
req.body
```

---

## URL Encoded

```js
app.use(express.urlencoded({extended: true}));
```

Used for forms.

---

# 15. Request Body Example

```js
app.use(express.json());

app.post("/user", (req, res) => {
    console.log(req.body);
    res.send("Received");
});
```

Input:

```json
{
  "name": "Dileep"
}
```

---

# 16. Route Parameters

```js
app.get("/product/:id", (req, res) => {
    res.send(req.params.id);
});
```

---

# 17. Query Parameters

URL:

```bash
/products?category=mobile
```

Code:

```js
req.query.category
```

---

# 18. Static Files

Serve CSS/images/frontend.

```js
app.use(express.static("public"));
```

---

# 19. Router (IMPORTANT)

Large apps separate routes.

---

## userRoutes.js

```js
const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("Users");
});

module.exports = router;
```

---

## server.js

```js
const userRoutes = require("./userRoutes");

app.use("/users", userRoutes);
```

---

# 20. Express Router Recall

```txt
app.use("/base", router)
```

Result:

```txt
/base/route
```

---

# 21. MVC Pattern

Large apps use MVC.

| Layer      | Purpose  |
| ---------- | -------- |
| Model      | Database |
| View       | UI       |
| Controller | Logic    |

---

# 22. Controllers

Move logic outside routes.

---

## controller.js

```js
exports.getUsers = (req, res) => {
    res.send("All users");
};
```

---

## route.js

```js
router.get("/", getUsers);
```

---

# 23. Error Handling Middleware

Special middleware with 4 params.

```js
app.use((err, req, res, next) => {
    res.status(500).send(err.message);
});
```

---

# 24. Custom Error Example

```js
app.get("/", (req, res) => {
    throw new Error("Something broke");
});
```

---

# 25. Async Error Handling

Bad:

```js
app.get("/", async (req, res) => {
    const data = await db();
});
```

If promise fails:
server crashes.

---

Better:

```js
try {
   // code
} catch(err) {
   next(err);
}
```

---

# 26. Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | OK           |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  | Server Error |

---

# 27. REST API Principles

REST =
Resource-based endpoints.

Bad:

```txt
/getUsers
```

Good:

```txt
/users
```

---

# 28. REST Structure

| Action  | Endpoint          |
| ------- | ----------------- |
| Get all | GET /users        |
| Get one | GET /users/:id    |
| Create  | POST /users       |
| Update  | PUT /users/:id    |
| Delete  | DELETE /users/:id |

---

# 29. Express JSON API Example

```js
app.use(express.json());

let users = [];

app.post("/users", (req, res) => {
    users.push(req.body);
    res.status(201).json(users);
});
```

---

# 30. Environment Variables

Install:

```bash
npm install dotenv
```

---

## Usage

```js
require("dotenv").config();

console.log(process.env.PORT);
```

---

# 31. Nodemon

Auto restart server.

Install:

```bash
npm install -D nodemon
```

Package.json:

```json
"scripts": {
  "dev": "nodemon server.js"
}
```

Run:

```bash
npm run dev
```

---

# 32. CORS

Cross-Origin Resource Sharing.

Install:

```bash
npm install cors
```

Use:

```js
const cors = require("cors");

app.use(cors());
```

---

# 33. Express + MongoDB Flow

Typical backend flow:

```txt
Client
 ↓
Route
 ↓
Controller
 ↓
Model
 ↓
MongoDB
```

---

# 34. Template Engines

Used for server-rendered pages.

Examples:

* EJS
* Pug
* Handlebars

---

## EJS Example

```js
app.set("view engine", "ejs");
```

Render:

```js
res.render("home");
```

---

# 35. Express Folder Structure

Good structure:

```txt
project/
│
├── routes/
├── controllers/
├── models/
├── middleware/
├── config/
├── public/
├── views/
├── .env
├── server.js
```

---

# 36. Authentication Basics

Usually:

* User logs in
* Server verifies
* JWT/session created

---

# 37. JWT Authentication

Install:

```bash
npm install jsonwebtoken
```

---

## Generate Token

```js
const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {id: 1},
    "secret",
    {expiresIn: "1h"}
);
```

---

## Verify Token

```js
jwt.verify(token, "secret");
```

---

# 38. Authentication Middleware

```js
const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).send("No token");
    }

    next();
};
```

---

# 39. Express vs Node.js

| Node.js       | Express        |
| ------------- | -------------- |
| Runtime       | Framework      |
| Low level     | Higher level   |
| Manual work   | Simplified     |
| Built-in HTTP | Better routing |

---

# 40. Common Packages

| Package      | Purpose          |
| ------------ | ---------------- |
| dotenv       | Env variables    |
| cors         | CORS handling    |
| mongoose     | MongoDB          |
| bcrypt       | Password hashing |
| jsonwebtoken | JWT              |
| nodemon      | Auto restart     |

---

# 41. Request Lifecycle (VERY IMPORTANT)

```txt
Client Request
   ↓
Express App
   ↓
Middleware
   ↓
Route Match
   ↓
Controller
   ↓
Database
   ↓
Response
```

---

# 42. Express Execution Order

Express runs code TOP → BOTTOM.

This causes many bugs.

Example:

```js
app.use(middleware);

app.get("/", handler);
```

Middleware executes first.

---

# 43. 404 Handler

```js
app.use((req, res) => {
    res.status(404).send("Route not found");
});
```

Must be LAST route.

---

# 44. Common Beginner Mistakes

| Mistake                    | Problem              |
| -------------------------- | -------------------- |
| Forget `next()`            | Request hangs        |
| Forget `express.json()`    | `req.body` undefined |
| Wrong route order          | Unexpected routes    |
| Sending multiple responses | Crash                |
| Not handling async errors  | Server crash         |

---

# 45. Full Minimal API

```js
const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Home");
});

app.post("/user", (req, res) => {
    res.json(req.body);
});

app.listen(3000, () => {
    console.log("Running");
});
```

---

# 46. Mental Model (Critical)

Understand Express like this:

```txt
Express =
Incoming Request
→ Middleware Pipeline
→ Route Match
→ Logic
→ Response
```

If this mental model is unclear:
you'll struggle in backend development.

---

# 47. Production Concepts

Eventually you'll learn:

* Rate limiting
* Security headers
* Logging
* Caching
* Validation
* File uploads
* WebSockets
* Reverse proxies
* Scaling

But don't pretend you need them now if fundamentals are weak.

Most beginners hide behind “advanced backend” tutorials while still not understanding middleware properly.

---

# 48. Interview-Level Questions

## Difference between app.use and app.get?

| app.use             | app.get       |
| ------------------- | ------------- |
| Any HTTP method     | Only GET      |
| Middleware mounting | Route handler |

---

## Why use middleware?

To:

* Validate
* Authenticate
* Log
* Transform requests

before route logic.

---

## What is stateless API?

Server stores no client session.

Each request contains all required data.

---

# 49. Express Learning Priority

Learn in this order:

1. Routing
2. req/res
3. Middleware
4. REST APIs
5. Router
6. MVC
7. MongoDB integration
8. Authentication
9. Error handling
10. Deployment

Most people jump to JWT and MongoDB before understanding middleware execution. That creates fake confidence.

---

# 50. Final Ultra-Short Recall Sheet

```txt
Express = Node.js backend framework

Core:
app
req
res
middleware
routes

Flow:
Request
→ Middleware
→ Route
→ Controller
→ Response

Important:
app.use()
express.json()
req.body
req.params
req.query
Router
MVC
Error middleware

REST:
GET
POST
PUT
DELETE

Must remember:
Middleware order matters
next() matters
express.json() matters
```

---

# 51. One Project That Forces Real Understanding

Build this yourself:

```txt
Auth API
├── Register
├── Login
├── JWT auth
├── CRUD notes
├── MongoDB
├── Error handling
├── Protected routes
```

If you can build that without copying tutorials blindly:
you actually understand Express.
