
## Day 64 — Notes

### 1. Debouncing

#### 1.1 What is Debouncing?

Debouncing ensures that a function executes only after a specified period of inactivity. If the event keeps firing repeatedly, the function is delayed until the event stops.

In simple terms: "Run the function only after the last event — wait until the user pauses."

#### 1.2 Benefits of Debouncing

- Reduces unnecessary function executions
- Prevents server overload in API-based features
- Improves UI responsiveness
- Saves computational cost in high-frequency events

#### 1.3 Debounce Implementation (Clean & Standard)

Generic debounce function:

```js
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

Example — debouncing a search input:

```js
const searchInput = document.getElementById("search");

function fetchResults(query) {
  console.log("API Request for:", query);
}

const debouncedSearch = debounce(fetchResults, 500);

searchInput.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});
```

Only one API call will trigger after 500ms of no typing.

Notes:

- Delays execution until the event stops.
- Ideal for: search inputs, form validation, filter components.
- Reduces unnecessary API calls.
- Perfect for operations that must run after user pauses.

Example — debouncing window resize:

```js
window.addEventListener(
  "resize",
  debounce(() => {
    console.log("Resize event completed!");
  }, 300)
);
```

### 2. Throttling

#### 2.1 What is Throttling?

Throttling ensures that a function executes at fixed time intervals, regardless of how frequently the event fires.

In simple terms: "Allow the function to run at most once every X milliseconds."

#### 2.2 Benefits of Throttling

- Ensures steady performance during continuous events
- Avoids performance bottlenecks
- Guarantees execution at predictable intervals
- Prevents UI lag during heavy operations

#### 2.3 Throttle Implementation (Clean & Standard)

Generic throttle function:

```js
function throttle(fn, limit) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```

Example — throttling scroll events:

```js
function handleScroll() {
  console.log("Scroll event triggered:", window.scrollY);
}

window.addEventListener("scroll", throttle(handleScroll, 200));
```

`handleScroll()` will execute once every 200ms even if the user scrolls continuously.

Notes:

- Limits execution to one call every X milliseconds.
- Ideal for: scroll, resize, drag events.
- Ensures steady performance under high-frequency events.
- Avoids blocking the main thread.

Example — throttling button clicks:

```js
const btn = document.getElementById("submit");

const throttledClick = throttle(() => {
  console.log("Button clicked!");
}, 1000);

btn.addEventListener("click", throttledClick);
```

Result: rapid/spam clicks will trigger the function only once per second.

### 3. JSON.stringify()

#### 3.1 Definition

`JSON.stringify()` converts a JavaScript value/object into a JSON-formatted string.

In simple terms: "Convert a JavaScript object into a JSON string."

#### 3.2 Syntax

```js
JSON.stringify(value, replacer, space);
```

| Parameter | Description |
| --------- | ----------- |
| **value** | Object or array to convert |
| **replacer (optional)** | Function or array to filter keys |
| **space (optional)** | Number of spaces for pretty formatting |

#### 3.3 Why We Use `JSON.stringify()`

| Use Case | Reason |
| -------- | ------ |
| **Send data to an API** | Most servers accept JSON text |
| **Store data in LocalStorage** | LocalStorage stores only string values |
| **Convert object into readable format** | Useful for debugging/logging |
| **Deep copy (limited use)** | Quick cloning of simple objects |

#### 3.4 Examples

Example — basic usage:

```js
const user = { name: "Anubhav", age: 24 };

const json = JSON.stringify(user);
console.log(json);
// Output: {"name":"Anubhav","age":24}
```

Limitations — functions are not stored:

```js
const obj = {
  a: 1,
  b: () => console.log("Hi")
};

console.log(JSON.stringify(obj));
// Output: {"a":1}
```

### 4. JSON.parse()

#### 4.1 Definition

`JSON.parse()` converts a JSON string back into a JavaScript object.

In simple terms: "Convert a JSON string back to a JS object."

#### 4.2 Syntax

```js
JSON.parse(text, reviver);
```

| Parameter | Description |
| --------- | ----------- |
| **text** | Valid JSON string |
| **reviver (optional)** | Function to transform the parsed values |

#### 4.3 Why We Use `JSON.parse()`

| Use Case | Reason |
| -------- | ------ |
| **Read API responses** | Server returns JSON text |
| **Retrieve LocalStorage data** | Stored string converted back to object |
| **Convert string to array or object** | Useful in complex state handling |

#### 4.4 Examples

```js
const json = '{"name":"Anubhav","age":24}';

const obj = JSON.parse(json);
console.log(obj.name);
// Output: Anubhav
```

### 5. `JSON.stringify()` vs `JSON.parse()`

| Feature | JSON.stringify() | JSON.parse() |
| ------- | ---------------- | ------------ |
| Converts | JS → JSON string | JSON string → JS object |
| Input | Object/Array | String |
| Output | String | Object/Array |
| Common Use | Save/send data | Read/restore data |

### 6. Common Real-World Use Cases

Storing objects in LocalStorage:

```js
const data = { score: 100 };
localStorage.setItem("game", JSON.stringify(data));

// Retrieving:
const game = JSON.parse(localStorage.getItem("game"));
console.log(game.score);
```

Sending data to backend:

```js
fetch("/api", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 1, title: "Hello" })
});
```
