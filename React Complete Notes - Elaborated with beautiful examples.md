# React Complete Notes — Elaborated with Beautiful Examples

React becomes much easier when you learn it through **small, realistic examples**. Below is a structured set of notes that starts from the basics and gradually moves toward advanced concepts.

---

## 1. What is React?

**React** is a JavaScript library used to build user interfaces.

Instead of creating one huge HTML page, React lets us divide the UI into **small reusable components**.

For example, imagine a shopping website:

```text
App
├── Navbar
├── ProductList
│   ├── ProductCard
│   ├── ProductCard
│   └── ProductCard
├── Cart
└── Footer
```

Each part can be a separate component.

### Example

```jsx
function Welcome() {
  return <h1>Welcome to my website!</h1>;
}

function App() {
  return (
    <div>
      <Welcome />
      <p>This is my first React application.</p>
    </div>
  );
}
```

Here:

* `App` is a component.
* `Welcome` is another component.
* `App` uses `Welcome`.

### Why React?

Without components, a large application can become difficult to maintain.

With React:

```text
Large UI
   ↓
Small components
   ↓
Reusable + maintainable code
```

---

# 2. Components

A **component** is a reusable piece of UI.

Think of a component like a LEGO block.

### Simple component

```jsx
function Greeting() {
  return <h1>Hello!</h1>;
}
```

Use it:

```jsx
function App() {
  return (
    <>
      <Greeting />
      <Greeting />
      <Greeting />
    </>
  );
}
```

The same component can be reused multiple times.

---

## Real-world example: Profile Card

```jsx
function ProfileCard() {
  return (
    <div>
      <h2>Rahul</h2>
      <p>Frontend Developer</p>
      <button>View Profile</button>
    </div>
  );
}
```

Then:

```jsx
function App() {
  return (
    <div>
      <ProfileCard />
      <ProfileCard />
    </div>
  );
}
```

Instead of writing the same HTML repeatedly, we create one reusable component.

---

# 3. Props

**Props** allow components to receive information.

Think of props as arguments to a function.

### JavaScript

```jsx
function greet(name) {
  return `Hello ${name}`;
}

greet("Rahul");
```

### React

```jsx
function Greeting({ name }) {
  return <h1>Hello {name}</h1>;
}
```

Use it:

```jsx
<Greeting name="Rahul" />
<Greeting name="Anita" />
<Greeting name="John" />
```

The result is:

```text
Hello Rahul
Hello Anita
Hello John
```

---

## Multiple props

```jsx
function Student({ name, age, course }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Course: {course}</p>
    </div>
  );
}
```

Use:

```jsx
<Student
  name="Rahul"
  age={20}
  course="Computer Science"
/>
```

---

# 4. Props Are Read-Only

A child component should not directly modify its props.

For example:

```jsx
function User({ name }) {
  return <h2>{name}</h2>;
}
```

The component can **use** `name`, but it shouldn't try to modify the prop itself.

If data needs to change, React normally uses **state**.

---

# 5. JSX

JSX allows us to write HTML-like UI inside JavaScript.

```jsx
const element = <h1>Hello World</h1>;
```

JSX makes React code easier to read.

### JavaScript inside JSX

Use curly braces:

```jsx
const name = "Rahul";
const age = 20;

function App() {
  return (
    <div>
      <h1>Hello {name}</h1>
      <p>You are {age} years old.</p>
    </div>
  );
}
```

---

## JSX expressions

You can use JavaScript expressions:

```jsx
<h1>{10 + 20}</h1>
```

Output:

```text
30
```

Another example:

```jsx
const firstName = "Rahul";
const lastName = "Kumar";

<h1>
  {firstName} {lastName}
</h1>
```

---

# 6. JSX Rules

### Rule 1: Return one parent

❌

```jsx
return (
  <h1>Hello</h1>
  <p>Welcome</p>
);
```

✅

```jsx
return (
  <div>
    <h1>Hello</h1>
    <p>Welcome</p>
  </div>
);
```

Or use a Fragment:

```jsx
return (
  <>
    <h1>Hello</h1>
    <p>Welcome</p>
  </>
);
```

### Rule 2: Use `className`

HTML:

```html
<div class="card">
```

JSX:

```jsx
<div className="card">
```

### Rule 3: Close elements

```jsx
<img src="photo.jpg" alt="Profile" />
```

---

# 7. State

**State** is one of the most important concepts in React.

State represents information that can change.

Examples:

* Counter value
* Username
* Dark/light mode
* Whether a menu is open
* Shopping cart contents
* Form input

---

# 8. `useState`

React provides the `useState` hook.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}
```

Initially:

```text
count = 0
```

Click:

```text
count = 1
```

Click again:

```text
count = 2
```

---

## Understanding this line

```jsx
const [count, setCount] = useState(0);
```

It gives us:

```text
count
   ↓
current value

setCount
   ↓
function used to update value
```

`0` is the initial value.

---

# 9. A Beautiful Counter Example

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Counter</h1>

      <h2>{count}</h2>

      <button onClick={() => setCount(count + 1)}>
        +
      </button>

      <button onClick={() => setCount(count - 1)}>
        -
      </button>

      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
```

This small example demonstrates:

* Component
* State
* Event handling
* State updates
* JSX

---

# 10. Functional State Updates

When the next state depends on the previous state, prefer the functional form:

```jsx
setCount(prevCount => prevCount + 1);
```

Example:

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function increase() {
    setCount(prev => prev + 1);
  }

  return (
    <>
      <h1>{count}</h1>
      <button onClick={increase}>Increase</button>
    </>
  );
}
```

This makes the dependency on the previous state explicit.

---

# 11. Events

React handles browser events using props such as:

```text
onClick
onChange
onSubmit
onMouseEnter
onKeyDown
onFocus
onBlur
```

### Example

```jsx
function App() {
  function handleClick() {
    alert("Button clicked!");
  }

  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}
```

---

# 12. Event Object

React passes an event object to the handler.

```jsx
function App() {
  function handleChange(event) {
    console.log(event.target.value);
  }

  return (
    <input
      onChange={handleChange}
      placeholder="Type something..."
    />
  );
}
```

If the user types:

```text
React
```

the handler receives the current input value.

---

# 13. Conditional Rendering

Sometimes we want to display different UI depending on a condition.

### Example: Login status

```jsx
function App() {
  const isLoggedIn = true;

  return (
    <div>
      {isLoggedIn ? (
        <h1>Welcome back!</h1>
      ) : (
        <h1>Please log in.</h1>
      )}
    </div>
  );
}
```

---

## Using `&&`

```jsx
function App() {
  const isAdmin = true;

  return (
    <div>
      <h1>Dashboard</h1>

      {isAdmin && <button>Admin Settings</button>}
    </div>
  );
}
```

If `isAdmin` is `true`, the button appears.

---

# 14. Rendering Lists

Suppose we have:

```jsx
const fruits = [
  "Apple",
  "Banana",
  "Mango",
  "Orange"
];
```

We can render them with `map()`:

```jsx
function FruitList() {
  return (
    <ul>
      {fruits.map(fruit => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
```

Output:

```text
• Apple
• Banana
• Mango
• Orange
```

---

# 15. Keys

Keys help React identify individual items in a list.

Suppose:

```jsx
const students = [
  { id: 1, name: "Rahul" },
  { id: 2, name: "Anita" },
  { id: 3, name: "John" }
];
```

Use:

```jsx
{students.map(student => (
  <li key={student.id}>
    {student.name}
  </li>
))}
```

A stable unique ID is usually better than using the array index when list items can change order.

---

# 16. Forms

Forms are extremely common in React applications.

Let's create a login form.

```jsx
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    console.log({
      email,
      password
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button type="submit">
        Login
      </button>
    </form>
  );
}
```

This demonstrates:

* State
* Controlled inputs
* Events
* Form submission
* `preventDefault()`

---

# 17. Controlled Components

A controlled input is controlled by React state.

```jsx
const [name, setName] = useState("");

<input
  value={name}
  onChange={e => setName(e.target.value)}
/>
```

The flow is:

```text
User types
    ↓
onChange
    ↓
setName()
    ↓
State changes
    ↓
Component renders
    ↓
Input receives new value
```

---

# 18. Object State

State can contain objects.

```jsx
const [user, setUser] = useState({
  name: "Rahul",
  age: 20,
  city: "Hyderabad"
});
```

To update only the age:

```jsx
setUser(prev => ({
  ...prev,
  age: 21
}));
```

The spread operator preserves the other properties.

---

# 19. Array State

```jsx
const [tasks, setTasks] = useState([]);
```

Add:

```jsx
setTasks(prev => [
  ...prev,
  "Learn React"
]);
```

Remove:

```jsx
setTasks(prev =>
  prev.filter(task => task !== "Learn React")
);
```

Update:

```jsx
setTasks(prev =>
  prev.map(task =>
    task === "Learn React"
      ? "Master React"
      : task
  )
);
```

---

# 20. Mini Project: Todo List

This is a great beginner React project.

```jsx
import { useState } from "react";

function TodoApp() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  function addTask() {
    if (!task.trim()) return;

    setTasks(prev => [...prev, task]);
    setTask("");
  }

  function deleteTask(taskToDelete) {
    setTasks(prev =>
      prev.filter(task => task !== taskToDelete)
    );
  }

  return (
    <div>
      <h1>My Todo List</h1>

      <input
        value={task}
        onChange={e => setTask(e.target.value)}
        placeholder="Enter a task"
      />

      <button onClick={addTask}>
        Add
      </button>

      <ul>
        {tasks.map((task, index) => (
          <li key={`${task}-${index}`}>
            {task}

            <button
              onClick={() => deleteTask(task)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

This single project combines:

```text
JSX
 ↓
Components
 ↓
State
 ↓
Events
 ↓
Forms
 ↓
Arrays
 ↓
map()
 ↓
Conditional logic
```

For production applications, using a stable unique task ID is preferable to constructing keys from potentially duplicated task text.

---

# 21. `useEffect`

`useEffect` is used when a component needs to **synchronize with something outside React**, such as:

* Browser APIs
* Network connections
* Timers
* Subscriptions
* External libraries

Example:

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log("Effect executed");
  }, []);

  return <h1>Hello</h1>;
}
```

---

# 22. Effect Dependencies

Example:

```jsx
useEffect(() => {
  console.log("Count changed");
}, [count]);
```

The effect is tied to `count`.

Conceptually:

```text
count changes
      ↓
React renders
      ↓
effect is synchronized
```

The dependency array should contain the reactive values that the effect uses and depends upon.

---

# 23. Cleanup Functions

Some effects create resources that need to be cleaned up.

Example: timer.

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

The returned function performs cleanup.

---

# 24. Fetching API Data

A simple example:

```jsx
import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(
          "https://example.com/api/users"
        );

        const data = await response.json();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

A real application should additionally handle request errors and cancellation/race conditions where appropriate.

---

# 25. `useRef`

`useRef` can reference a DOM element.

```jsx
import { useRef } from "react";

function SearchBox() {
  const inputRef = useRef(null);

  function focusInput() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />

      <button onClick={focusInput}>
        Focus Input
      </button>
    </>
  );
}
```

When the button is clicked, the input receives focus.

---

# 26. `useContext`

Imagine an application with:

```text
App
 ↓
Navbar
 ↓
Profile
 ↓
UserDetails
```

Suppose `UserDetails` needs the current theme.

Passing props through every component can become inconvenient.

Context allows a value to be made available deeper in the tree.

```jsx
import {
  createContext,
  useContext
} from "react";

const ThemeContext = createContext("light");
```

Provide the value:

```jsx
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Profile />
    </ThemeContext.Provider>
  );
}
```

Read it:

```jsx
function Profile() {
  const theme = useContext(ThemeContext);

  return (
    <div>
      Current theme: {theme}
    </div>
  );
}
```

---

# 27. `useReducer`

When state logic becomes complicated, `useReducer` can make state transitions easier to organize.

Example:

```jsx
import { useReducer } from "react";

const initialState = {
  count: 0
};

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return {
        count: state.count + 1
      };

    case "decrement":
      return {
        count: state.count - 1
      };

    case "reset":
      return {
        count: 0
      };

    default:
      return state;
  }
}
```

Component:

```jsx
function Counter() {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  );

  return (
    <div>
      <h1>{state.count}</h1>

      <button
        onClick={() => dispatch({ type: "increment" })}
      >
        +
      </button>

      <button
        onClick={() => dispatch({ type: "decrement" })}
      >
        -
      </button>

      <button
        onClick={() => dispatch({ type: "reset" })}
      >
        Reset
      </button>
    </div>
  );
}
```

The pattern is:

```text
User action
    ↓
dispatch(action)
    ↓
reducer
    ↓
new state
    ↓
UI updates
```

---

# 28. Custom Hooks

Suppose multiple components need counter logic.

Instead of duplicating it, create a custom hook.

```jsx
import { useState } from "react";

function useCounter(initialValue = 0) {
  const [count, setCount] =
    useState(initialValue);

  function increment() {
    setCount(value => value + 1);
  }

  function decrement() {
    setCount(value => value - 1);
  }

  function reset() {
    setCount(initialValue);
  }

  return {
    count,
    increment,
    decrement,
    reset
  };
}
```

Use it:

```jsx
function Counter() {
  const {
    count,
    increment,
    decrement,
    reset
  } = useCounter();

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

Custom hooks are excellent for **reusing logic**, not UI.

---

# 29. Lifting State Up

Suppose two components need the same information.

```text
       App
      /   \
   Input   Display
```

Instead of keeping separate copies of the data, put the state in `App`.

```jsx
function App() {
  const [name, setName] = useState("");

  return (
    <>
      <Input
        name={name}
        setName={setName}
      />

      <Display name={name} />
    </>
  );
}
```

This creates a **single source of truth**.

---

# 30. Component Communication

### Parent → Child

Props:

```jsx
<Child name="Rahul" />
```

### Child → Parent

Callback prop:

```jsx
<Child onSend={handleData} />
```

Child:

```jsx
function Child({ onSend }) {
  return (
    <button onClick={() => onSend("Hello")}>
      Send
    </button>
  );
}
```

### Sibling → Sibling

Usually:

```text
Sibling A
    ↓
 Parent
    ↓
Sibling B
```

The parent owns the shared state.

---

# 31. React Router

React applications often need multiple views:

```text
/
/about
/products
/products/101
/contact
```

A routing library can map URLs to components.

Conceptually:

```jsx
<Routes>
  <Route
    path="/"
    element={<Home />}
  />

  <Route
    path="/about"
    element={<About />}
  />

  <Route
    path="/products"
    element={<Products />}
  />
</Routes>
```

Navigation:

```jsx
<Link to="/about">
  About
</Link>
```

---

# 32. Dynamic Routes

Suppose we have:

```text
/products/101
/products/102
/products/103
```

A dynamic route can use:

```text
/products/:id
```

Then the component can read the `id` and use it to fetch or display the appropriate product.

---

# 33. Error Handling

API requests can fail.

A robust component generally considers:

```text
Loading
   ↓
Success
   ↓
Data displayed
```

or:

```text
Loading
   ↓
Error
   ↓
Error message
```

Example:

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response =
          await fetch("/api/users");

        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

# 34. `memo`

`memo` can prevent a component from re-rendering when its props have not changed.

```jsx
import { memo } from "react";

const User = memo(function User({ name }) {
  console.log("User rendered");

  return <h2>{name}</h2>;
});
```

It can be useful for performance-sensitive components, but it should not be added everywhere automatically.

---

# 35. `useMemo`

`useMemo` can cache the result of an expensive calculation.

```jsx
const sortedProducts = useMemo(() => {
  return [...products].sort(
    (a, b) => a.price - b.price
  );
}, [products]);
```

The calculation is recomputed when `products` changes.

---

# 36. `useCallback`

`useCallback` can preserve a function's identity between renders.

```jsx
const handleDelete = useCallback((id) => {
  setItems(items =>
    items.filter(item => item.id !== id)
  );
}, []);
```

It is most useful when function identity matters, such as when passing callbacks to memoized children.

---

# 37. Lazy Loading

Large applications can load some components only when they are needed.

```jsx
import {
  lazy,
  Suspense
} from "react";

const About = lazy(
  () => import("./About")
);

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <About />
    </Suspense>
  );
}
```

This can reduce the amount of JavaScript needed for the initial page.

---

# 38. React Rendering — Simple Mental Model

A useful mental model is:

```text
Props / State change
        ↓
React renders
        ↓
React determines what changed
        ↓
Necessary UI updates
```

You should think of React UI as a function of state and props:

```text
UI = f(props, state)
```

For example:

```jsx
function Greeting({ name }) {
  return <h1>Hello {name}</h1>;
}
```

Change `name`:

```text
Rahul → Anita
```

The displayed UI changes accordingly.

---

# 39. Immutability

React state should generally be treated as immutable.

Instead of:

```jsx
user.name = "Anita";
```

create a new object:

```jsx
setUser(prev => ({
  ...prev,
  name: "Anita"
}));
```

Instead of:

```jsx
items.push(newItem);
```

use:

```jsx
setItems(prev => [
  ...prev,
  newItem
]);
```

This makes state changes predictable and works well with React's rendering model.

---

# 40. React Project Example — Product Cards

Let's combine components and props.

```jsx
function ProductCard({
  name,
  price,
  image
}) {
  return (
    <article>
      <img
        src={image}
        alt={name}
      />

      <h2>{name}</h2>

      <p>₹{price}</p>

      <button>
        Add to Cart
      </button>
    </article>
  );
}
```

Use:

```jsx
function App() {
  return (
    <div>
      <ProductCard
        name="Laptop"
        price={55000}
        image="/laptop.jpg"
      />

      <ProductCard
        name="Headphones"
        price={3000}
        image="/headphones.jpg"
      />

      <ProductCard
        name="Keyboard"
        price={2000}
        image="/keyboard.jpg"
      />
    </div>
  );
}
```

Notice how one component handles many products.

---

# 41. Product List with `map()`

Instead of manually creating each card:

```jsx
const products = [
  {
    id: 1,
    name: "Laptop",
    price: 55000
  },
  {
    id: 2,
    name: "Headphones",
    price: 3000
  },
  {
    id: 3,
    name: "Keyboard",
    price: 2000
  }
];
```

Render:

```jsx
function App() {
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}
```

This is a very common React pattern.

---

# 42. A Complete Mini Shopping Cart

Here's a compact example combining several React concepts:

```jsx
import { useState } from "react";

const products = [
  { id: 1, name: "Laptop", price: 55000 },
  { id: 2, name: "Headphones", price: 3000 },
  { id: 3, name: "Keyboard", price: 2000 }
];

function App() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    setCart(prev => [...prev, product]);
  }

  function removeFromCart(id) {
    setCart(prev =>
      prev.filter(item => item.id !== id)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <div>
      <h1>My Store</h1>

      <h2>Products</h2>

      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>

          <p>₹{product.price}</p>

          <button
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      ))}

      <hr />

      <h2>Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={`${item.id}-${index}`}>
              <span>{item.name}</span>

              <button
                onClick={() =>
                  removeFromCart(item.id)
                }
              >
                Remove
              </button>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>
        </>
      )}
    </div>
  );
}

export default App;
```

This example demonstrates:

```text
Components
Props
State
Arrays
map()
filter()
reduce()
Events
Conditional rendering
Keys
Immutable state updates
```

---

# 43. React Architecture

A larger application might look like:

```text
src/
│
├── components/
│   ├── Navbar.jsx
│   ├── Button.jsx
│   ├── ProductCard.jsx
│   └── Modal.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Products.jsx
│   └── Profile.jsx
│
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
│
├── context/
│   └── AuthContext.jsx
│
├── services/
│   └── api.js
│
├── App.jsx
└── main.jsx
```

The exact structure varies by project. The goal is to organize code by responsibility rather than creating one enormous component.

---

# 44. Important React Rules

Remember these especially well:

### 1. Don't mutate state

```jsx
setUser({
  ...user,
  name: "Anita"
});
```

### 2. Give list items stable keys

```jsx
key={item.id}
```

### 3. Hooks belong at the top level

```jsx
const [count, setCount] = useState(0);
```

### 4. Keep components focused

Instead of:

```text
Huge App component
```

prefer:

```text
App
├── Navbar
├── Sidebar
├── ProductList
├── ProductCard
└── Footer
```

### 5. Keep a single source of truth

If several components need the same state, consider lifting it to their common parent or using an appropriate shared-state mechanism.

---

# 45. React vs Traditional DOM Manipulation

### Traditional JavaScript

You might manually find an element:

```js
document.getElementById("count");
```

and update it:

```js
element.textContent = count;
```

### React

You describe what the UI should look like:

```jsx
<h1>{count}</h1>
```

When the state changes:

```jsx
setCount(newCount);
```

React handles the resulting UI update.

This is the core idea of **declarative UI**.

---

# 46. Declarative vs Imperative

### Imperative

You tell the browser **how** to change the UI.

```text
Find element
    ↓
Change text
    ↓
Add class
    ↓
Hide element
```

### Declarative

You describe **what the UI should be**:

```jsx
{isLoggedIn ? (
  <Dashboard />
) : (
  <Login />
)}
```

React handles the necessary updates.

---

# 47. React Mental Model

A very useful mental model is:

```text
             STATE
               ↓
             RENDER
               ↓
               UI
               ↓
             USER
               ↓
             EVENT
               ↓
          STATE UPDATE
               ↓
             RENDER
```

Example:

```text
count = 0
   ↓
<h1>0</h1>
   ↓
User clicks +
   ↓
setCount(1)
   ↓
React renders
   ↓
<h1>1</h1>
```

Once this cycle becomes clear, many React concepts become much easier.

---

# 48. Quick Revision Sheet

| Concept               | What it does                        | Example                  |
| --------------------- | ----------------------------------- | ------------------------ |
| Component             | Reusable UI                         | `function Card()`        |
| JSX                   | Describes UI                        | `<h1>Hello</h1>`         |
| Props                 | Passes data                         | `<Card title="Phone" />` |
| State                 | Stores changing data                | `useState()`             |
| Event                 | Responds to actions                 | `onClick`                |
| Conditional rendering | Shows UI conditionally              | `condition ? A : B`      |
| List rendering        | Displays collections                | `map()`                  |
| Key                   | Identifies list item                | `key={item.id}`          |
| Form                  | Collects user input                 | `<form>`                 |
| `useEffect`           | Synchronizes with external systems  | API/timer                |
| `useRef`              | Stores ref/persistent mutable value | DOM reference            |
| Context               | Shares values                       | `useContext()`           |
| `useReducer`          | Manages complex state transitions   | reducer                  |
| Custom Hook           | Reuses stateful logic               | `useCounter()`           |
| `memo`                | Can skip unnecessary renders        | `memo(Component)`        |
| `useMemo`             | Caches calculation                  | `useMemo()`              |
| `useCallback`         | Caches function identity            | `useCallback()`          |
| Router                | Handles navigation                  | `<Route>`                |
| Suspense              | Handles waiting for lazy content    | `<Suspense>`             |

---

# 49. Best Order to Learn React

Don't try to memorize everything at once.

Follow this order:

```text
1. JavaScript fundamentals
        ↓
2. JSX
        ↓
3. Components
        ↓
4. Props
        ↓
5. State
        ↓
6. Events
        ↓
7. Conditional rendering
        ↓
8. Lists + Keys
        ↓
9. Forms
        ↓
10. useEffect
        ↓
11. API calls
        ↓
12. useRef
        ↓
13. Context
        ↓
14. useReducer
        ↓
15. Custom Hooks
        ↓
16. Routing
        ↓
17. Performance
        ↓
18. Testing
        ↓
19. React frameworks / advanced React
```

### The five concepts you absolutely must understand first

If you're just starting, concentrate on these:

**Components → Props → State → Events → Rendering**

Once these make sense, React stops feeling mysterious and starts feeling like a predictable system:

> **Props and state determine what the UI looks like; events and other updates change state; React then updates the UI accordingly.**