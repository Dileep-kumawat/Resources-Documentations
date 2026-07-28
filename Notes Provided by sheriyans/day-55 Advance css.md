# 📘 Day 55 - Advance Css Notes

## 🎨 1. Linear Gradient
A linear gradient creates a smooth color transition in a straight line.

### Syntax
```css
background: linear-gradient(direction, color1, color2);
```

### Example
```css
.box {
  width: 200px;
  height: 200px;
  background: linear-gradient(90deg, red, blue);
}
```

### Notes
- **90deg** = left → right  
- **180deg** = top → bottom  
- You can add more than 2 colors.

---

## 🌐 2. Radial Gradient
A radial gradient starts from the center and spreads outward.

### Syntax
```css
background: radial-gradient(shape, color1, color2);
```

### Example
```css
.box {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, yellow, green);
}
```

### Notes
- Default shape = **ellipse**
- Use **circle** for a perfect circle.

---

## 🌀 3. Conic Gradient
A conic gradient rotates around the center (like a color wheel).

### Syntax
```css
background: conic-gradient(color1, color2, color3);
```

### Example
```css
.box {
  width: 200px;
  height: 200px;
  background: conic-gradient(red, yellow, green, blue);
}
```

### Notes
- Colors follow a **circular path**
- Useful for **pie charts**.

---

## 🌱 4. `:root` Selector
`:root` = top-level element  
Used to store **global CSS variables**.

### Example
```css
:root {
  --main-color: #ff9500;
  --big-font: 32px;
}
```

---

## 🎛 5. CSS Variables (Custom Properties)

### Use
```css
.box {
  color: var(--main-color);
  font-size: var(--big-font);
}
```

---

## ⚙️ 6. `setProperty()` → Changing Variables in JS

### Example
```html
<div class="box"></div>

<script>
  document.documentElement.style
    .setProperty('--main-color', 'blue');
</script>
```

### Notes
- `document.documentElement` = `:root`
- Useful for **themes**, **dark mode**, **sliders**, **dynamic UI**

---

## 🟦 7. Box Shadow

### Syntax
```css
box-shadow: offsetX offsetY blur spread color;
```

### Example
```css
.card {
  width: 200px;
  height: 200px;
  box-shadow: 5px 10px 20px rgba(0,0,0,0.3);
}
```

### Notes
- **blur** = softness  
- **spread** = size  
- Use `rgba()` for transparent shadow

---

## ✍️ 8. Text Shadow

### Syntax
```css
text-shadow: offsetX offsetY blur color;
```

### Example
```css
h1 {
  text-shadow: 2px 2px 10px red;
}
```

---

## 🎞 9. @keyframes (Animations)

### Example
```css
@keyframes move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(200px);
  }
}

.box {
  width: 100px;
  height: 100px;
  background: orange;
  animation: move 2s linear infinite;
}
```

### Notes
- Use `%` (0% → 100%) to define animation steps
- `animation: name duration timing count;`
