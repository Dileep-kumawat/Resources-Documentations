`useState` in React

`useState` is a **React Hook** that allows **functional components** to store and manage **state**.

In simple terms:

> useState lets a component remember values and update the UI when those values change.
> 

Examples of data that need state:

- Counter values
- Form inputs
- Toggle (show/hide)
- Logged-in user status
- Theme (dark/light)
- API response data

If data **never changes**, state is **not required**.

## Syntax of `useState`

```jsx
const [state, setState] =useState(initialValue);

```

### Breakdown:

- `state` → current value
- `setState` → function to update the value
- `initialValue` → value used on the **first render**

Example:

```jsx
const [count, setCount] =useState(0);

```

Here:

- `count` starts with `0`
- `setCount` is used to update `count`

## Basic Example – Counter

```jsx
import { useState }from"react";

functionCounter() {
const [count, setCount] =useState(0);

return (
<div>
<h2>Count: {count}</h2>
<buttononClick={() => setCount(count + 1)}>
        Increment
</button>
</div>
  );
}

exportdefaultCounter;

```

### Explanation:

- Initial render → `count = 0`
- Button click → `setCount(count + 1)`
- State updates
- Component re-renders
- New value is shown in UI