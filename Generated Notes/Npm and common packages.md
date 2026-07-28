# NPM + Common Packages in Full-Stack Web Development

*A compact recall sheet for fast revision and real-world understanding.*

---

# 1. What is NPM?

## NPM = Node Package Manager

Used to:

* Install libraries/packages
* Manage dependencies
* Run scripts
* Share reusable code

It comes with:

* **Node.js**
* CLI command: `npm`

---

# 2. Core Concepts

| Concept             | Meaning                         |
| ------------------- | ------------------------------- |
| Package             | Reusable code/library           |
| Dependency          | Package your app needs          |
| `package.json`      | Project metadata + dependencies |
| `node_modules`      | Installed packages folder       |
| `package-lock.json` | Exact dependency versions       |
| Script              | Custom commands (`npm run`)     |

---

# 3. Important Files

## `package.json`

Main project config.

Example:

```json
{
  "name": "myapp",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

---

## `package-lock.json`

Locks exact versions.

Why important:

* Prevents “works on my machine” problems
* Ensures same installs everywhere

---

## `node_modules`

Contains installed packages.

Never manually edit it.

Usually ignored in Git:

```gitignore
node_modules
```

---

# 4. Basic NPM Commands

## Initialize Project

```bash
npm init
```

Quick version:

```bash
npm init -y
```

---

## Install Package

```bash
npm install express
```

Shortcut:

```bash
npm i express
```

---

## Install Dev Dependency

Used only during development.

```bash
npm install nodemon --save-dev
```

Shortcut:

```bash
npm i -D nodemon
```

---

## Remove Package

```bash
npm uninstall express
```

---

## Install All Dependencies

```bash
npm install
```

Reads `package.json`.

---

## Run Scripts

```bash
npm run dev
```

Special scripts:

```bash
npm start
npm test
```

---

## Update Packages

```bash
npm update
```

---

# 5. Dependency Types

## Dependencies

Needed in production.

Example:

* express
* react

Stored in:

```json
"dependencies"
```

---

## Dev Dependencies

Needed only for development.

Example:

* nodemon
* eslint
* prettier

Stored in:

```json
"devDependencies"
```

---

# 6. Semantic Versioning (VERY IMPORTANT)

Example:

```json
"express": "^4.18.2"
```

Format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
4.18.2
```

| Part  | Meaning          |
| ----- | ---------------- |
| Major | Breaking changes |
| Minor | New features     |
| Patch | Bug fixes        |

---

## Symbols

### Caret `^`

```json
^4.18.2
```

Allows:

* minor
* patch updates

NOT major updates.

---

### Tilde `~`

```json
~4.18.2
```

Allows only patch updates.

---

# 7. NPX

Runs packages without globally installing.

Example:

```bash
npx create-react-app myapp
```

Useful for:

* Temporary tools
* Scaffolding projects

---

# 8. Global Packages

Installed system-wide.

Example:

```bash
npm install -g nodemon
```

Use carefully.
Global clutter becomes a mess fast.

---

# 9. Commonly Used Packages (Most Important Section)

---

# BACKEND PACKAGES

# 10. Express

Most popular Node.js backend framework.

Install:

```bash
npm i express
```

Used for:

* APIs
* Routing
* Middleware
* Servers

Basic Example:

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(3000);
```

Recall:

> Express = Backend framework for Node.js

---

# 11. Nodemon

Automatically restarts server on file changes.

Install:

```bash
npm i -D nodemon
```

Usage:

```json
"scripts": {
  "dev": "nodemon index.js"
}
```

Run:

```bash
npm run dev
```

Recall:

> Nodemon = Auto restart server

---

# 12. dotenv

Loads environment variables.

Install:

```bash
npm i dotenv
```

`.env`

```env
PORT=5000
DB_URL=xyz
```

Use:

```js
require("dotenv").config();

console.log(process.env.PORT);
```

Recall:

> dotenv = Secret/config manager

---

# 13. mongoose

MongoDB ODM for Node.js.

Install:

```bash
npm i mongoose
```

Used for:

* Schemas
* Models
* MongoDB queries

Example:

```js
const mongoose = require("mongoose");

mongoose.connect(DB_URL);
```

Recall:

> Mongoose = MongoDB toolkit

---

# 14. jsonwebtoken (JWT)

Authentication tokens.

Install:

```bash
npm i jsonwebtoken
```

Use:

```js
jwt.sign()
jwt.verify()
```

Recall:

> JWT = Login token authentication

---

# 15. bcrypt / bcryptjs

Password hashing.

Install:

```bash
npm i bcryptjs
```

Example:

```js
bcrypt.hash(password, 10)
```

Recall:

> bcrypt = Encrypt passwords

---

# 16. cors

Allows frontend-backend communication.

Install:

```bash
npm i cors
```

Example:

```js
app.use(cors());
```

Recall:

> CORS fixes cross-origin restrictions

---

# 17. multer

Handles file uploads.

Install:

```bash
npm i multer
```

Used for:

* Images
* PDFs
* Media uploads

Recall:

> Multer = File upload middleware

---

# 18. axios

HTTP request library.

Install:

```bash
npm i axios
```

Example:

```js
axios.get("/api")
```

Recall:

> Axios = API requests

---

# 19. socket.io

Real-time communication.

Install:

```bash
npm i socket.io
```

Used for:

* Chat apps
* Live updates
* Multiplayer apps

Recall:

> Socket.io = Real-time apps

---

# 20. Prisma

Modern database ORM.

Install:

```bash
npm i prisma
```

Features:

* Type safety
* SQL support
* Easy migrations

Recall:

> Prisma = Modern database ORM

---

# FRONTEND PACKAGES

# 21. React

Frontend library.

Install:

```bash
npm i react
```

Used for:

* Components
* SPA apps
* UI rendering

Recall:

> React = Component-based frontend

---

# 22. React Router

Client-side routing.

Install:

```bash
npm i react-router-dom
```

Used for:

* Page navigation
* Routes

Recall:

> React Router = Frontend navigation

---

# 23. Redux Toolkit

State management.

Install:

```bash
npm i @reduxjs/toolkit react-redux
```

Used for:

* Global state
* Complex apps

Recall:

> Redux = App-wide state manager

---

# 24. Tailwind CSS

Utility-first CSS framework.

Install:

```bash
npm i -D tailwindcss
```

Example:

```html
<div class="bg-black text-white">
```

Recall:

> Tailwind = Utility CSS

---

# 25. Framer Motion

Animations.

Install:

```bash
npm i framer-motion
```

Recall:

> Framer Motion = React animations

---

# 26. React Hook Form

Form handling.

Install:

```bash
npm i react-hook-form
```

Recall:

> RHF = Performant forms

---

# 27. Zod

Validation library.

Install:

```bash
npm i zod
```

Used for:

* Form validation
* API validation

Recall:

> Zod = Type-safe validation

---

# 28. TanStack Query (React Query)

Server state management.

Install:

```bash
npm i @tanstack/react-query
```

Used for:

* API caching
* Fetching
* Synchronization

Recall:

> React Query = Smart API state

---

# FULL STACK / TOOLING PACKAGES

# 29. Vite

Fast frontend build tool.

Create app:

```bash
npm create vite@latest
```

Recall:

> Vite = Fast development server

---

# 30. TypeScript

Typed JavaScript.

Install:

```bash
npm i typescript
```

Benefits:

* Better autocomplete
* Fewer bugs
* Safer code

Recall:

> TypeScript = Safer JS

---

# 31. ESLint

Code quality checker.

Install:

```bash
npm i -D eslint
```

Recall:

> ESLint = Finds code problems

---

# 32. Prettier

Auto formatting.

Install:

```bash
npm i -D prettier
```

Recall:

> Prettier = Code formatter

---

# 33. concurrently

Runs multiple scripts together.

Install:

```bash
npm i concurrently
```

Example:

```json
"dev": "concurrently \"npm run server\" \"npm run client\""
```

Recall:

> concurrently = Run many scripts

---

# 34. cross-env

Cross-platform environment variables.

Install:

```bash
npm i cross-env
```

Recall:

> cross-env = Windows/Linux env compatibility

---

# TESTING PACKAGES

# 35. Jest

Testing framework.

Install:

```bash
npm i -D jest
```

Recall:

> Jest = JavaScript testing

---

# 36. Cypress

End-to-end testing.

Install:

```bash
npm i cypress
```

Recall:

> Cypress = Browser testing

---

# API DEVELOPMENT TOOLS

# 37. Swagger

API documentation.

Install:

```bash
npm i swagger-ui-express
```

Recall:

> Swagger = API docs

---

# 38. Morgan

HTTP request logger.

Install:

```bash
npm i morgan
```

Recall:

> Morgan = Request logs

---

# 39. Helmet

Security middleware.

Install:

```bash
npm i helmet
```

Recall:

> Helmet = Secure Express apps

---

# Common Real-World Stack

## MERN Stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | React      |
| Backend  | Express    |
| Runtime  | Node.js    |
| Database | MongoDB    |

Usually includes:

* JWT
* bcrypt
* mongoose
* axios
* dotenv

---

# Typical Folder Structure

```text
project/
│
├── client/
├── server/
│
├── package.json
├── .env
├── node_modules/
```

---

# Important Scripts Example

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js",
  "build": "vite build"
}
```

---

# Common Beginner Mistakes

## 1. Installing everything globally

Bad habit.

Prefer local installs.

---

## 2. Uploading `.env`

Never commit secrets.

Use:

```gitignore
.env
```

---

## 3. Ignoring package versions

Random updates can break projects.

---

## 4. Confusing dependencies vs devDependencies

Production server doesn’t need:

* eslint
* prettier
* nodemon

---

## 5. Blindly copying packages

Most beginners install:

* 50 packages
* understand 3

Bad engineering.

Every dependency:

* increases attack surface
* increases maintenance
* increases bundle size

---

# Fast Recall Map

```text
npm
 ├── install packages
 ├── manage dependencies
 ├── run scripts
 └── publish packages

Backend:
 ├── express
 ├── mongoose
 ├── dotenv
 ├── jwt
 ├── bcrypt
 └── cors

Frontend:
 ├── react
 ├── router
 ├── redux
 ├── tailwind
 └── react-query

Tooling:
 ├── vite
 ├── typescript
 ├── eslint
 └── prettier
```

---

# 10-Minute Revision Strategy

## Memorize in groups:

### Backend

* express
* mongoose
* jwt
* bcrypt
* dotenv

### Frontend

* react
* router
* redux
* tailwind

### Tooling

* vite
* typescript
* eslint

### Testing

* jest
* cypress

That’s enough to understand most modern full-stack tutorials.

---

# Final Reality Check

Most people waste time memorizing package names instead of understanding:

* WHY the package exists
* WHAT problem it solves
* WHEN not to use it

You only truly know a package if you can answer:

1. What problem does it solve?
2. What happens without it?
3. What are the alternatives?
4. What tradeoff does it introduce?

That’s the difference between tutorial-following and actual engineering.
