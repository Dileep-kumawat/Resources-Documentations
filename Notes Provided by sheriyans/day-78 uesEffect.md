
## `useEffect` in **React**

`useEffect` is a React Hook used to perform **side effects** in functional components, such as:

- API calls
- DOM updates
- Timers
- Event listeners

It replaces lifecycle methods like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`.

---

## Basic Syntax

```jsx
useEffect(() => {
// side effect code
}, [dependencies]);

```

- Callback → effect logic
- Dependency array → controls **when** the effect runs

---

### 1️⃣ No Dependency Array

```jsx
useEffect(() => {
console.log("Runs on every render");
});

```

- Runs after **every render**
- Rarely used (can hurt performance)

---

### 2️⃣ Empty Dependency Array `[]`

```jsx
useEffect(() => {
console.log("Runs once");
}, []);

```

**Meaning:**

Runs **only once**, after the first render.

**Equivalent to:** `componentDidMount`

**Common Uses:**

- Initial API call
- Setup logic
- Timers / event listeners

**Example:**

```jsx
useEffect(() => {
fetch("https://jsonplaceholder.typicode.com/users")
    .then(res => res.json())
    .then(data =>setUsers(data));
}, []);

```

---

### 3️⃣ With Dependencies `[value]`

```jsx
useEffect(() => {
console.log("Count changed");
}, [count]);

```

- Runs on first render
- Re-runs **only when `count` changes**

---

## Cleanup Function

```jsx
useEffect(() => {
const id =setInterval(() => {
console.log("Running...");
  },1000);

return() =>clearInterval(id);
}, []);

```

- Cleanup runs on unmount
- Prevents memory leaks

---

## Important Rules

- Include **all state and props** used inside `useEffect` in dependencies
- `[]` means “run once intentionally”
-
Displaying Day 78 Notes.md.