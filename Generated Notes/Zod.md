# Zod Complete Notes 

## What is Zod?

Zod = Runtime validation library for JavaScript/TypeScript.

Main purpose:

* Validate data at runtime
* Infer TypeScript types automatically
* Replace duplicate interfaces + manual validation

Think:

```ts
TypeScript = compile-time safety
Zod = runtime safety
```

Without Zod:

* API can send garbage
* User input can break app
* TS types disappear at runtime

With Zod:

* Data gets checked before usage

---

# Installation

```bash
npm install zod
```

Import:

```ts
import { z } from "zod";
```

([Zod][1])

---

# Core Mental Model

Everything starts with a **schema**.

```ts
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});
```

Schema = rules for data shape.

---

# Parsing

## `.parse()`

Throws error if invalid.

```ts
UserSchema.parse(data);
```

Good when:

* You WANT app to fail immediately

---

## `.safeParse()`

Returns success object.

```ts
const result = UserSchema.safeParse(data);

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}
```

Use this MOST of the time.

---

# Primitive Types

```ts
z.string()
z.number()
z.boolean()
z.bigint()
z.date()
z.undefined()
z.null()
z.symbol()
```

---

# String Validations

```ts
z.string().min(3)
z.string().max(20)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/abc/)
z.string().startsWith("A")
z.string().endsWith(".com")
```

Example:

```ts
const Email = z.string().email();
```

---

# Number Validations

```ts
z.number().min(1)
z.number().max(100)
z.number().positive()
z.number().negative()
z.number().int()
z.number().finite()
```

Example:

```ts
const Age = z.number().int().min(18);
```

---

# Boolean

```ts
z.boolean()
```

---

# Arrays

```ts
z.array(z.string())
```

Example:

```ts
const Tags = z.array(z.string());
```

Validation:

```ts
z.array(z.number()).min(1).max(5)
```

---

# Objects (MOST IMPORTANT)

```ts
const User = z.object({
  name: z.string(),
  age: z.number(),
});
```

Nested object:

```ts
const User = z.object({
  profile: z.object({
    username: z.string(),
  }),
});
```

---

# Optional Fields

```ts
z.string().optional()
```

Example:

```ts
const User = z.object({
  name: z.string(),
  bio: z.string().optional(),
});
```

---

# Nullable

Allows `null`

```ts
z.string().nullable()
```

---

# Default Values

```ts
z.string().default("Anonymous")
```

---

# Enums

```ts
const Role = z.enum(["admin", "user", "guest"]);
```

Usage:

```ts
Role.parse("admin");
```

---

# Literal

Exact fixed value.

```ts
z.literal("success")
```

---

# Union Types

Accept multiple possible types.

```ts
z.union([
  z.string(),
  z.number()
])
```

Shortcut:

```ts
z.string().or(z.number())
```

---

# Discriminated Union (IMPORTANT)

Best for API responses.

```ts
const Response = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: z.string(),
  }),
  z.object({
    status: z.literal("error"),
    message: z.string(),
  }),
]);
```

---

# Tuples

Fixed-size array.

```ts
z.tuple([
  z.string(),
  z.number(),
])
```

---

# Records

Dynamic keys.

```ts
z.record(z.string())
```

Example:

```ts
const Settings = z.record(z.boolean());
```

---

# Any / Unknown

```ts
z.any()
z.unknown()
```

Difference:

* `any` = unsafe
* `unknown` = safer

Avoid `any`.

---

# Type Inference (VERY IMPORTANT)

Zod can generate TS types.

```ts
const User = z.object({
  name: z.string(),
  age: z.number(),
});

type UserType = z.infer<typeof User>;
```

This is one of Zod’s biggest advantages. ([Zod][1])

---

# Refinement (Custom Validation)

## `.refine()`

```ts
const Password = z.string().refine(
  (val) => val.length >= 8,
  {
    message: "Password too short",
  }
);
```

---

# Super Refine

Access entire object.

```ts
const Form = z.object({
  password: z.string(),
  confirm: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm"],
    });
  }
});
```

Use when validation depends on multiple fields.

---

# Transform

Modify data after validation.

```ts
const schema = z.string().transform(val => val.toUpperCase());
```

Input:

```ts
"hello"
```

Output:

```ts
"HELLO"
```

---

# Preprocess

Modify BEFORE validation.

```ts
z.preprocess(
  (val) => Number(val),
  z.number()
);
```

Useful for forms.

---

# Coercion (IMPORTANT)

Automatically converts types.

```ts
z.coerce.number()
z.coerce.string()
z.coerce.boolean()
z.coerce.date()
```

Example:

```ts
z.coerce.number().parse("42");
```

Result:

```ts
42
```

([Zod][2])

---

# Async Validation

```ts
const schema = z.string().refine(
  async (val) => {
    return val !== "taken";
  }
);
```

Use:

```ts
await schema.parseAsync(data);
```

---

# Error Handling

```ts
try {
  schema.parse(data);
} catch (err) {
  console.log(err.errors);
}
```

---

# Custom Error Messages

```ts
z.string().min(3, {
  message: "Too short",
});
```

---

# Object Utilities

## `.pick()`

```ts
User.pick({
  name: true,
});
```

---

## `.omit()`

```ts
User.omit({
  password: true,
});
```

---

## `.partial()`

Makes all fields optional.

```ts
User.partial()
```

---

## `.required()`

Makes optional fields required again.

```ts
User.required()
```

---

## `.extend()`

```ts
const Admin = User.extend({
  role: z.string(),
});
```

---

## `.merge()`

```ts
A.merge(B)
```

---

# Recursive Schemas

Use `z.lazy()`

```ts
const Category = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(Category),
  })
);
```

---

# Date Validation

```ts
z.date()
```

With coercion:

```ts
z.coerce.date()
```

---

# Function Schema

```ts
z.function()
```

Example:

```ts
const myFunc = z.function()
  .args(z.string())
  .returns(z.number());
```

---

# Promise Schema

```ts
z.promise(z.string())
```

---

# Instance Validation

```ts
z.instanceof(Error)
```

---

# Native Enum

```ts
enum Role {
  ADMIN,
  USER,
}

z.nativeEnum(Role);
```

---

# Strict vs Passthrough

## Strict

Reject unknown fields.

```ts
z.object({
  name: z.string(),
}).strict()
```

---

## Passthrough

Allow extra fields.

```ts
.passthrough()
```

---

# Catch Values

Fallback if invalid.

```ts
z.number().catch(0)
```

---

# Branding

Advanced typing.

```ts
const UserId = z.string().brand<"UserId">();
```

Used for safer IDs.

---

# Real World Usage

## API Validation

```ts
const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.string()),
});

const result = ResponseSchema.parse(apiData);
```

---

## Form Validation

Works heavily with:

* React Hook Form
* Next.js
* Express
* tRPC

---

# Zod + React Hook Form

```ts
const schema = z.object({
  email: z.string().email(),
});
```

Resolver:

```ts
zodResolver(schema)
```

---

# Zod + Express

```ts
app.post("/user", (req, res) => {
  const result = User.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  res.json(result.data);
});
```

---

# Zod + Next.js

Validate:

* API routes
* Server actions
* Form data
* Environment variables

---

# Environment Variable Validation

VERY useful.

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number(),
});

const env = envSchema.parse(process.env);
```

---

# Common Interview Questions

## Why Zod over TypeScript alone?

Because TS disappears at runtime.

---

## Difference between parse and safeParse?

| parse            | safeParse           |
| ---------------- | ------------------- |
| throws error     | returns object      |
| crash on invalid | controlled handling |

---

## Why use infer?

Avoid duplicate types.

---

## refine vs transform

| refine    | transform |
| --------- | --------- |
| validates | modifies  |

---

# Most Important Things to Remember

## 1. Everything is schema-based

```ts
const schema = z.object({...})
```

---

## 2. `safeParse()` is safer

Use it most times.

---

## 3. `z.infer` removes duplicate typing

Huge productivity boost.

---

## 4. Coercion solves form problems

```ts
z.coerce.number()
```

---

## 5. refine = custom validation

---

# The 20% You Actually Use Daily

If you're honest, most developers repeatedly use ONLY these:

```ts
z.object()
z.string()
z.number()
z.boolean()
z.array()
.optional()
.min()
.max()
.email()
.safeParse()
z.infer
.extend()
.partial()
.refine()
z.enum()
z.coerce.number()
```

Everything else is situational.

Most people waste time memorizing obscure APIs they rarely touch.

---

# Best Learning Path

## Phase 1

Master:

* object
* string
* number
* array
* parse
* safeParse

---

## Phase 2

Learn:

* infer
* optional
* enum
* refine
* transform

---

## Phase 3

Advanced:

* discriminated unions
* recursive schemas
* async validation
* branded types

---

# Quick Recall Map

```txt
z.object()        -> objects
z.string()        -> strings
z.number()        -> numbers
z.array()         -> arrays
.safeParse()      -> safe validation
z.infer           -> TS types
.refine()         -> custom rules
.transform()      -> modify output
.optional()       -> optional fields
.partial()        -> optional object
.extend()         -> extend schema
z.enum()          -> enums
z.union()         -> multiple types
z.coerce.number() -> convert input
```

---

# Biggest Beginner Mistakes

## 1. Using TypeScript types WITHOUT runtime validation

Bad assumption:

> "TS already validates."

Wrong.

TS only checks during development.

---

## 2. Overusing `parse()`

Your app crashes unnecessarily.

Use `safeParse()`.

---

## 3. Using `any`

Destroys Zod’s value.

---

## 4. Writing duplicate interfaces

Wrong:

```ts
interface User {}
const UserSchema = z.object(...)
```

Better:

```ts
type User = z.infer<typeof UserSchema>
```

---

# Official Docs

* [Zod Official Docs](https://zod.dev?utm_source=chatgpt.com)

Useful references:

* ([Zod][1])

[1]: https://zod.dev/?utm_source=chatgpt.com "Intro | Zod"
[2]: https://zod.dev/api?id=sets&utm_source=chatgpt.com "Defining schemas | Zod"