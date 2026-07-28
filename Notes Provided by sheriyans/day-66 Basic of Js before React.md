# Destructuring in JavaScript

Destructuring allows you to extract values from arrays or properties from objects into variables in a clean and readable way.

## Array Destructuring

### Basic Example

```javascript
const arr = [10, 20, 30];

const [a, b, c] = arr;

console.log(a); // 10
console.log(b); // 20
console.log(c); // 30
```

### Skip Elements

```javascript
const arr = [10, 20, 30, 40];

const [first, , third] = arr;

console.log(first); // 10
console.log(third); // 30
```

### Default Values

```javascript
const arr = [10];

const [a, b = 50] = arr;

console.log(a); // 10
console.log(b); // 50
```

## Object Destructuring

### Basic Example

```javascript
const user = {
  name: "Anubhav",
  age: 24,
  role: "Developer"
};

const { name, age } = user;

console.log(name); // Anubhav
console.log(age);  // 24
```

### Rename Variables

```javascript
const user = { name: "Anubhav" };

const { name: username } = user;

console.log(username); // Anubhav
```

### Default Values

```javascript
const user = { name: "Anubhav" };

const { name, city = "Delhi" } = user;

console.log(city); // Delhi
```

### Nested Object Destructuring

```javascript
const user = {
  name: "Anubhav",
  address: {
    city: "Patna",
    pincode: 800001
  }
};

const {
  address: { city }
} = user;

console.log(city); // Patna
```

# Spread Operator (...)

The spread operator expands elements of an array or object.

## Spread in Arrays

### Copy Array

```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1];

console.log(arr2); // [1,2,3]
```

### Merge Arrays

```javascript
const a = [1, 2];
const b = [3, 4];

const result = [...a, ...b];

console.log(result); // [1,2,3,4]
```

### Add New Values

```javascript
const numbers = [2, 3, 4];

const updated = [1, ...numbers, 5];

console.log(updated);
```

## Spread in Objects

### Copy Object

```javascript
const user = { name: "Anubhav", age: 24 };

const copy = { ...user };

console.log(copy);
```

### Merge Objects

```javascript
const obj1 = { a: 1 };
const obj2 = { b: 2 };

const merged = { ...obj1, ...obj2 };

console.log(merged);
```

### Override Properties

```javascript
const user = { name: "Anubhav", age: 24 };

const updatedUser = { ...user, age: 25 };

console.log(updatedUser);
```

# Rest Operator (...)

The rest operator collects remaining values into an array or object.

## Rest in Arrays

```javascript
const [first, ...rest] = [10, 20, 30, 40];

console.log(first); // 10
console.log(rest);  // [20,30,40]
```

## Rest in Objects

```javascript
const user = {
  name: "Anubhav",
  age: 24,
  role: "Developer"
};

const { name, ...others } = user;

console.log(name);   // Anubhav
console.log(others); // { age: 24, role: "Developer" }
```

## Rest in Function Parameters

```javascript
function sum(...numbers) {
  return numbers.reduce((acc, val) => acc + val, 0);
}

console.log(sum(10, 20, 30)); // 60
```

# ES Modules in JavaScript

Modules allow you to split code into multiple files and reuse it using import and export.

## Why type="module" in HTML?

- Enables ES Module syntax
- Allows import and export
- Uses strict mode automatically
- Supports file-based modular code

## Using type="module" in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Modules</title>
</head>
<body>

  <script type="module" src="main.js"></script>

</body>
</html>
```

# Export in JavaScript

## Named Export

**file: math.js**

```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
```

**Import Named Exports**

```javascript
import { add, subtract } from "./math.js";

console.log(add(10, 5));
console.log(subtract(10, 5));
```

## Default Export

**file: calculator.js**

```javascript
export default function multiply(a, b) {
  return a * b;
}
```

**Import Default Export**

```javascript
import multiply from "./calculator.js";

console.log(multiply(5, 4));
```

## Mixed Export (Named + Default)

**file: utils.js**

```javascript
export const PI = 3.14;

export default function area(radius) {
  return PI * radius * radius;
}
```

**Import Mixed**

```javascript
import area, { PI } from "./utils.js";

console.log(PI);
console.log(area(5));
```

## Import Everything (* as)

```javascript
import * as math from "./math.js";

console.log(math.add(2, 3));
console.log(math.subtract(5, 2));
```

# Important Rules & Notes

- Always use relative paths (./, ../)
- Modules run in strict mode
- Modules are deferred by default
- File extension (.js) is mandatory in browser
- Each module has its own scope