
#  Day 56 – Object-Oriented Concepts in JavaScript

JavaScript OOP (Object-Oriented Programming) helps you write cleaner, reusable, and structured code using **objects**, **classes**, **constructors**, **prototypes**, and **inheritance**.

---

## 🔹 1. Introduction to OOPS in JavaScript

JavaScript supports OOP using:

- Objects  
- Classes  
- Constructors  
- Prototypes  
- Inheritance  

### ✔️ Simple Object Example

```js
const user = {
  name: "Anubhav",
  age: 24,
  greet() {
    console.log(`Hello, I am ${this.name}`);
  },
};

user.greet();
```

---

## 🔹 2. Understanding Classes and Objects

- **class = blueprint**
- **object = real instance created from the blueprint**

### ✔️ Basic Example

```js
class Car {
  constructor(brand, price) {
    this.brand = brand;
    this.price = price;
  }

  drive() {
    console.log(`${this.brand} is driving...`);
  }
}

const car1 = new Car("BMW", 5000000);
car1.drive();
```

---

## 🔹 3. Constructor & Prototype

###  Constructor  
A constructor is a special method inside a class that initializes object properties.

```js
class Student {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

const s1 = new Student("Anubhav", 24);
```

---

## 🔹 Prototype in JavaScript

Every function in JavaScript has a **prototype**, which is used to **share methods** across all objects created from that function.

### ✔️ Example Without Classes

```js
function Person(name) {
  this.name = name;
}

// Adding method using prototype
Person.prototype.sayHi = function () {
  console.log(`Hi, I am ${this.name}`);
};

const p1 = new Person("Anubhav");
p1.sayHi();
```

---
