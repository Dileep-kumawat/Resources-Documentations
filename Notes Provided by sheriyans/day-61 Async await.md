#  Day 61 – **Promises, async/await, and fetch**

## Promises

A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation.

States:

- `pending`
- `fulfilled`
- `rejected`

### Basic syntax

```js
const myPromise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve("Operation Successful!");
  } else {
    reject("Operation Failed!");
  }
});
```

### Consuming Promises (.then / .catch)

```js
myPromise
  .then(result => {
    console.log(result); // Operation Successful!
  })
  .catch(error => {
    console.error(error);
  });
```

### Example: Promise with setTimeout

```js
function waitForMe() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("2 seconds completed!");
    }, 2000);
  });
}

waitForMe().then(msg => console.log(msg));
```

## async / await

- `async` makes a function return a Promise.

```js
async function example() {
  return "Hello";
}

example().then(console.log); // Hello
```

- `await` pauses execution until the Promise resolves. You can use `await` only inside `async` functions.

### Example: Using await with a Promise

```js
function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve("Done waiting!"), ms);
  });
}

async function run() {
  console.log("Waiting...");
  const result = await delay(2000);
  console.log(result);
}

run();
```

## fetch

`fetch()` is a built-in browser API that returns a Promise and is used to make HTTP requests (GET, POST, PUT, DELETE).

### Basic usage

```js
fetch(url, options)
  .then(response => /* ... */)
  .catch(error => /* ... */);
```

### Example: Fetch API with async/await

```js
async function getUser() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

getUser();
```

### Example: Fetch API with Promises

```js
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));
```

### Example: fetch wrapped in a callback

```js
function fetchData(url, callback) {
  fetch(url)
    .then(response => response.json())
    .then(data => callback(null, data))   // success callback
    .catch(error => callback(error, null)); // error callback
}

// usage
fetchData("https://jsonplaceholder.typicode.com/posts/1", (err, data) => {
  if (err) {
    console.error("Error:", err);
    return;
  }

  console.log("Data:", data);
});
```

## Why use Promises?

- To avoid callback hell
- Cleaner async code
- Better error handling
- Easy chaining


