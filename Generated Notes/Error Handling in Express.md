# Error Handling in Express.js — Complete Recall Notes

## 1. What “Error Handling” Means in Express

Error handling = catching problems during request processing and sending a proper response instead of crashing the server.

Typical errors:

* Invalid user input
* Database failure
* Missing route
* Unauthorized access
* Programming bugs
* Async promise rejection

Goal:

* Prevent server crash
* Send meaningful responses
* Log errors
* Keep code maintainable

---

# 2. Basic Express Flow

Normal middleware:

```js
(req, res, next)
```

Error middleware:

```js
(err, req, res, next)
```

The extra `err` parameter makes Express recognize it as an error handler.

---

# 3. Simplest Error Handler

```js
app.use((err, req, res, next) => {
  res.status(500).send("Something broke!");
});
```

Usually placed LAST in app.

Why last?
Because Express executes middleware top → bottom.

---

# 4. Throwing Errors

## Inside Sync Code

```js
app.get("/", (req, res) => {
  throw new Error("Something failed");
});
```

Express automatically catches sync errors.

---

# 5. Async Errors (IMPORTANT)

This is where most beginners fail.

## Problem

```js
app.get("/", async (req, res) => {
  throw new Error("Async error");
});
```

In older Express versions, async errors may not automatically reach middleware.

---

# 6. Proper Async Error Handling

## Method 1 — try/catch

```js
app.get("/", async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
```

`next(err)` sends error to error middleware.

---

# 7. Async Wrapper Utility (Best Practice)

Avoid repeating try/catch everywhere.

## Create Wrapper

```js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};
```

## Usage

```js
app.get("/", asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

This pattern is extremely common.

---

# 8. The `next()` Function

## Normal flow

```js
next()
```

Moves to next middleware.

---

## Error flow

```js
next(err)
```

Skips all normal middleware and jumps directly to error middleware.

---

# 9. Custom Error Middleware

```js
app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message
  });

});
```

---

# 10. Proper Error Response Structure

Good API response:

```json
{
  "success": false,
  "message": "User not found"
}
```

Better:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

Avoid:

* Sending stack traces in production
* Sending raw DB errors to users

---

# 11. Custom Error Class (VERY IMPORTANT)

Instead of:

```js
throw new Error("User not found");
```

Use custom errors.

---

## Create Custom Error

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4")
      ? "fail"
      : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}
```

---

## Usage

```js
throw new AppError("User not found", 404);
```

---

# 12. Using Custom Error Middleware

```js
app.use((err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });

});
```

---

# 13. 404 Route Handling

Express doesn’t automatically handle unknown routes properly.

## Add This AFTER Routes

```js
app.all("*", (req, res, next) => {
  next(new AppError(
    `Can't find ${req.originalUrl}`,
    404
  ));
});
```

Then error middleware handles it.

---

# 14. Middleware Order (CRITICAL)

Correct order:

```js
app.use(express.json());

app.use("/api/users", userRoutes);

app.all("*", ...);

app.use(errorHandler);
```

Wrong order breaks error handling.

---

# 15. Validation Errors

Example:

```js
if (!email) {
  return next(new AppError(
    "Email required",
    400
  ));
}
```

Common status:

* 400 = bad request

---

# 16. Common HTTP Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 409  | Conflict     |
| 500  | Server Error |

Memorize these.

---

# 17. Global Unhandled Errors

Some errors happen outside Express.

---

## Unhandled Promise Rejection

```js
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
```

---

## Uncaught Exception

```js
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
```

These prevent silent crashes.

---

# 18. Development vs Production Errors

## Development

Show:

* Stack trace
* Detailed message

---

## Production

Hide:

* Internal implementation
* DB structure
* Sensitive info

Send generic response:

```js
{
  "message": "Something went wrong"
}
```

---

# 19. Centralized Error Handling (Best Architecture)

Bad:

* Error logic everywhere

Good:

* One central middleware handles all errors

Benefits:

* Cleaner code
* Easier debugging
* Consistent API responses

---

# 20. Full Professional Structure

## Folder Structure

```txt
project/
│
├── controllers/
├── routes/
├── middleware/
│   └── errorMiddleware.js
├── utils/
│   ├── asyncHandler.js
│   └── AppError.js
```

---

# 21. Full Real Example

## asyncHandler.js

```js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};

module.exports = asyncHandler;
```

---

## AppError.js

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500
      ? "fail"
      : "error";
  }
}

module.exports = AppError;
```

---

## errorMiddleware.js

```js
const errorMiddleware = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    success: false,
    message: err.message
  });

};

module.exports = errorMiddleware;
```

---

## Route Example

```js
router.get("/:id", asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(
      "User not found",
      404
    ));
  }

  res.json(user);

}));
```

---

## app.js

```js
app.use("/users", userRoutes);

app.all("*", (req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorMiddleware);
```

---

# 22. Most Common Beginner Mistakes

## Mistake 1

Forgetting `next(err)`

---

## Mistake 2

Putting error middleware before routes

---

## Mistake 3

Using try/catch everywhere manually

Use async wrapper.

---

## Mistake 4

Sending raw errors to client

Bad security practice.

---

## Mistake 5

Not returning after response

Bad:

```js
res.send("Done");
next(err);
```

---

# 23. Express Error Handling Flow (MEMORIZE)

genui{"math_block_widget_always_prefetch_v2":{"content":"f(x)=x"}}

Ignore the graph above — widget limitation. Actual recall flow:

```txt
Request
   ↓
Route Handler
   ↓
Error Occurs
   ↓
next(err)
   ↓
Error Middleware
   ↓
Response Sent
```

---

# 24. Fast Recall Cheat Sheet

## Error Middleware

```js
(err, req, res, next)
```

---

## Send Error

```js
next(err)
```

---

## Custom Error

```js
throw new AppError(msg, code)
```

---

## Async Wrapper

```js
Promise.resolve(fn()).catch(next)
```

---

## 404 Handler

```js
app.all("*", ...)
```

---

## Error Middleware Last

```js
app.use(errorHandler)
```

---

# 25. Interview-Level Concepts

## Operational Errors

Expected errors:

* Invalid input
* Missing data
* Unauthorized

Handled gracefully.

---

## Programming Errors

Developer mistakes:

* Undefined variable
* Logic bug

Usually crash-worthy.

---

# 26. Production Best Practices

Use:

* Winston / Pino logging
* Error monitoring
* Centralized responses
* Environment-based messages

Never:

* Leak stack traces
* Ignore promise rejections
* Use console.log everywhere

---

# 27. One-Line Memory Hooks

* `next(err)` → jump to error middleware
* Error middleware has 4 params
* Place error middleware LAST
* Use async wrapper for async routes
* Custom error class = professional backend
* 404 routes should also go through middleware

---

# 28. Final Mental Model

Think of Express like a pipeline:

```txt
Request enters
   ↓
Middlewares run
   ↓
Route executes
   ↓
If error:
   jump to error middleware
   ↓
Send formatted response
```

That’s the entire system.
