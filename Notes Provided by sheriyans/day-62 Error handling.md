# Day 62 – Error Handling

## Introduction to Error Handling

Error handling allows JavaScript applications to detect, manage, and recover from unexpected issues during execution.

### Why it's important:

- Prevents app crashes
- Helps debug issues faster
- Ensures smooth user experience
- Makes code more predictable and stable

### Basic flow:

1. Code executes
2. If an error occurs, control jumps to the nearest `catch` block

### Simple example:

```js
console.log("Start");

try {
  let result = x + 5;   // x is not defined → error
} catch (error) {
  console.log("Error occurred:", error.message);
}

console.log("End");
```

## Common Types of Errors in JavaScript

### Syntax Errors

These occur before code executes — due to invalid JavaScript syntax.

```js
// Missing closing bracket → SyntaxError
if (true {
    console.log("Hello");
}
```

### Runtime Errors

Errors occurring while the code is running.

```js
function demo() {
  console.log(a);  // ReferenceError: a is not defined
}
demo();
```

### Logical Errors

Code runs without crashing but produces incorrect output.

```js
// Intent: multiply numbers
function multiply(a, b) {
  return a + b;   // Wrong logic → logical error
}

console.log(multiply(5, 3)); // 8 instead of 15
```

## Understanding the Error Object

The JavaScript `Error` object contains metadata about the failure.

### Properties:

- `message` – description of the error
- `name` – error type: `ReferenceError`, `TypeError`, `SyntaxError`, etc.
- `stack` – stack trace (where the error occurred)

### Example:

```js
try {
  let obj = undefined;
  obj.name; // TypeError
} catch (err) {
  console.log("Name:", err.name);
  console.log("Message:", err.message);
  console.log("Stack:", err.stack);
}
```

## Handling Exceptions: try-catch and try-catch-finally

### Basic try-catch

```js
try {
  let num = 10 / 0;
  console.log(num);
} catch (error) {
  console.log("Something went wrong!");
}
```

### Detailed catch

```js
try {
  JSON.parse("{ bad json }");
} catch (error) {
  console.log("Error:", error.message);
}
```

### Using finally

`finally` executes whether an error occurs or not.

```js
try {
  console.log("Opening file...");
  throw new Error("File corrupted");
} catch (error) {
  console.log("Error:", error.message);
} finally {
  console.log("Closing file...");
}
```

**Output:**

```
Opening file...
Error: File corrupted
Closing file...
```

## How to Throw Errors in JavaScript

You can create custom errors using `throw`.

### Throwing a simple error

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (error) {
  console.log(error.message);
}
```

### Throwing custom error types

```js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function registerUser(age) {
  if (age < 18) {
    throw new ValidationError("User must be 18+");
  }
  return "User registered";
}

try {
  registerUser(15);
} catch (err) {
  console.log(err.name);    // ValidationError
  console.log(err.message); // User must be 18+
}
```