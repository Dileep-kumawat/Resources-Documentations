# JavaScript Core Concepts – Easy Notes (Complete English Version)

---

# Normal Function vs Arrow Function 

## 1. **Normal Function**

* Old/traditional way of writing functions.
* Uses the `function` keyword.
* Can be used as methods inside objects.
* Can be used as constructors (with `new` keyword).
* Has its own `this`, `arguments`, and behavior.

###  **Example**

```js
function add(a, b) {
  return a + b;
}
console.log(add(5, 10)); // 15
```

### **As Object Method:**

```js
const obj = {
  name: "JavaScript",
  show: function () {
    console.log("Normal function inside object");
  }
};
obj.show();
```

---

## 2. **Arrow Function**

* New, shorter way of writing functions.
* Uses `=>` syntax.
* Cannot be used as a constructor (`new` keyword not allowed).
* Does **not** have its own `this` or `arguments`.
* Best for short tasks, callbacks, and array methods.

###  **Example**

```js
const add = (a, b) => a + b;
console.log(add(5, 10)); // 15
```

### **As Method:**

```js
const obj = {
  show: () => {
    console.log("Arrow function inside object");
  }
};
obj.show();
```


## **2. map() – Square Numbers**


`map()` runs a function on every element and returns a **new array**.

### **Example:**

```js
const arr = [1, 2, 3];
const squared = arr.map(num => num * num);
console.log(squared); // [1, 4, 9]
```

---

## **3. filter()**

### **filter():** keeps only the items that pass the condition.

```js
const nums = [1, 2, 3, 4];
const even = nums.filter(n => n % 2 === 0);
console.log(even); // [2, 4]
```

### **reduce():** combines all values into a single result (sum, product, etc.).

```js
const sum = nums.reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 10
```

---

## **4. some() & every()**

### **some():** returns **true** if even one item matches the condition.

```js
[1, 3, 5].some(n => n % 2 === 0); // false
```

### **every():** returns **true** only if all items match the condition.

```js
[2, 4, 6].every(n => n % 2 === 0); // true
```

---

## **5. Object.freeze() & Object.seal()**

### **freeze():** completely locks the object cannot add, delete, or modify properties.

```js
const obj = Object.freeze({ a: 1 });
obj.a = 2; // no change
```

### **seal():** cannot add or delete properties, but existing values can be updated.

```js
const obj2 = Object.seal({ a: 1 });
obj2.a = 3; // update works
```

---

## **6. Nested Object Access**

### **Easy Explanation:**

A nested object means an object inside another object.

### **Example:**

```js
const user = {
  name: "Anubhav",
  address: {
    city: "Delhi",
    pin: 110001
  }
};

console.log(user.address.city);
```

### **Destructuring:**

```js
const { address: { city } } = user;
console.log(city);
```
