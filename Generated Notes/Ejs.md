# EJS (Embedded JavaScript) — Complete Recall Notes

## 1. What is EJS?

**EJS = Embedded JavaScript Templates**

It lets you generate **HTML dynamically** using JavaScript.

Instead of writing plain static HTML:

```html
<h1>Hello Dileep</h1>
```

You can inject data:

```ejs
<h1>Hello <%= name %></h1>
```

If:

```js
name = "Dileep"
```

Output becomes:

```html
<h1>Hello Dileep</h1>
```

---

# 2. Why EJS Exists

Without template engines:

* Backend sends raw HTML
* Hard to reuse layouts
* Hard to inject dynamic data
* Lots of string concatenation hell

EJS solves this by allowing:

* Variables
* Loops
* Conditions
* Reusable components
* Dynamic rendering

inside HTML.

---

# 3. Where EJS Runs

EJS is mostly used with:

* Node.js
* Express.js

Flow:

```text
Browser Request
      ↓
Express Route
      ↓
EJS Template + Data
      ↓
Rendered HTML
      ↓
Browser
```

---

# 4. Installation

Using npm:

```bash
npm install ejs
```

With Express:

```bash
npm install express ejs
```

---

# 5. Setup in Express

Basic setup:

```js
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.listen(3000);
```

This tells Express:

> "Use EJS for rendering views."

---

# 6. Folder Structure

Typical structure:

```text
project/
│
├── views/
│   ├── home.ejs
│   ├── about.ejs
│
├── app.js
```

`views/` is default folder for EJS files.

---

# 7. Rendering EJS

Route:

```js
app.get("/", (req, res) => {
    res.render("home");
});
```

This renders:

```text
views/home.ejs
```

No need to write `.ejs`.

---

# 8. Passing Data to EJS

Backend:

```js
app.get("/", (req, res) => {
    res.render("home", {
        name: "Dileep",
        age: 19
    });
});
```

EJS:

```ejs
<h1><%= name %></h1>
<p><%= age %></p>
```

Output:

```html
<h1>Dileep</h1>
<p>19</p>
```

---

# 9. EJS Tags (MOST IMPORTANT)

## A) `<%= %>` → Output Escaped HTML

Used to print values safely.

```ejs
<%= name %>
```

Escapes HTML.

Safe from XSS.

---

## B) `<%- %>` → Output Raw HTML

Does NOT escape HTML.

```ejs
<%- htmlContent %>
```

Dangerous if user input.

Use carefully.

---

## C) `<% %>` → Logic Only

No output.

Used for:

* loops
* conditions
* JS logic

Example:

```ejs
<% if(age >= 18){ %>
    <h1>Adult</h1>
<% } %>
```

---

## D) `<%# %>` → Comment

```ejs
<%# This is comment %>
```

Not visible in browser.

---

# 10. Conditions in EJS

Example:

```ejs
<% if(isLoggedIn){ %>
    <h1>Welcome</h1>
<% } else { %>
    <h1>Please Login</h1>
<% } %>
```

---

# 11. Loops in EJS

## forEach Loop

```ejs
<% users.forEach(user => { %>
    <li><%= user %></li>
<% }) %>
```

If:

```js
users = ["Dileep", "Ram", "Sam"]
```

Output:

```html
<li>Dileep</li>
<li>Ram</li>
<li>Sam</li>
```

---

# 12. Full Example

## Backend

```js
app.get("/", (req, res) => {
    const users = ["Dileep", "Ram", "Sam"];

    res.render("home", { users });
});
```

## home.ejs

```ejs
<h1>User List</h1>

<ul>
    <% users.forEach(user => { %>
        <li><%= user %></li>
    <% }) %>
</ul>
```

---

# 13. Includes (Reusable Components)

Huge feature.

Avoid repeating:

* navbar
* footer
* sidebar

---

## navbar.ejs

```ejs
<nav>
    <h1>My Website</h1>
</nav>
```

---

## home.ejs

```ejs
<%- include("navbar") %>

<h1>Home Page</h1>
```

---

# 14. Partials

Partials = reusable EJS chunks.

Typical structure:

```text
views/
│
├── partials/
│   ├── navbar.ejs
│   ├── footer.ejs
```

Usage:

```ejs
<%- include("partials/navbar") %>
```

---

# 15. Dynamic HTML Attributes

```ejs
<input type="text" value="<%= username %>">
```

---

# 16. Using JS Inside EJS

You can write normal JS.

```ejs
<%
let total = price * quantity;
%>

<h1><%= total %></h1>
```

---

# 17. Sending Arrays

Backend:

```js
res.render("home", {
    fruits: ["apple", "banana"]
});
```

EJS:

```ejs
<% fruits.forEach(fruit => { %>
    <p><%= fruit %></p>
<% }) %>
```

---

# 18. Sending Objects

Backend:

```js
res.render("profile", {
    user: {
        name: "Dileep",
        age: 19
    }
});
```

EJS:

```ejs
<h1><%= user.name %></h1>
```

---

# 19. Template Rendering Flow

```text
Client Request
    ↓
Express Route
    ↓
res.render()
    ↓
EJS combines:
    HTML + Data + JS
    ↓
Final HTML
    ↓
Browser
```

---

# 20. EJS vs HTML

| HTML          | EJS        |
| ------------- | ---------- |
| Static        | Dynamic    |
| No JS inside  | JS inside  |
| No variables  | Variables  |
| No loops      | Loops      |
| No conditions | Conditions |

---

# 21. EJS vs React

This confuses beginners constantly.

## EJS

* Server-side rendering
* HTML generated on server
* Simpler
* Good for CRUD apps
* SEO friendly

## React

* Client-side rendering
* Runs in browser
* Component-based SPA
* More interactive

---

# 22. Escaping vs Non-Escaping

## Safe

```ejs
<%= userInput %>
```

Converts:

```html
<script>
```

into harmless text.

---

## Unsafe

```ejs
<%- userInput %>
```

Actually renders HTML/script.

Potential XSS vulnerability.

---

# 23. Common Mistakes

## Mistake 1: Forgetting `view engine`

```js
app.set("view engine", "ejs");
```

---

## Mistake 2: Wrong include syntax

Wrong:

```ejs
<% include navbar %>
```

Correct:

```ejs
<%- include("navbar") %>
```

---

## Mistake 3: Using `.ejs` in render

Wrong:

```js
res.render("home.ejs")
```

Correct:

```js
res.render("home")
```

---

## Mistake 4: Missing `views` folder

Express expects:

```text
views/
```

by default.

---

# 24. Layouts in EJS

EJS itself has no built-in layouts.

People use:

```bash
npm install express-ejs-layouts
```

or manually use includes.

---

# 25. Static Files with EJS

For CSS/images/js:

```js
app.use(express.static("public"));
```

Structure:

```text
public/
│
├── css/
├── js/
├── images/
```

---

# 26. Example with CSS

```html
<link rel="stylesheet" href="/css/style.css">
```

---

# 27. Mini Project Structure

```text
project/
│
├── views/
│   ├── partials/
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   │
│   ├── home.ejs
│   └── about.ejs
│
├── public/
│   ├── css/
│
├── app.js
```

---

# 28. Real Use Cases

EJS is commonly used for:

* Admin dashboards
* Blog apps
* CRUD apps
* Authentication systems
* Server-rendered websites
* Small/medium projects

---

# 29. Advantages

## Pros

* Very easy
* Just HTML + JS
* Fast learning curve
* Great with Express
* SEO friendly
* Lightweight

---

# 30. Disadvantages

## Cons

* Not ideal for huge frontend apps
* Mixing JS + HTML can become messy
* Less component power than React/Vue
* Limited frontend interactivity

---

# 31. Most Important Methods

## res.render()

Render EJS file.

```js
res.render("home")
```

---

## include()

Reuse templates.

```ejs
<%- include("partials/navbar") %>
```

---

# 32. Core Syntax Cheat Sheet

## Print variable

```ejs
<%= variable %>
```

---

## Raw HTML

```ejs
<%- html %>
```

---

## JS Logic

```ejs
<% code %>
```

---

## If Condition

```ejs
<% if(condition){ %>

<% } %>
```

---

## Loop

```ejs
<% array.forEach(item => { %>

<% }) %>
```

---

## Include File

```ejs
<%- include("file") %>
```

---

# 33. One Complete Working Example

## app.js

```js
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {

    const users = [
        "Dileep",
        "Ram",
        "Sam"
    ];

    res.render("home", { users });
});

app.listen(3000);
```

---

## views/home.ejs

```ejs
<!DOCTYPE html>
<html>

<head>
    <title>EJS Demo</title>
</head>

<body>

<h1>User List</h1>

<ul>
    <% users.forEach(user => { %>
        <li><%= user %></li>
    <% }) %>
</ul>

</body>
</html>
```

---

# 34. Interview-Level Understanding

If someone asks:

> "How does EJS work internally?"

Answer:

```text
EJS takes a template file,
injects data into placeholders,
executes embedded JavaScript,
and converts everything into final HTML
which Express sends to browser.
```

---

# 35. Fast Recall Summary

## EJS = HTML + JavaScript + Dynamic Data

### Main syntax:

```ejs
<%= %>   → print value
<%- %>   → raw HTML
<% %>    → JS logic
<%# %>   → comment
```

### Main features:

* Variables
* Loops
* Conditions
* Includes
* Dynamic rendering

### Main method:

```js
res.render()
```

### Main use:

Server-side rendered Node.js apps.

---

# 36. Mental Model (IMPORTANT)

Think of EJS as:

```text
HTML template
+
JavaScript logic
+
Data from backend
=
Final HTML page
```

That’s the whole thing.

Most beginners overcomplicate template engines because they memorize syntax without understanding the rendering flow. The rendering flow is the real concept.
