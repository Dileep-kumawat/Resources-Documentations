
## Context API in React

The **Context API** is a built-in React mechanism used to **share data globally** across components **without passing props manually at every level**.

### Problem it solves: *Prop Drilling*

Prop drilling happens when data is passed:

```
App → ComponentA → ComponentB → ComponentC

```

Even though only `ComponentC` needs the data.

Context API allows:

```
App (Provider) → ComponentC (Consumer)

```

---

## 2. When should you use Context API?

Use Context API when:

- Data is **global** in nature
- Same data is needed in **many components**

### Common use cases

- User authentication (logged-in user)
- Theme (dark / light)
- Language (i18n)
- Cart data (small apps)
- App-level settings

Avoid Context for **frequently changing data** (performance reasons).

---

## 3. Core Parts of Context API

Context API has **3 main parts**:

1. `createContext()`
2. `Context.Provider`
3. `useContext()`

---

## 4. Step-by-Step Implementation

### Step 1: Create Context

```jsx
// UserContext.js
import { createContext } from 'react';

const UserContext = createContext();

export default UserContext;
```

### Explanation

- `createContext()` creates a **context object**
- This context will hold shared/global data

---

### Step 2: Provide Context (Provider)

```jsx
// App.jsx
import UserContext from './UserContext';
import Dashboard from './Dashboard';

function App() {
  const user = 'Anubhav';

  return (
    <UserContext.Provider value={user}>
      <Dashboard />
    </UserContext.Provider>
  );
}

export default App;
```

### Explanation

- `Provider` makes the data available to **all child components**
- `value` is the data you want to share
- Any component inside `<Provider>` can access this value

---

### Step 3: Consume Context (useContext)

```jsx
// Dashboard.jsx
import { useContext } from 'react';
import UserContext from './UserContext';

function Dashboard() {
  const user = useContext(UserContext);

  return <h1>Welcome, {user}</h1>;
}

export default Dashboard;
```

### Explanation

- `useContext(UserContext)` reads the value from the nearest Provider
- No props required
- Cleaner and more readable than prop drilling

---

## 5. Context with Object Data

### Provider

```jsx
<UserContext.Provider value={{ name: 'Anubhav', role: 'Admin' }}>
  <Dashboard />
</UserContext.Provider>
```

### Consumer

```jsx
const { name, role } = useContext(UserContext);

console.log(name); // Anubhav
console.log(role); // Admin
```

### Explanation

- Context can store **objects, arrays, functions, states**
- Destructuring is commonly used

---

## 6. Context with State (Dynamic Data)

```jsx
// App.jsx
import { useState } from 'react';
import UserContext from './UserContext';
import Profile from './Profile';

function App() {
  const [user, setUser] = useState('Guest');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Profile />
    </UserContext.Provider>
  );
}
```

```jsx
// Profile.jsx
import { useContext } from 'react';
import UserContext from './UserContext';

function Profile() {
  const { user, setUser } = useContext(UserContext);

  return (
    <>
      <h2>{user}</h2>
      <button onClick={() => setUser('Anubhav')}>
        Login
      </button>
    </>
  );
}
```

### Explanation

- Context can share **state + updater function**
- Very common for authentication logic

---

## 7. Creating a Custom Context Provider (Best Practice)

```jsx
// UserContext.js
import { createContext, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState('Guest');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
```

```jsx
// App.jsx
import { UserProvider } from './UserContext';
import Profile from './Profile';

function App() {
  return (
    <UserProvider>
      <Profile />
    </UserProvider>
  );
}
```

### Explanation

- Keeps context logic **clean and reusable**
- Industry-preferred structure

---

## 8. Multiple Contexts Example

```jsx
<ThemeContext.Provider value="dark">
  <UserContext.Provider value="Anubhav">
    <Dashboard />
  </UserContext.Provider>
</ThemeContext.Provider>
```

### Explanation

- React allows **multiple contexts**
- Each context manages its own concern

---

## 9. Context API vs Props

| Props | Context |
| --- | --- |
| Passed manually | Passed globally |
| Best for parent-child | Best for global data |
| Simple | Powerful |
| No performance issue | Overuse can cause re-renders |
Displaying Day 81 Notes.md.