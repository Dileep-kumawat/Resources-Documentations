# 1. What is SASS?

Sass is a **CSS preprocessor**.

It adds programming-like features to CSS:

* Variables
* Nesting
* Reusable code
* Functions
* Logic
* Modular files

Then Sass compiles into normal CSS.

### Core Idea

You write:

```scss
$primary: blue;

.btn {
  color: $primary;
}
```

Compiler outputs:

```css
.btn {
  color: blue;
}
```

---

# 2. SCSS vs SASS

This confuses people because they think they are different technologies.

They are the **same preprocessor**, but different syntaxes.

| Feature              | SCSS | SASS |
| -------------------- | ---- | ---- |
| Uses `{}` and `;`    | Yes  | No   |
| Looks like CSS       | Yes  | No   |
| Easier for beginners | Yes  | Less |
| Most commonly used   | Yes  | Rare |

---

## SCSS Syntax

```scss
$color: red;

.box {
  color: $color;
}
```

---

## SASS Syntax

```sass
$color: red

.box
  color: $color
```

---

# Important Reality

Almost everyone today uses **SCSS**.

When people say:

> “SASS”

they usually mean:

> “SCSS”

---

# 3. Setting Up SCSS Environment

---

# Install Sass

Using Node.js:

```bash
npm install -g sass
```

Check version:

```bash
sass --version
```

---

# Compile SCSS → CSS

```bash
sass style.scss style.css
```

---

# Watch Mode (MOST IMPORTANT)

Automatically compiles when file changes.

```bash
sass --watch style.scss:style.css
```

---

# Folder Watch

```bash
sass --watch scss:css
```

Meaning:

* all `.scss` files in `scss`
* compiled into `css`

---

# Typical Project Structure

```plaintext
project/
│
├── scss/
│   ├── style.scss
│   ├── _variables.scss
│   ├── _mixins.scss
│
├── css/
│   └── style.css
│
└── index.html
```

---

# 4. Variables

Variables store reusable values.

---

# Syntax

```scss
$primary-color: blue;
$padding: 20px;
```

Usage:

```scss
button {
  background: $primary-color;
  padding: $padding;
}
```

---

# Why Variables Matter

Without variables:

```css
color: blue;
border: 1px solid blue;
background: blue;
```

Need to change everywhere manually.

With variables:

```scss
$primary: blue;
```

Change once → updates everywhere.

---

# Common Variable Types

```scss
$color: red;
$size: 20px;
$font: "Poppins";
$radius: 10px;
```

---

# Variable Scope

## Global Variable

```scss
$main: red;
```

Accessible everywhere.

---

## Local Variable

```scss
.box {
  $main: blue;
  color: $main;
}
```

Only inside `.box`.

---

# 5. Nesting

Nesting means writing selectors inside selectors.

---

# Normal CSS

```css
nav ul li a {
  color: red;
}
```

---

# SCSS

```scss
nav {
  ul {
    li {
      a {
        color: red;
      }
    }
  }
}
```

---

# Parent Selector `&`

Very important.

```scss
.button {
  &:hover {
    background: red;
  }
}
```

Compiles to:

```css
.button:hover
```

---

# Another Example

```scss
.card {
  &-title {
    font-size: 20px;
  }
}
```

Output:

```css
.card-title
```

---

# Nesting Warning

Too much nesting becomes unreadable.

Bad:

```scss
nav {
  ul {
    li {
      a {
        span {
```

Keep nesting shallow.

---

# 6. Partials and Imports

Large SCSS files become messy fast.

Solution:

* split files
* import them

---

# Partial Files

Partial file starts with `_`

Example:

```plaintext
_variables.scss
_mixins.scss
_buttons.scss
```

---

# Importing

Main file:

```scss
@import "variables";
@import "mixins";
```

---

# Why `_`?

Sass understands:

* partials should NOT compile separately

---

# Modern Alternative → `@use`

`@import` is old/deprecated.

Modern syntax:

```scss
@use "variables";
```

Using variable:

```scss
color: variables.$primary;
```

---

# Recall Shortcut

| Old       | New    |
| --------- | ------ |
| `@import` | `@use` |

Use `@use` in modern projects.

---

# 7. Mixins

Mixins = reusable style blocks.

Like reusable functions for CSS.

---

# Basic Mixin

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

Use:

```scss
.container {
  @include flex-center;
}
```

---

# Why Mixins Exist

Without mixins:

* repeated code everywhere

Mixins remove duplication.

---

# Mixins with Parameters

```scss
@mixin box($bg, $pad) {
  background: $bg;
  padding: $pad;
}
```

Usage:

```scss
.card {
  @include box(blue, 20px);
}
```

---

# Default Parameters

```scss
@mixin border-radius($radius: 10px) {
  border-radius: $radius;
}
```

---

# 8. Inheritance / Extend

Reuse styles from another selector.

---

# Syntax

```scss
.message {
  padding: 10px;
  border: 1px solid gray;
}

.success {
  @extend .message;
  color: green;
}
```

---

# Output

```css
.message, .success {
  padding: 10px;
  border: 1px solid gray;
}

.success {
  color: green;
}
```

---

# Difference: Mixins vs Extend

| Mixins            | Extend           |
| ----------------- | ---------------- |
| Duplicates CSS    | Merges selectors |
| Accept parameters | No parameters    |
| More flexible     | Smaller CSS      |

---

# Placeholder Selectors `%`

Used only for extending.

```scss
%box {
  padding: 20px;
}
```

Use:

```scss
.card {
  @extend %box;
}
```

---

# 9. Functions

Functions return values.

---

# Built-in Functions

```scss
lighten(red, 20%);
darken(blue, 10%);
```

---

# Custom Functions

```scss
@function double($size) {
  @return $size * 2;
}
```

Usage:

```scss
.box {
  width: double(20px);
}
```

---

# Why Functions Matter

Functions:

* compute values
* avoid hardcoding
* improve consistency

---

# 10. Operators

SCSS supports math operations.

---

# Arithmetic Operators

| Operator | Meaning  |
| -------- | -------- |
| `+`      | Add      |
| `-`      | Subtract |
| `*`      | Multiply |
| `/`      | Divide   |
| `%`      | Modulus  |

---

# Examples

```scss
.box {
  width: 100px + 50px;
  padding: 20px / 2;
}
```

---

# String Operations

```scss
$name: "btn";

.#{$name}-primary {
  color: blue;
}
```

Output:

```css
.btn-primary
```

This is called:

## Interpolation

---

# Comparison Operators

```scss
== != > < >= <=
```

Used in conditions.

---

# Logical Operators

```scss
and
or
not
```

---

# 11. Control Directives (Advanced)

This is where Sass behaves like a programming language.

---

# `@if`

```scss
$theme: dark;

body {
  @if $theme == dark {
    background: black;
  }
}
```

---

# `@else`

```scss
@if $theme == dark {
  color: white;
} @else {
  color: black;
}
```

---

# `@for`

Looping.

```scss
@for $i from 1 through 3 {
  .m-#{$i} {
    margin: #{$i * 10}px;
  }
}
```

Output:

```css
.m-1
.m-2
.m-3
```

---

# `@each`

Loop through list.

```scss
$colors: red, blue, green;

@each $color in $colors {
  .text-#{$color} {
    color: $color;
  }
}
```

---

# `@while`

```scss
$i: 1;

@while $i < 4 {
  .p-#{$i} {
    padding: #{$i * 10}px;
  }

  $i: $i + 1;
}
```

---

# When Control Directives Matter

Useful for:

* utility classes
* design systems
* responsive frameworks
* automation

---

# 12. Color Functions

Sass has powerful color utilities.

---

# Common Color Functions

| Function    | Purpose          |
| ----------- | ---------------- |
| `lighten()` | Makes lighter    |
| `darken()`  | Makes darker     |
| `mix()`     | Mix colors       |
| `rgba()`    | Add transparency |
| `invert()`  | Invert color     |

---

# Examples

```scss
$primary: blue;

.button {
  background: lighten($primary, 20%);
}
```

---

# Mix Colors

```scss
color: mix(red, blue, 50%);
```

---

# Transparency

```scss
background: rgba(0,0,0,0.5);
```

---

# 13. Fast Memory Revision (One-Screen Recall)

---

# SASS = CSS + Programming Features

Core features:

* Variables
* Nesting
* Mixins
* Functions
* Loops
* Imports

---

# SCSS vs SASS

| SCSS      | SASS        |
| --------- | ----------- |
| CSS-like  | indentation |
| Most used | rare        |

---

# Setup

```bash
npm install -g sass
sass --watch scss:css
```

---

# Variables

```scss
$primary: blue;
```

---

# Nesting

```scss
nav {
  a {
    color: red;
  }
}
```

---

# Parent Selector

```scss
&:hover
```

---

# Mixins

```scss
@mixin flex {}
@include flex;
```

---

# Extend

```scss
@extend .box;
```

---

# Function

```scss
@function size() {}
```

---

# Operators

```scss
+ - * /
```

---

# Loops

```scss
@for
@each
@while
```

---

# Condition

```scss
@if
@else
```

---

# Color Functions

```scss
lighten()
darken()
mix()
```

---

# Most Important Practical Understanding

People memorize Sass features but never understand the actual purpose.

Everything in Sass exists mainly for 3 reasons:

1. Reduce repetition
2. Improve maintainability
3. Organize large CSS codebases

If your Sass:

* becomes overly nested,
* too abstract,
* filled with unnecessary mixins/functions,

then you made your CSS worse, not better.

Good Sass simplifies CSS.
Bad Sass hides CSS behind complexity.