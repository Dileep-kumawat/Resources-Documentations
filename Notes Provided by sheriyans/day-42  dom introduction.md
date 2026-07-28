# Day 42 -  Dom - Introduction

# Day – DOM (Document Object Model)

The **DOM** is a structured representation of an HTML document. With JavaScript, we can select elements, change HTML, change CSS, and add interactivity using event listeners.

---

## 1. Selection of Elements in the DOM

DOM selection means choosing HTML elements so we can manipulate them.
JavaScript provides multiple ways to select elements:

### **(a) document.getElementById() – Select by ID**

Returns the element with the given ID.

```js
const title = document.getElementById("heading");
```

### **(b) document.getElementsByClassName() – Select by Class**

Returns an HTMLCollection (array-like list).

```js
const boxes = document.getElementsByClassName("box");
```

### **(c) document.getElementsByTagName() – Select by Tag Name**

Returns all elements of a specific tag.

```js
const allDivs = document.getElementsByTagName("div");
```

### **(d) document.querySelector() – Select First Match**

Works like CSS selectors.

```js
const firstPara = document.querySelector("p");
```

### **(e) document.querySelectorAll() – Select All Matches**

Returns a NodeList (supports forEach).

```js
const allParas = document.querySelectorAll("p");
```

### **Example**

```js
const heading = document.getElementById("mainTitle");
console.log(heading);
```

💡 **Key Point:** Use `querySelector` & `querySelectorAll` for modern, flexible selection.

---

## 2. Changing HTML Content

We can change what is written inside an element.

### **innerText — Changes text only**

```js
msg.innerText = "Hello World";
```

### **innerHTML — Replaces content with HTML**

```js
msg.innerHTML = "<b>Hello World</b>";
```

### **textContent — Shows all text (even hidden)**

```js
console.log(msg.textContent);
```

💡 **Key Point:** Use `innerHTML` carefully — it can insert HTML (and sometimes harmful code).

---

## 3. Changing CSS with JavaScript

We can directly modify styles using `.style`.

```js
const btn = document.getElementById("btn");

btn.style.backgroundColor = "black";
btn.style.color = "white";
btn.style.padding = "10px";
```

💡 **Key Point:** For large styling changes, prefer adding/removing classes instead of many `.style` properties.

---

## 4. Event Listeners

Event listeners allow your webpage to become interactive.

### **Basic Example**

```js
const button = document.getElementById("clickMe");

button.addEventListener("click", function () {
    console.log("Button Clicked");
});
```

### **Common Events**

* click
* mouseover
* mouseout
* keyup
* keydown
* submit
* change

💡 **Key Point:** Events help you respond to user actions (clicks, typing, form submission).

---

## 📌 Task: Create a Counter (Only Description)

Using DOM + event listeners, create a counter with:

* Increase button
* Decrease button
* Reset button

The counter value should update on the screen.

---
