# React Props: Passing Data to Components

Props are read-only inputs passed from parent to child.

```javascript
function Card(props) {
  return <h2>{props.title}</h2>;
}

<Card title="React Notes" />
```

Props are:

- Immutable
- Passed top-down
- Used for configuration

## Rendering Array Data using map

```javascript
const users = ["A", "B", "C"];

users.map(user => <li key={user}>{user}</li>);
```

## Eliminating Array Data using filter

```javascript
const filteredUsers = users.filter(user => user !== "B");

filteredUsers.map(user => <li key={user}>{user}</li>);
```

### Concept

- `filter()` removes data
- `map()` transforms data
- Both are immutable operations

## Reusing Components, Lists & Keys

### Reusing Components

```jsx
<Card title="HTML" />
<Card title="CSS" />
<Card title="React" />
```

### Lists & Keys

```jsx
items.map(item => (
  <Card key={item.id} title={item.name} />
));
```

### Why Keys Matter

- Helps React track changes efficiently
- Prevents unnecessary re-renders
- Keys must be unique & stable

## Passing Inline Styles as Props (Most Common)

### Parent Component

```javascript
function App() {
  const boxStyle = {
    width: "150px",
    height: "150px",
    backgroundColor: "orange",
    borderRadius: "8px"
  };

  return <Box style={boxStyle} />;
}
```

### Child Component

```javascript
function Box({ style }) {
  return <div style={style}></div>;
}
```

### Key Points

- Style object must be camelCased
- Passed as a normal prop
- Applied using `style={propName}`

## 3. Passing Partial Styles & Merging in Child

### Parent

```jsx
function App() {
  return (
    <Card
      bgColor="black"
      textColor="white"
    />
  );
}
```

### Child

```javascript
function Card({ bgColor, textColor }) {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: "20px"
      }}
    >
      Styled via Props
    </div>
  );
}
```