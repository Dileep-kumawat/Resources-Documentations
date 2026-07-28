# Express Validator — Complete Recall Notes

Official Docs: [Express Validator Documentation](https://express-validator.github.io/docs/?utm_source=chatgpt.com)

---

# 1. What is Express Validator?

A middleware library for **validating + sanitizing request data** in Express.js applications.

Used for:

* `req.body`
* `req.params`
* `req.query`
* headers/cookies (optional)

It prevents:

* invalid input
* malformed data
* missing fields
* security issues

---

# 2. Installation

```bash
npm install express-validator
```

---

# 3. Basic Structure

```js
const { body, validationResult } = require("express-validator");
```

### Validation Middleware

```js
body("email").isEmail()
```

### Error Extraction

```js
validationResult(req)
```

---

# 4. Basic Example

```js
const express = require("express");
const { body, validationResult } = require("express-validator");

const app = express();

app.use(express.json());

app.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    res.send("User Registered");
  }
);
```

---

# 5. Core Functions (MOST IMPORTANT)

| Function             | Purpose                 |
| -------------------- | ----------------------- |
| `body()`             | Validate request body   |
| `query()`            | Validate query params   |
| `param()`            | Validate URL params     |
| `header()`           | Validate headers        |
| `cookie()`           | Validate cookies        |
| `validationResult()` | Get validation errors   |
| `matchedData()`      | Get validated data only |

---

# 6. Validation Flow (MEMORIZE)

```text
Request
   ↓
Validation Middleware
   ↓
validationResult(req)
   ↓
If errors → send error response
Else → continue logic
```

---

# 7. Common Validators

## String Validators

```js
body("name").isString()
body("name").notEmpty()
body("name").isLength({ min: 3 })
```

---

## Email Validation

```js
body("email").isEmail()
```

---

## Password Validation

```js
body("password")
  .isLength({ min: 8 })
  .matches(/[A-Z]/)
  .matches(/[0-9]/)
```

---

## Number Validation

```js
body("age").isInt()
body("price").isFloat()
```

---

## Boolean Validation

```js
body("isAdmin").isBoolean()
```

---

## Date Validation

```js
body("dob").isDate()
```

---

## Array Validation

```js
body("tags").isArray()
```

---

# 8. Sanitization (VERY IMPORTANT)

Sanitization = cleaning input data.

| Sanitizer          | Purpose                |
| ------------------ | ---------------------- |
| `trim()`           | remove spaces          |
| `escape()`         | prevent HTML injection |
| `normalizeEmail()` | normalize email        |
| `toInt()`          | convert to integer     |
| `toBoolean()`      | convert to boolean     |

---

## Example

```js
body("email")
  .trim()
  .normalizeEmail()
  .isEmail()
```

---

# 9. Chaining Validators

Most common pattern.

```js
body("username")
  .notEmpty()
  .isLength({ min: 3 })
  .trim()
```

Validation runs top → bottom.

---

# 10. Custom Error Messages

## Using `.withMessage()`

```js
body("email")
  .isEmail()
  .withMessage("Invalid email")
```

---

# 11. Getting Errors

## `.array()`

```js
const errors = validationResult(req);

errors.array()
```

Output:

```js
[
  {
    msg: "Invalid email",
    path: "email"
  }
]
```

---

# 12. Custom Validation

Used when built-in validators are insufficient.

---

## Example: Username Already Exists

```js
body("username").custom(async (value) => {

  const user = await User.findOne({ username: value });

  if (user) {
    throw new Error("Username already exists");
  }

  return true;
})
```

---

# 13. Conditional Validation

## `.if()`

```js
body("password")
  .if(body("loginType").equals("local"))
  .notEmpty()
```

Meaning:

* validate password ONLY if loginType is local

---

# 14. Optional Fields

```js
body("bio").optional().isString()
```

If field missing:

* validator skipped

---

# 15. Nested Objects

```js
body("address.city").notEmpty()
```

---

# 16. Arrays Validation

## Validate every item

```js
body("skills.*").isString()
```

`*` means:

* every element

---

# 17. Bail Method

Stops validation chain after first failure.

```js
body("email")
  .isEmail()
  .bail()
  .custom(checkEmailExists)
```

Without `bail()`:

* unnecessary validations continue

---

# 18. Reusable Validation Middleware (IMPORTANT)

## Create Separate Validator File

```js
// validators/userValidator.js

const { body } = require("express-validator");

exports.registerValidator = [
  body("email").isEmail(),
  body("password").isLength({ min: 6 })
];
```

Use:

```js
const { registerValidator } = require("./validators/userValidator");

app.post("/register", registerValidator, controller);
```

---

# 19. Handling Errors Cleanly

## Common Pattern

```js
const validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};
```

Use:

```js
app.post(
  "/register",
  validations,
  validate,
  controller
);
```

This is production-style structure.

---

# 20. matchedData()

Returns ONLY validated fields.

```js
const data = matchedData(req);
```

Useful because:

* removes unwanted fields
* safer input handling

---

# 21. Common Real-World Example

```js
[
  body("name")
    .trim()
    .notEmpty(),

  body("email")
    .normalizeEmail()
    .isEmail(),

  body("password")
    .isLength({ min: 8 }),

  body("age")
    .optional()
    .isInt({ min: 18 })
]
```

---

# 22. Most Important Validators Cheat Sheet

| Validator     | Meaning            |
| ------------- | ------------------ |
| `notEmpty()`  | field not empty    |
| `isEmail()`   | valid email        |
| `isLength()`  | length validation  |
| `isInt()`     | integer            |
| `isFloat()`   | decimal            |
| `isBoolean()` | boolean            |
| `isArray()`   | array              |
| `isDate()`    | valid date         |
| `matches()`   | regex              |
| `equals()`    | exact match        |
| `contains()`  | contains substring |
| `optional()`  | field optional     |
| `custom()`    | custom logic       |

---

# 23. Most Important Sanitizers Cheat Sheet

| Sanitizer          | Meaning              |
| ------------------ | -------------------- |
| `trim()`           | remove spaces        |
| `escape()`         | escape HTML          |
| `normalizeEmail()` | clean email          |
| `toInt()`          | convert to int       |
| `toBoolean()`      | convert to bool      |
| `stripLow()`       | remove control chars |

---

# 24. Validation Locations

| Method     | Source      |
| ---------- | ----------- |
| `body()`   | req.body    |
| `query()`  | req.query   |
| `param()`  | req.params  |
| `header()` | req.headers |
| `cookie()` | cookies     |

---

# 25. Typical Folder Structure

```text
project/
│
├── validators/
│   └── userValidator.js
│
├── middleware/
│   └── validate.js
│
├── routes/
├── controllers/
```

---

# 26. Best Practices

## DO:

* validate every user input
* separate validators into files
* use `matchedData()`
* use custom messages
* sanitize inputs

## DON'T:

* trust frontend validation
* put validation logic inside controllers
* expose raw database errors

---

# 27. Interview Questions (HIGH VALUE)

## Q1. Why use Express Validator?

Because backend validation is mandatory for:

* security
* data integrity
* preventing invalid requests

---

## Q2. Difference between validation and sanitization?

| Validation         | Sanitization |
| ------------------ | ------------ |
| checks correctness | cleans data  |

Example:

* validation → is email valid?
* sanitization → remove spaces

---

## Q3. What does `validationResult()` do?

Collects all validation errors from middleware.

---

## Q4. What is `.custom()` used for?

Custom validation logic like:

* DB checks
* business rules
* uniqueness

---

# 28. Full Production Pattern (MEMORIZE THIS)

```js
const express = require("express");

const {
  body,
  validationResult
} = require("express-validator");

const app = express();

app.use(express.json());

const registerValidation = [
  body("name")
    .trim()
    .notEmpty(),

  body("email")
    .normalizeEmail()
    .isEmail(),

  body("password")
    .isLength({ min: 6 })
];

const validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  next();
};

app.post(
  "/register",
  registerValidation,
  validate,
  (req, res) => {
    res.send("Success");
  }
);
```

---

# 29. One-Line Memory Revision

```text
Define validators →
Run middleware →
Extract errors using validationResult →
If no errors → continue
```

---

# 30. Final Recall Map (FAST REVISION)

```text
express-validator
│
├── Validators
│   ├── isEmail
│   ├── isLength
│   ├── isInt
│   ├── matches
│   └── custom
│
├── Sanitizers
│   ├── trim
│   ├── escape
│   ├── normalizeEmail
│   └── toInt
│
├── Sources
│   ├── body
│   ├── query
│   ├── param
│   └── header
│
├── Errors
│   └── validationResult
│
└── Advanced
    ├── optional
    ├── if
    ├── bail
    ├── matchedData
    └── reusable middleware
```
