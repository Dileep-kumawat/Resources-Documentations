# 1. Basics of CSS (Cascading Style Sheets)

---

## What is CSS?

CSS = **Cascading Style Sheets**

Used to style HTML:

* Colors
* Layout
* Fonts
* Spacing
* Animations
* Responsive design

Without CSS → plain ugly HTML.

### Why CSS is Important

* Separates design from structure
* Reusable styling
* Faster development
* Responsive websites
* Better UI/UX

---

# CSS Syntax

```css
selector {
  property: value;
}
```

Example:

```css
p {
  color: red;
  font-size: 20px;
}
```

### Parts

| Part    | Meaning  |
| ------- | -------- |
| `p`     | Selector |
| `color` | Property |
| `red`   | Value    |

---

# CSS Comments

```css
/* This is comment */
```

Used for:

* Notes
* Debugging
* Organizing code

---

# Adding CSS to HTML

---

## 1. Inline CSS

Inside HTML tag.

```html
<p style="color:red;">Hello</p>
```

### Pros

* Quick testing

### Cons

* Bad practice
* Hard to maintain

---

## 2. Internal CSS

Inside `<style>` tag.

```html
<style>
  p {
    color: blue;
  }
</style>
```

---

## 3. External CSS ✅ BEST

Separate `.css` file.

```html
<link rel="stylesheet" href="style.css">
```

```css
p {
  color: green;
}
```

### Why Best?

* Reusable
* Clean code
* Easy maintenance

---

# Selectors in CSS

---

## Element Selector

Targets HTML elements.

```css
p {
  color: red;
}
```

---

## Class Selector

Starts with `.`

Reusable.

```css
.box {
  background: yellow;
}
```

```html
<div class="box"></div>
```

---

## ID Selector

Starts with `#`

Unique element.

```css
#header {
  background: black;
}
```

```html
<div id="header"></div>
```

---

# Difference: class vs id vs element

| Type    | Symbol | Reusable | Priority |
| ------- | ------ | -------- | -------- |
| element | none   | Yes      | Low      |
| class   | `.`    | Yes      | Medium   |
| id      | `#`    | No       | High     |

---

# CSS Precedence (Specificity)

Higher specificity wins.

### Order:

```text
Inline > ID > Class > Element
```

Example:

```css
p { color: red; }
.text { color: blue; }
#title { color: green; }
```

```html
<p id="title" class="text">Hello</p>
```

Result → Green

---

# Text Styling Properties

---

## font-family

```css
font-family: Arial, sans-serif;
```

Fallback fonts used if first unavailable.

---

## font-style

```css
font-style: italic;
```

Values:

* normal
* italic
* oblique

---

## font-weight

```css
font-weight: bold;
```

Values:

* normal
* bold
* 100–900

---

## line-height

Space between lines.

```css
line-height: 1.5;
```

---

## text-decoration

```css
text-decoration: underline;
```

Values:

* none
* underline
* overline
* line-through

---

## text-align

```css
text-align: center;
```

---

## text-transform

```css
text-transform: uppercase;
```

Values:

* uppercase
* lowercase
* capitalize

---

## letter-spacing

```css
letter-spacing: 2px;
```

---

## word-spacing

```css
word-spacing: 10px;
```

---

## text-shadow

```css
text-shadow: 2px 2px 5px gray;
```

Format:

```css
horizontal vertical blur color
```

---

# 2. Styling With CSS

---

# Colors in CSS

---

## Named Colors

```css
color: red;
```

---

## RGB

```css
color: rgb(255,0,0);
```

---

## RGBA

A = opacity

```css
color: rgba(255,0,0,0.5);
```

---

## HEX

```css
color: #ff0000;
```

---

# CSS Units

---

## px

Fixed size.

```css
width: 200px;
```

---

## %

Relative to parent.

```css
width: 50%;
```

---

## rem

Relative to root (`html`) font size.

```css
font-size: 2rem;
```

Best for responsiveness.

---

## em

Relative to parent font size.

```css
padding: 2em;
```

---

## vw

Viewport width.

```css
width: 50vw;
```

---

## vh

Viewport height.

```css
height: 100vh;
```

---

## vmin / vmax

Based on smaller/larger viewport dimension.

---

# Borders

```css
border: 2px solid black;
```

Format:

```css
width style color
```

### Border Styles

* solid
* dashed
* dotted
* double

---

# Box Model 🔥

Every element is a box.

```text
Margin
 Border
  Padding
   Content
```

---

## margin

Outside spacing.

```css
margin: 20px;
```

---

## padding

Inside spacing.

```css
padding: 20px;
```

---

## width & height

```css
width: 300px;
height: 200px;
```

---

## box-sizing

### content-box (default)

Width excludes padding/border.

### border-box ✅ BEST

Includes padding/border.

```css
box-sizing: border-box;
```

---

# Background Properties

---

## background-image

```css
background-image: url(img.jpg);
```

---

## background-size

```css
background-size: cover;
```

Values:

* cover
* contain

---

## background-repeat

```css
background-repeat: no-repeat;
```

---

## background-position

```css
background-position: center;
```

---

## background-attachment

```css
background-attachment: fixed;
```

---

## linear-gradient

```css
background: linear-gradient(red, blue);
```

---

# Box Shadow

```css
box-shadow: 2px 2px 10px gray;
```

Format:

```css
x y blur color
```

---

# 3. More About CSS

---

# Display Property

---

## block

Takes full width.

Examples:

* div
* p

---

## inline

Only content width.

Examples:

* span
* a

Cannot apply width/height properly.

---

## inline-block

Inline + width/height allowed.

---

## none

Hides element.

```css
display: none;
```

---

## flex

Flexible layouts.

---

## grid

2D layouts.

---

# Flexbox 🔥 MOST IMPORTANT

Used for:

* Alignment
* Responsive layouts
* Centering

---

## Enable Flex

```css
.container {
  display: flex;
}
```

---

# Main Axis vs Cross Axis

Default:

* Main axis → row
* Cross axis → column

---

# flex-direction

```css
flex-direction: row;
```

Values:

* row
* column
* row-reverse
* column-reverse

---

# justify-content

Controls main axis.

```css
justify-content: center;
```

Values:

* center
* space-between
* space-around
* space-evenly

---

# align-items

Controls cross axis.

```css
align-items: center;
```

---

# flex-wrap

```css
flex-wrap: wrap;
```

Allows next line.

---

# flex-grow

Extra space distribution.

```css
flex-grow: 1;
```

---

# flex-shrink

Shrink behavior.

```css
flex-shrink: 0;
```

---

# flex-basis

Initial size.

```css
flex-basis: 200px;
```

---

# order

Changes visual order.

```css
order: 2;
```

---

# align-self

Individual alignment.

```css
align-self: flex-end;
```

---

# align-content

Controls multiple rows.

Works with wrapping.

---

# Flex Shorthand

```css
flex: grow shrink basis;
```

Example:

```css
flex: 1 1 200px;
```

---

# CSS Grid

---

## Enable Grid

```css
display: grid;
```

---

## grid-template-columns

```css
grid-template-columns: 1fr 1fr 1fr;
```

---

## gap

```css
gap: 20px;
```

---

## fr unit

Fractional space.

---

# Position Property

---

## static

Default.

---

## relative

Moves relative to original position.

```css
position: relative;
top: 20px;
```

---

## absolute

Relative to nearest positioned parent.

```css
position: absolute;
```

---

## fixed

Fixed on screen.

Navbar example.

---

## sticky

Sticks during scroll.

```css
position: sticky;
top: 0;
```

---

# Overflow

---

## visible

Default.

---

## hidden

Cuts extra content.

---

## scroll

Adds scrollbar.

---

## auto

Scrollbar if needed.

---

# Grouping Selectors

Apply same style to many.

```css
h1, p, div {
  color: blue;
}
```

---

# Nested Selectors

Target inside elements.

```css
nav a {
  color: white;
}
```

Used for:

* Specific targeting
* Cleaner structure

---

# 4. Interesting Things About CSS ✌️

---

# Pseudo Classes

Add styles on state.

---

## hover

```css
button:hover {
  background: red;
}
```

---

## focus

```css
input:focus {
  border: 2px solid blue;
}
```

---

## active

```css
button:active {
  transform: scale(0.9);
}
```

---

# Pseudo Elements

---

## before

```css
p::before {
  content: "🔥";
}
```

---

## after

```css
p::after {
  content: "✅";
}
```

---

# CSS Transition

Smooth animation.

```css
transition: all 0.3s ease;
```

---

## Components

| Property        | Meaning      |
| --------------- | ------------ |
| property        | what changes |
| duration        | time         |
| timing-function | speed curve  |
| delay           | wait time    |

---

# Timing Functions

* ease
* linear
* ease-in
* ease-out
* ease-in-out

---

# Transform

---

## translate

Move element.

```css
transform: translateX(50px);
```

---

## rotate

```css
transform: rotate(45deg);
```

---

## scale

```css
transform: scale(1.2);
```

---

## skew

```css
transform: skew(20deg);
```

---

# 3D Transform

---

## translate3d

```css
transform: translate3d(10px,20px,30px);
```

---

## translateZ

```css
transform: translateZ(50px);
```

---

## scale3d

```css
transform: scale3d(1.2,1.2,1.2);
```

---

## rotate3d

```css
transform: rotate3d(1,1,1,45deg);
```

---

# CSS Animation

---

## @keyframes

```css
@keyframes move {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(200px);
  }
}
```

---

## Apply Animation

```css
.box {
  animation: move 2s infinite;
}
```

---

# 5. Responsive Design 🖥️

---

# Mobile First vs Desktop First

---

## Mobile First ✅ BEST

Start for small screens.

```css
@media (min-width:768px)
```

Advantages:

* Better performance
* Cleaner scaling
* Modern standard

---

## Desktop First

Start large then shrink.

```css
@media (max-width:768px)
```

Harder to maintain.

---

# Responsive Units

| Unit  | Usage    |
| ----- | -------- |
| px    | fixed    |
| %     | relative |
| rem   | scalable |
| vw/vh | viewport |

---

# Viewport Meta Tag

VERY IMPORTANT.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Without this → mobile scaling breaks.

---

# Responsive Images

```css
img {
  max-width: 100%;
  height: auto;
}
```

---

# Responsive Typography

Use:

* rem
* clamp()

Example:

```css
font-size: clamp(1rem, 2vw, 2rem);
```

---

# Media Queries

Change styles by screen size.

```css
@media (max-width: 768px) {
  body {
    background: red;
  }
}
```

---

# min-width vs max-width

---

## min-width

Apply above size.

```css
@media (min-width:768px)
```

---

## max-width

Apply below size.

```css
@media (max-width:768px)
```

---

# clamp()

Dynamic responsive values.

```css
font-size: clamp(1rem, 3vw, 3rem);
```

Format:

```css
clamp(min, preferred, max)
```

---

# min() and max()

---

## min()

Uses smaller value.

```css
width: min(500px, 100%);
```

---

## max()

Uses larger value.

```css
width: max(300px, 50%);
```

---

# Responsive HTML Structure

Good structure matters more than random CSS.

---

## Use:

* semantic tags
* flexible containers
* proper nesting
* scalable layouts

Example:

```html
<header>
<nav></nav>
</header>

<main>
<section></section>
</main>

<footer></footer>
```

---

# MOST IMPORTANT CSS INTERVIEW/TRICK QUESTIONS 🔥

---

## Difference Between `display:none` and `visibility:hidden`

| display:none        | visibility:hidden |
| ------------------- | ----------------- |
| Removed from layout | Space remains     |
| Hidden completely   | Invisible only    |

---

## Difference Between `absolute` and `relative`

| relative                     | absolute                 |
| ---------------------------- | ------------------------ |
| Keeps space                  | Removed from flow        |
| Moves from original position | Moves relative to parent |

---

## Difference Between `em` and `rem`

| em                 | rem              |
| ------------------ | ---------------- |
| Relative to parent | Relative to root |

---

# GOLDEN RULES FOR CSS

---

## 1. Always use:

```css
box-sizing: border-box;
```

---

## 2. Prefer:

* flexbox
* grid
* rem
* mobile-first

---

## 3. Avoid:

* Too much absolute positioning
* Inline CSS
* Fixed heights everywhere

---

# FAST REVISION CHEAT SHEET ⚡

---

## Center with Flex

```css
display:flex;
justify-content:center;
align-items:center;
```

---

## Full Screen Section

```css
height:100vh;
```

---

## Responsive Image

```css
max-width:100%;
height:auto;
```

---

## Smooth Hover

```css
transition:0.3s ease;
```

---

## Common Reset

```css
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}
```