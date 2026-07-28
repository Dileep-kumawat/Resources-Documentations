# Day 38 - JavaScript Notes — Functions, Closures, Arrays, and Objects

---
##  Pure & Impure Functions

###  Pure Function
A **pure function** always gives the same output for the same input and does not modify anything outside its scope.

```js
// Pure Function Example
function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // 5
console.log(add(2, 3)); // 5 (Same input → same output)
```

---

###  Impure Function
An **impure function** changes external variables or depends on them.

```js
let count = 0;

function increase() {
  count++; // modifies external variable
  return count;
}

console.log(increase()); // 1
console.log(increase()); // 2 (Changes external state)
```

---

##  Closures

A **closure** is created when an inner function accesses variables from its outer function’s scope, even after the outer function has finished executing.

```js
function outer() {
  let count = 0;
  
  function inner() {
    count++;
    console.log(count);
  }

  return inner;
}

const counter = outer();
counter(); // 1
counter(); // 2 (remembers previous state)
```
 **Closure = Function + Lexical Scope**

---

##  Arrays in JavaScript
In JavaScript, an array is a special type of object used to store multiple values in a single variable.

###  Two Ways to Create Arrays

```js
// 1. Using Array Literal
let fruits = ["Apple", "Banana", "Mango"];

// 2. Using Array Constructor
let numbers = new Array(10, 20, 30, 40);

console.log(fruits);
console.log(numbers);
```

---

###  Accessing Elements

```js
console.log(fruits[0]); // Apple
console.log(numbers[2]); // 30
```

---

##  Common Array Methods

```js
let arr = [1, 2, 3, 4];

// push - adds element at end
arr.push(5);
console.log(arr); // [1, 2, 3, 4, 5]

// pop - removes last element
arr.pop();
console.log(arr); // [1, 2, 3, 4]

// shift - removes first element
arr.shift();
console.log(arr); // [2, 3, 4]

// unshift - adds element at start
arr.unshift(10);
console.log(arr); // [10, 2, 3, 4]

// indexOf - finds index of element
console.log(arr.indexOf(3)); // 2

// Array Destructuring
const [a, b, c] = arr;
console.log(a, b, c); // 10 2 3

// Spread Operator
let newArr = [...arr, 50];
console.log(newArr); // [10, 2, 3, 4, 50]

// reverse
arr.reverse();
console.log(arr); // [4, 3, 2, 10]

// sort
let nums = [40, 10, 30, 20];
nums.sort((a, b) => a - b);
console.log(nums); // [10, 20, 30, 40]

// join
console.log(fruits.join(", ")); // Apple, Banana, Mango

// toString
console.log(arr.toString()); // "4,3,2,10"
```

---

###  Iterating Over Arrays

```js
let students = ["Rahul", "Priya", "Rohit"];

// For Loop
for (let i = 0; i < students.length; i++) {
  console.log(students[i]);
}

// forEach Loop
students.forEach((name) => {
  console.log(name);
});
```

---

##  Objects in JavaScript
An Objects store data in the form of **key–value pairs**.

```js
let student = {
  name: "Anubhav",
  age: 24,
  course: "B.Tech"
};
```

---

###  Two Ways to Create Objects

```js
// 1. Object Literal
let user = { name: "Shery", age: 22 };

// 2. Object Constructor
let person = new Object();
person.name = "Rohan";
person.age = 25;
```

---

###  Accessing Object Properties

Two ways:

```js
let car = { brand: "BMW", color: "Black" };

// 1. Dot Notation
console.log(car.brand); // BMW

// 2. Bracket Notation
console.log(car["color"]); // Black
```

---

###  Deleting Property

```js
delete car.color;
console.log(car); // { brand: "BMW" }
```

---

###  Nested Objects

```js
let studentData = {
  name: "Anubhav",
  marks: {
    math: 95,
    science: 90
  }
};

console.log(studentData.marks.math); // 95
```

---

