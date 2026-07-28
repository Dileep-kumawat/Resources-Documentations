# Authentication, Authorization, Verification & Validation

## Full-Stack MERN Developer Recall Notes

---

# 1. Big Picture (Don’t Confuse These Again)

| Term               | Core Question                      | Purpose            |
| ------------------ | ---------------------------------- | ------------------ |
| **Authentication** | “Who are you?”                     | Identity checking  |
| **Authorization**  | “What can you access?”             | Permission control |
| **Verification**   | “Is this thing genuine/confirmed?” | Trust confirmation |
| **Validation**     | “Is this data correct/safe?”       | Data correctness   |

Most beginners mix these because they sound similar. They are not.

---

# 2. Authentication (AuthN)

## Definition

Process of identifying a user.

## Real Example

* User enters email + password
* Server checks credentials
* If correct → user is authenticated

---

# Authentication Flow in MERN

```text
Client (React)
    ↓
Login Form
    ↓
Express API
    ↓
MongoDB User Check
    ↓
Password Compare
    ↓
JWT/Session Created
    ↓
User Logged In
```

---

# Common Authentication Methods

## A. Password Authentication

### Flow

```text
User registers
→ password hashed
→ stored in DB

User logs in
→ entered password compared with hash
```

---

## B. JWT Authentication (Most Common in MERN)

### JWT Structure

```text
HEADER.PAYLOAD.SIGNATURE
```

Example:

```text
eyJhbGc...
```

---

## JWT Login Flow

```text
1. User logs in
2. Server validates credentials
3. Server creates JWT
4. JWT sent to frontend
5. Frontend stores token
6. Token sent in future requests
7. Backend verifies token
```

---

# JWT Creation

## Backend

```js
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

---

# JWT Verification

```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

# Middleware Example

```js
const protect = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

---

# Password Hashing

Never store plain passwords.

## Use:

* bcrypt

---

## Hash Password

```js
const bcrypt = require("bcryptjs");

const hashed = await bcrypt.hash(password, 10);
```

---

## Compare Password

```js
const isMatch = await bcrypt.compare(password, user.password);
```

---

# Sessions vs JWT

| Sessions               | JWT              |
| ---------------------- | ---------------- |
| Stored on server       | Stored on client |
| Stateful               | Stateless        |
| More secure by default | Scalable         |
| Uses cookies           | Uses token       |

---

# Where Store JWT?

| Storage         | Good?  | Why              |
| --------------- | ------ | ---------------- |
| localStorage    | risky  | XSS attacks      |
| sessionStorage  | better | temporary        |
| httpOnly cookie | best   | JS cannot access |

---

# Authentication Types

| Type             | Usage                    |
| ---------------- | ------------------------ |
| Email + Password | Standard                 |
| OTP              | Phone/email verification |
| OAuth            | Google/GitHub login      |
| MFA/2FA          | Extra security           |

---

# OAuth

Login using Google/GitHub/etc.

Flow:

```text
User clicks Google Login
→ Google authenticates
→ returns token/profile
→ backend verifies
→ user logged in
```

---

# 2FA (Two Factor Authentication)

Something user:

* Knows → password
* Has → OTP/mobile
* Is → fingerprint

---

# Common Authentication Errors

| Mistake                       | Problem               |
| ----------------------------- | --------------------- |
| Plain passwords               | Massive security risk |
| Weak JWT secret               | Token forgery         |
| No token expiry               | Permanent compromise  |
| Trusting frontend             | Security hole         |
| Storing sensitive data in JWT | Data exposure         |

---

# Authentication Status Codes

| Code | Meaning                      |
| ---- | ---------------------------- |
| 200  | Success                      |
| 201  | Created                      |
| 400  | Bad request                  |
| 401  | Unauthorized (not logged in) |
| 403  | Forbidden                    |
| 500  | Server error                 |

---

# 3. Authorization (AuthZ)

## Definition

Determines what authenticated users are allowed to do.

Authentication happens FIRST.
Authorization happens SECOND.

---

# Example

```text
Logged in as user
→ Can read profile

Logged in as admin
→ Can delete users
```

---

# Authorization Types

## A. Role-Based Access Control (RBAC)

Roles:

* admin
* user
* moderator

---

# Example User Schema

```js
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
});
```

---

# Role Middleware

```js
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  next();
};
```

---

# Protected Route

```js
router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);
```

---

# Authorization Flow

```text
User logged in
→ JWT verified
→ Role checked
→ Access granted/denied
```

---

# Permission-Based Authorization

Instead of roles:

```text
can_create_post
can_delete_post
can_edit_user
```

More flexible than RBAC.

---

# Ownership Authorization

Example:

```text
User can edit ONLY their own post
```

---

## Example

```js
if (post.user.toString() !== req.user.id) {
  return res.status(403).json({
    message: "Not allowed"
  });
}
```

---

# Common Authorization Mistakes

| Mistake                | Result            |
| ---------------------- | ----------------- |
| Only hiding UI buttons | Not secure        |
| No backend role check  | Anyone can access |
| Overpowered admin role | Dangerous         |
| Trusting frontend role | Huge mistake      |

---

# 4. Verification

## Definition

Confirming something is genuine or valid.

This is broader than authentication.

---

# Types of Verification

| Type                  | Example                |
| --------------------- | ---------------------- |
| Email verification    | Verify email ownership |
| Phone verification    | OTP SMS                |
| Identity verification | KYC                    |
| Token verification    | JWT verify             |
| CAPTCHA verification  | Human check            |

---

# Email Verification Flow

```text
1. User registers
2. Server creates verification token
3. Email sent
4. User clicks link
5. Backend verifies token
6. Account activated
```

---

# Example Verification Token

```js
const crypto = require("crypto");

const token = crypto.randomBytes(32).toString("hex");
```

---

# Verification Link

```text
https://example.com/verify/abc123
```

---

# Verify Route

```js
router.get("/verify/:token", async (req, res) => {
  const user = await User.findOne({
    verificationToken: req.params.token
  });

  if (!user) {
    return res.status(400).send("Invalid token");
  }

  user.isVerified = true;
  await user.save();

  res.send("Verified");
});
```

---

# OTP Verification

## Flow

```text
Generate OTP
→ Send SMS/email
→ User enters OTP
→ Backend checks
→ Verified
```

---

# CAPTCHA Verification

Prevents:

* bots
* spam
* brute force

Examples:

* reCAPTCHA
* hCaptcha

---

# Token Verification

JWT:

```js
jwt.verify(token, secret)
```

Purpose:

* ensure token not modified
* ensure token valid

---

# Common Verification Mistakes

| Mistake               | Result        |
| --------------------- | ------------- |
| Long OTP expiry       | Security risk |
| Reusable tokens       | Vulnerability |
| No email verification | Fake accounts |
| Weak OTP              | Easy guessing |

---

# 5. Validation

## Definition

Checking whether input data is correct, safe, and usable.

Validation is NOT security alone.
It’s data integrity.

---

# Why Validation Matters

Without validation:

* crashes
* bad data
* injection attacks
* broken UI
* corrupted DB

---

# Frontend Validation

Done in React.

Purpose:

* better UX
* instant feedback

---

# Backend Validation

MOST IMPORTANT.

Because frontend can be bypassed.

---

# NEVER Trust Frontend

This is one of the most important backend rules.

Anyone can send requests directly to your API.

---

# Types of Validation

| Type         | Example        |
| ------------ | -------------- |
| Required     | email required |
| Format       | valid email    |
| Length       | password min 8 |
| Type         | number/string  |
| Range        | age > 18       |
| Sanitization | remove scripts |

---

# Frontend Validation Example

```js
if (!email.includes("@")) {
  setError("Invalid email");
}
```

---

# Backend Validation Example

```js
if (!email || !password) {
  return res.status(400).json({
    message: "Missing fields"
  });
}
```

---

# Express Validator

```bash
npm install express-validator
```

---

# Example

```js
const { body, validationResult } =
  require("express-validator");

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 8 })
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    res.send("Success");
  }
);
```

---

# Mongoose Validation

```js
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  }
});
```

---

# Sanitization

Removes dangerous input.

Example:

```text
<script>alert(1)</script>
```

---

# Preventing Injection

## MongoDB Injection Example

Bad:

```js
User.findOne(req.body)
```

Good:

```js
User.findOne({ email: req.body.email })
```

---

# XSS Protection

Danger:

```html
<script>
```

Use:

* sanitization
* escaping
* helmet

---

# SQL Injection?

MongoDB also has injection risks.
Don’t think NoSQL means safe.

---

# Validation Libraries

| Library           | Usage                     |
| ----------------- | ------------------------- |
| Joi               | Backend schema validation |
| Yup               | Frontend validation       |
| Zod               | Type-safe validation      |
| express-validator | Express middleware        |

---

# Zod Example

```js
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

---

# Validation vs Verification

| Validation         | Verification          |
| ------------------ | --------------------- |
| Checks correctness | Confirms authenticity |
| “Is input valid?”  | “Is this real?”       |
| Email format check | Email ownership check |

---

# Authentication vs Authorization

| Authentication | Authorization       |
| -------------- | ------------------- |
| Who are you?   | What can you do?    |
| Login          | Permissions         |
| Happens first  | Happens after login |

---

# Full MERN Secure Auth Flow

```text
User Registers
↓
Validate Input
↓
Hash Password
↓
Save User
↓
Send Verification Email
↓
User Verifies Email
↓
Login
↓
Authenticate User
↓
Generate JWT
↓
Store Token Securely
↓
Access Protected Routes
↓
Authorization Middleware Checks Role
```

---

# Security Essentials for MERN

## Use:

* HTTPS
* bcrypt
* JWT expiry
* httpOnly cookies
* Rate limiting
* Helmet
* CORS config
* Validation everywhere

---

# Essential Packages

| Package           | Purpose               |
| ----------------- | --------------------- |
| bcryptjs          | Hash passwords        |
| jsonwebtoken      | JWT                   |
| express-validator | Validation            |
| helmet            | Security headers      |
| cors              | Cross-origin control  |
| cookie-parser     | Cookies               |
| dotenv            | Environment variables |

---

# Important Middleware Stack

```js
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
```

---

# Rate Limiting

Prevents brute force attacks.

```js
const rateLimit = require("express-rate-limit");

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

---

# CORS

Controls which frontend can access backend.

```js
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
```

---

# Secure Cookie

```js
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
});
```

---

# Environment Variables

Never hardcode secrets.

```env
JWT_SECRET=mysecret
MONGO_URI=...
```

---

# Folder Structure Example

```text
backend/
│
├── controllers/
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│
├── models/
├── routes/
├── utils/
├── config/
└── server.js
```

---

# Interview Recall Section

## Quick Definitions

### Authentication

Identifying user identity.

### Authorization

Controlling access permissions.

### Verification

Confirming authenticity.

### Validation

Checking correctness of data.

---

# Most Asked Interview Questions

## Why hash passwords?

Because storing plain passwords is catastrophic.

---

## Why backend validation required?

Frontend validation can be bypassed.

---

## Difference between 401 and 403?

| Code | Meaning                     |
| ---- | --------------------------- |
| 401  | Not authenticated           |
| 403  | Authenticated but forbidden |

---

## Why use JWT?

Stateless scalable authentication.

---

## Why httpOnly cookies?

Prevents JS token theft via XSS.

---

# Mental Shortcut (Memorize This)

```text
Authentication → Identity
Authorization → Permission
Verification → Authenticity
Validation → Correctness
```

---

# One-Line Memory Map

```text
Validate input
→ Verify email
→ Authenticate login
→ Authorize access
```

That sequence alone clears confusion for most developers.
