# 1. Starting with HTML

# What is HTML?

HTML = **HyperText Markup Language**

It structures content on webpages.

HTML is NOT:

* a programming language
* used for logic
* used for calculations

HTML ONLY defines:

* headings
* paragraphs
* images
* links
* forms
* layout structure

Think:

> HTML = Skeleton of a website

---

# Use Cases of HTML

HTML is used to:

* Build websites
* Create forms
* Embed media
* Structure content
* Create landing pages
* Build blog/article layouts

Without HTML:

* Browser has nothing to display

---

# First HTML Page in VS Code

## Steps

1. Open VS Code
2. Create folder
3. Create `index.html`
4. Type:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
```

5. Open in browser

Shortcut:

* Install Live Server extension
* Right click → Open with Live Server

---

# HTML Structure

Every HTML page has 3 major parts:

```html
<html>
    <head>
    </head>

    <body>
    </body>
</html>
```

## Meaning

| Tag    | Purpose           |
| ------ | ----------------- |
| `html` | Root of webpage   |
| `head` | Metadata/settings |
| `body` | Visible content   |

---

# Important Basic Tags

---

## `<!DOCTYPE html>`

Tells browser:

> "This document uses HTML5"

Always first line.

---

## `<html>`

Root element.

Everything goes inside it.

---

## `<head>`

Contains:

* title
* CSS links
* metadata
* scripts

NOT visible on webpage.

---

## `<title>`

Shown in:

* browser tab
* bookmarks
* search results

```html
<title>Portfolio</title>
```

---

## `<body>`

Contains all visible content.

---

# Text Elements

---

# Heading Tags (`h1` → `h6`)

```html
<h1>Main Heading</h1>
<h2>Sub Heading</h2>
```

## Rules

* `h1` = biggest
* `h6` = smallest
* Use hierarchy properly

Bad:

```html
<h1></h1>
<h4></h4>
```

Good:

```html
<h1></h1>
<h2></h2>
<h3></h3>
```

---

# Paragraph Tag (`p`)

```html
<p>This is paragraph.</p>
```

Used for text blocks.

---

# Break Tag (`br`)

Adds line break.

```html
Hello <br> World
```

No closing tag.

---

# Anchor Tag (`a`)

Creates links.

```html
<a href="https://google.com">Google</a>
```

## Important Attribute

| Attribute         | Meaning      |
| ----------------- | ------------ |
| `href`            | destination  |
| `target="_blank"` | open new tab |

Example:

```html
<a href="about.html">About</a>

<a href="https://google.com" target="_blank">
Google
</a>
```

---

# `span`

Inline container.

Used mostly for styling small text parts.

```html
<p>Hello <span>World</span></p>
```

---

# `code`

Displays code format.

```html
<code>console.log()</code>
```

---

# `pre`

Preserves:

* spaces
* line breaks

```html
<pre>
Hello
    World
</pre>
```

Useful for:

* poems
* code blocks

---

# HTML Lists

---

# Ordered List (`ol`)

Numbered list.

```html
<ol>
    <li>HTML</li>
    <li>CSS</li>
</ol>
```

---

# Unordered List (`ul`)

Bullet list.

```html
<ul>
    <li>Tea</li>
    <li>Coffee</li>
</ul>
```

---

# List Item (`li`)

Represents one item.

---

# Nested Elements

HTML elements can contain other elements.

Example:

```html
<div>
    <p>
        Hello <span>World</span>
    </p>
</div>
```

Structure matters.

Wrong nesting causes messy layouts.

---

# Media Tags

---

# Image Tag (`img`)

```html
<img src="cat.jpg" alt="cat">
```

## Important Attributes

| Attribute | Purpose        |
| --------- | -------------- |
| `src`     | image path     |
| `alt`     | alternate text |
| `width`   | width          |
| `height`  | height         |

---

# Why `alt` Matters

* Accessibility
* SEO
* Shows if image fails

---

# Video Tag

```html
<video controls width="400">
    <source src="movie.mp4">
</video>
```

---

# Audio Tag

```html
<audio controls>
    <source src="song.mp3">
</audio>
```

---

# Navigation Between Pages

```html
<a href="about.html">About Page</a>
```

If both files are in same folder:

* direct filename works

---

# 2. More on HTML

# Semantic Tags

Semantic tags give MEANING to layout.

Instead of:

```html
<div>
```

Use meaningful tags.

---

# Important Semantic Tags

| Tag       | Purpose             |
| --------- | ------------------- |
| `header`  | top section         |
| `main`    | main content        |
| `section` | grouped content     |
| `article` | independent content |
| `aside`   | sidebar             |
| `footer`  | bottom section      |
| `form`    | user input form     |
| `figure`  | image/media block   |
| `details` | expandable content  |

---

# Example Layout

```html
<header></header>

<main>
    <section>
        <article></article>
    </section>

    <aside></aside>
</main>

<footer></footer>
```

---

# Why Semantic Tags Matter

* Better SEO
* Better accessibility
* Easier maintenance
* Cleaner code

---

# Block vs Inline Elements

This is VERY important.

---

# Block Elements

Take full width.

Start on new line.

Examples:

* `div`
* `p`
* `h1`
* `section`

---

# Inline Elements

Take only needed width.

Stay in same line.

Examples:

* `span`
* `a`
* `strong`
* `img`

---

# Text Formatting Tags

---

# `b`

Bold text (visual only)

```html
<b>Bold</b>
```

---

# `strong`

Important text (semantic meaning)

```html
<strong>Important</strong>
```

Browser also makes it bold.

Prefer `strong` over `b`.

---

# `i`

Italic text.

---

# `small`

Small text.

---

# `ins`

Inserted text.

Usually underlined.

---

# `sub`

Subscript.

```html
H<sub>2</sub>O
```

---

# `sup`

Superscript.

```html
x<sup>2</sup>
```

---

# `del`

Deleted text.

Strikethrough.

```html
<del>500</del>
```

---

# `mark`

Highlighted text.

```html
<mark>Important</mark>
```

---

# HTML Tables

Used for tabular data.

NOT page layout.

---

# Structure

```html
<table border="1">

<tr>
    <th>Name</th>
    <th>Age</th>
</tr>

<tr>
    <td>Dileep</td>
    <td>20</td>
</tr>

</table>
```

---

# Table Tags

| Tag     | Meaning      |
| ------- | ------------ |
| `table` | entire table |
| `tr`    | table row    |
| `th`    | heading cell |
| `td`    | data cell    |

---

# 3. HTML Forms and Inputs

# Why Forms Matter

Forms collect user data.

Examples:

* Login
* Signup
* Feedback
* Payment
* Search

Without forms:

* websites cannot interact with users

---

# Basic Form Structure

```html
<form>

<label>Name</label>
<input type="text">

<button>Submit</button>

</form>
```

---

# Important Form Tags

| Tag        | Purpose          |
| ---------- | ---------------- |
| `form`     | form container   |
| `input`    | user input       |
| `textarea` | multiline text   |
| `select`   | dropdown         |
| `button`   | clickable button |
| `label`    | input label      |

---

# Input Types

---

# Text

```html
<input type="text">
```

---

# Checkbox

Multiple selection.

```html
<input type="checkbox">
```

---

# Radio

Single selection.

```html
<input type="radio">
```

---

# Number

```html
<input type="number">
```

---

# Date

```html
<input type="date">
```

---

# Color

```html
<input type="color">
```

---

# File

```html
<input type="file">
```

---

# Range

Slider.

```html
<input type="range">
```

---

# Tel

Phone number.

```html
<input type="tel">
```

---

# Submit

Submits form.

```html
<input type="submit">
```

---

# Textarea

Large text input.

```html
<textarea></textarea>
```

---

# Select Dropdown

```html
<select>
    <option>India</option>
    <option>USA</option>
</select>
```

---

# Form Attributes

---

# `action`

Where form data goes.

```html
<form action="/submit">
```

---

# `method`

How data is sent.

## GET

* visible in URL
* used for search

## POST

* hidden from URL
* used for sensitive data

```html
<form method="POST">
```

---

# `target`

Where response opens.

```html
target="_blank"
```

---

# `novalidate`

Disables validation.

---

# `enctype`

Defines data encoding.

Mostly used in file uploads.

```html
enctype="multipart/form-data"
```

---

# `name`

Important for backend data handling.

```html
<input name="username">
```

---

# `required`

Mandatory field.

```html
<input required>
```

---

# `placeholder`

Hint text.

```html
<input placeholder="Enter name">
```

---

# 4. Media Tags in HTML

# Audio Tag

```html
<audio controls>
    <source src="song.mp3">
</audio>
```

---

# Video Tag

```html
<video controls width="400">
    <source src="video.mp4">
</video>
```

---

# Important Media Attributes

| Attribute  | Meaning         |
| ---------- | --------------- |
| `src`      | file path       |
| `width`    | width           |
| `height`   | height          |
| `controls` | show controls   |
| `autoplay` | auto play       |
| `loop`     | repeat          |
| `muted`    | mute audio      |
| `alt`      | fallback text   |
| `media`    | media condition |

---

# `autoplay` Important Reality

Modern browsers often block:

```html
autoplay
```

unless:

```html
muted
```

is also used.

Example:

```html
<video autoplay muted>
```

---

# Using Multiple Sources

Browser picks supported format.

```html
<video controls>

<source src="movie.mp4" type="video/mp4">

<source src="movie.webm" type="video/webm">

</video>
```

---

# FAST RECALL SUMMARY

# Structure

```html
<!DOCTYPE html>
<html>
<head>
<title></title>
</head>

<body>
</body>
</html>
```

---

# Text Tags

| Tag     | Purpose             |
| ------- | ------------------- |
| `h1-h6` | headings            |
| `p`     | paragraph           |
| `br`    | line break          |
| `a`     | link                |
| `span`  | inline container    |
| `code`  | code                |
| `pre`   | preserve formatting |

---

# Lists

| Tag  | Purpose   |
| ---- | --------- |
| `ol` | ordered   |
| `ul` | unordered |
| `li` | list item |

---

# Media

| Tag     | Purpose |
| ------- | ------- |
| `img`   | image   |
| `audio` | sound   |
| `video` | video   |

---

# Semantic Tags

| Tag       | Purpose           |
| --------- | ----------------- |
| `header`  | top               |
| `main`    | main area         |
| `section` | grouped content   |
| `article` | independent block |
| `aside`   | sidebar           |
| `footer`  | bottom            |

---

# Forms

| Tag        | Purpose     |
| ---------- | ----------- |
| `form`     | form        |
| `input`    | input       |
| `textarea` | large input |
| `select`   | dropdown    |
| `button`   | button      |
| `label`    | label       |

---

# Most Important Beginner Mistakes

## 1. Forgetting closing tags

Wrong:

```html
<p>Hello
```

Correct:

```html
<p>Hello</p>
```

---

## 2. Using div for everything

Learn semantic tags early.

---

## 3. Not using alt in images

Bad accessibility.

---

## 4. Confusing block vs inline

This destroys layouts later in CSS.

---

## 5. Memorizing tags without building

Biggest waste of time.

You learn HTML by:

* building pages
* breaking layouts
* fixing mistakes

Not by rereading notes 15 times.

---

## 5 mini projects:

1. Personal profile page
2. Restaurant menu
3. Registration form
4. Simple blog page
5. YouTube-like video page