# Real DOM vs Virtual DOM

## Real DOM

The Real DOM is the actual browser Document Object Model.
Every UI element is a real node in memory.

### Characteristics

- Directly represents the UI on the browser
- Updating any element causes reflow and repaint
- Slower for frequent UI updates
- Manipulated using JavaScript (document.createElement, appendChild, etc.)

#### Example (Real DOM update)

```javascript
const div = document.getElementById("box");
div.innerText = "Hello";
```

Every update directly touches the browser DOM.

## Virtual DOM

The Virtual DOM is a lightweight JavaScript object representation of the Real DOM, maintained by React.

### Characteristics

- Exists in memory (not in the browser)
- Changes are first applied to Virtual DOM
- React compares old and new Virtual DOM (diffing)
- Only the minimum required changes are applied to the Real DOM
- Faster and more efficient

### How React Uses Virtual DOM

- State/props change
- New Virtual DOM is created
- React compares it with previous Virtual DOM
- React updates only the changed nodes in Real DOM

### Why Virtual DOM is Important

- Better performance
- Smooth UI updates
- Predictable UI behavior

| Feature          | Real DOM   | Virtual DOM |
| ---------------- | ---------- | ----------- |
| Update Speed     | Slow       | Fast        |
| DOM Manipulation | Direct     | Batched     |
| Memory Usage     | Higher     | Lower       |
| Used By          | Vanilla JS | React       |

# JSX (JavaScript XML) and Its Importance

## JSX

JSX is a syntax extension of JavaScript that allows writing HTML-like code inside JavaScript.

JSX is not HTML.
It is converted into JavaScript by Babel.

### JSX Example

```javascript
const element = <h1>Hello React</h1>;
```

## Component Naming Rules

- Component names must start with a Capital Letter
- Lowercase names are treated as HTML elements

### Correct

```javascript
function Header() {
  return <h1>Header</h1>;
}
```

A component is a reusable, independent UI block.

### Basic Functional Component

```javascript
function Button() {
  return <button>Click Me</button>;
}
```

## Keep Components Small

- Easier to read
- Easier to debug
- Easier to reuse

