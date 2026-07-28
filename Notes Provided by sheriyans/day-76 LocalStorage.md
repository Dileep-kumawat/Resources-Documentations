
# Local Storage (Web Storage API)

**Local Storage** is a browser-based storage mechanism that allows web applications to store data **permanently** in the user's browser.

- Data is stored as **key-value pairs**
- Data **does not expire automatically**
- Data remains even after:
  - Browser refresh
  - Browser close
  - System restart

Local Storage is part of the **Web Storage API**.

| Feature       | Description          |
|---------------|----------------------|
| Storage Type  | Key-Value pairs      |
| Data Type     | **Only strings**     |
| Capacity      | ~5-10 MB             |
| Scope         | Per domain           |
| Expiry        | Never (until manually cleared) |

## Basic Local Storage Methods

### 1. `setItem()` → Store data

```javascript
localStorage.setItem("name", "Anubhav");
```

- `"name"` → key
- `"Anubhav"` → value (string)

---

### 2. `getItem()` → Retrieve data

```javascript
const name = localStorage.getItem("name");
console.log(name);
```

Returns the value of the key or `null` if not found.

---

### 3. `removeItem()` → Remove a specific key

```javascript
localStorage.removeItem("name");
```

---

### 4. `clear()` → Remove all data

```javascript
localStorage.clear();
```

---

## Storing Objects in Local Storage

### Problem:

Local Storage **cannot store objects directly**.

If you try:

```javascript
localStorage.setItem("user", {name: "Anubhav", age: 24});
```

This will store:

```
[object Object]
```

### Solution: `JSON.stringify()`

### Step 1: Convert object to string

```javascript
const user = {
  name: "Anubhav",
  age: 24,
  role: "Developer"
};

localStorage.setItem("user", JSON.stringify(user));
```

---

### Getting Object Back from Local Storage

### Step 2: Convert string back to object

```javascript
const storedUser = JSON.parse(localStorage.getItem("user"));
console.log(storedUser.name);
```

- `JSON.parse()` converts JSON string → JavaScript object

---

## Storing Arrays in Local Storage

### Example Array

```javascript
const skills = ["HTML", "CSS", "JavaScript", "React"];
```

### Store Array

```javascript
localStorage.setItem("skills", JSON.stringify(skills));
```

---

### Retrieve Array

```javascript
const storedSkills = JSON.parse(localStorage.getItem("skills"));
console.log(storedSkills[2]); // JavaScript
```

---

## Summary: Object & Array Storage Flow

```
JS Object/Array
      ↓
JSON.stringify()
      ↓
Local Storage (String)
      ↓
JSON.parse()
      ↓
JS Object/Array
```

## Comparison: Local Storage vs Session Storage vs Cookies

- **Local Storage:** A browser storage that permanently saves key-value data on the client side, used to store user preferences and cached data.
- **Session Storage:** A browser storage that saves data only for the active tab session, used for temporary data like form states or step-wise workflows.
- **Cookies:** Small pieces of data stored in the browser and sent with every server request, used mainly for authentication, tracking, and server-side state management.

| Feature          | Local Storage          | Session Storage        | Cookies                  |
|------------------|------------------------|------------------------|--------------------------|
| Data Lifetime    | Permanent until manually cleared | Exists until browser tab is closed | Expires based on set time |
| Storage Capacity | ~5-10 MB               | ~5 MB                  | ~4 KB                    |
| Data Scope       | Per domain             | Per tab (same origin)  | Sent with every HTTP request |
| Data Type        | Strings only           | Strings only           | Strings only             |
| Server Access    | Not sent to server     | Not sent to server     | Automatically sent to server |
| Performance Impact | Fast (client-side only) | Fast (client-side only) | Slower due to request overhead |
| Typical Use Case | Theme, preferences, cached data | Temporary form/session data | Authentication, tracking |


**One-line summary:**

- **Local Storage:** Best for long-term client-side data.
- **Session Storage:** Best for short-lived, tab-specific data.
- **Cookies:** Best when data must be shared with the server.

## React Fragments

A **Fragment** allows you to group multiple JSX elements **without adding extra nodes to the DOM**.

In React, a component must return **a single parent element**.

Fragments solve this limitation cleanly.

### Syntax (`<> </>`)

```javascript
return (
  <>
    <h1>Hello</h1>
    <p>Welcome</p>
  </>
);
```

This is the **most commonly used** approach.

## Advantages of Fragments

- No extra DOM elements
- Cleaner HTML structure
- Better performance
- Helps with table layouts (`<tr>`, `<td>`)
- Improves semantic correctness

---

## When to Use Fragments?

Use fragments when:

- You need multiple elements returned
- You want clean DOM
- You are rendering lists
- You want semantic HTML without wrapper divs
Displaying Day 76 Notes.md.