# Google OAuth + JWT Authentication in Node.js — Refined Notes

## 1. Prerequisites

Before starting, ensure you have:

* **Node.js** installed
* A **Google account**
* Basic understanding of:

  * JavaScript
  * Node.js
  * Express.js
  * Authentication concepts

---

# 2. Goal of This Setup

The objective is to:

1. Authenticate users using **Google OAuth 2.0**
2. Receive user profile information from Google
3. Generate a **JWT (JSON Web Token)**
4. Send the JWT to the client for authenticated access

---

# 3. Core Concepts You Must Understand

## A. OAuth 2.0

OAuth allows users to log in using Google without sharing passwords with your app.

### Flow:

1. User clicks **Login with Google**
2. User is redirected to Google
3. Google asks permission
4. Google sends user back to your app
5. Your app receives authenticated user info

---

## B. JWT (JSON Web Token)

JWT is used to maintain authentication after login.

A JWT contains:

* User information (payload)
* Signature for verification

Example structure:

```txt
header.payload.signature
```

### Why JWT?

* Stateless authentication
* No session storage required
* Commonly used in APIs

---

## C. Passport.js

`passport` is authentication middleware for Node.js.

Purpose:

* Simplifies authentication strategies
* Handles OAuth flow

---

## D. Google OAuth Strategy

`passport-google-oauth20` is Passport’s Google authentication strategy.

It handles:

* Redirecting users to Google
* Receiving callback data
* Extracting user profile info

---

# 4. Setting Up Google OAuth Credentials

## Step 1: Open Google Cloud Console

Go to:

* Google Cloud Console

Sign in using your Google account.

---

## Step 2: Create Project

### Process:

1. Click project dropdown
2. Select **New Project**
3. Enter project name
4. Click **Create**

### Purpose:

Google requires every OAuth app to belong to a project.

---

## Step 3: Configure OAuth Consent Screen

Path:

```txt
APIs & Services → OAuth consent screen
```

### Choose:

* **External** user type

### Fill:

* App name
* Support email
* Developer contact email

### Why This Exists:

Google needs to know:

* Which app requests data
* Who owns the app
* What users will see during login

---

## Step 4: Create OAuth Client ID

Path:

```txt
APIs & Services → Credentials
```

### Create:

```txt
OAuth Client ID
```

### Application Type:

```txt
Web Application
```

### Authorized Redirect URI:

```txt
http://localhost:3000/auth/google/callback
```

---

## IMPORTANT CONCEPT — Redirect URI

This is where Google sends users after authentication.

If it doesn’t match exactly:

* Authentication fails

---

## Credentials You Receive

Google provides:

```env
CLIENT_ID
CLIENT_SECRET
```

### Their Purpose

| Credential    | Purpose                      |
| ------------- | ---------------------------- |
| Client ID     | Identifies your app          |
| Client Secret | Proves your app is authentic |

---

# 5. Initialize Node.js Project

## Create Project Folder

```bash
mkdir google-auth-jwt
cd google-auth-jwt
```

---

## Initialize npm

```bash
npm init -y
```

### Result:

Creates:

```txt
package.json
```

This stores:

* dependencies
* scripts
* project metadata

---

# 6. Install Dependencies

```bash
npm install express passport passport-google-oauth20 jsonwebtoken dotenv
```

---

# 7. Dependency Breakdown

| Package                 | Purpose                    |
| ----------------------- | -------------------------- |
| express                 | Backend framework          |
| passport                | Authentication middleware  |
| passport-google-oauth20 | Google OAuth strategy      |
| jsonwebtoken            | Create & verify JWT        |
| dotenv                  | Load environment variables |

---

# 8. Environment Variables

Create:

```txt
.env
```

Add:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-secret-key
```

---

# 9. Why Environment Variables Matter

Sensitive information should NEVER be hardcoded.

Bad practice:

```js
const secret = "mysecret";
```

Good practice:

```js
process.env.JWT_SECRET
```

---

# 10. Express Application Setup

Create:

```txt
app.js
```

---

# 11. Import Required Modules

```js
require('dotenv').config();

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const { Strategy: GoogleStrategy } =
require('passport-google-oauth20');
```

---

# 12. What Each Import Does

| Import         | Role                        |
| -------------- | --------------------------- |
| dotenv         | Loads `.env` values         |
| express        | Creates server              |
| passport       | Handles authentication      |
| jsonwebtoken   | Generates JWT               |
| GoogleStrategy | Google OAuth implementation |

---

# 13. Initialize Express App

```js
const app = express();
```

Creates the Express application instance.

---

# 14. Initialize Passport

```js
app.use(passport.initialize());
```

### Why Needed?

Activates Passport middleware inside Express.

Without this:

* Authentication routes won't work.

---

# 15. Configure Google OAuth Strategy

```js
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));
```

---

# 16. Understanding Strategy Configuration

## clientID

Identifies your app to Google.

---

## clientSecret

Verifies your app authenticity.

---

## callbackURL

Where Google redirects after login.

---

# 17. Understanding Callback Function

```js
(accessToken, refreshToken, profile, done)
```

### Parameters

| Parameter    | Meaning                           |
| ------------ | --------------------------------- |
| accessToken  | Token from Google APIs            |
| refreshToken | Used to refresh expired tokens    |
| profile      | User profile information          |
| done         | Signals authentication completion |

---

# 18. User Profile Object

`profile` may contain:

* Google ID
* Name
* Email
* Profile picture

Example:

```js
profile.displayName
profile.id
```

---

# 19. Database Concept (Important)

The example directly returns the profile:

```js
return done(null, profile);
```

Real applications SHOULD:

1. Check if user exists
2. Create user if not
3. Store user in database

Because:

* Google profile alone is temporary
* Your app needs persistent users

---

# 20. Route to Start Authentication

```js
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);
```

---

# 21. Understanding OAuth Scope

Scopes define what data your app requests.

Example:

```js
['profile', 'email']
```

Requests access to:

* Basic profile
* User email

---

# 22. Authentication Callback Route

```js
app.get('/auth/google/callback',
  passport.authenticate('google', {
    session: false
  }),
  (req, res) => {

  }
);
```

---

# 23. Why `session: false`?

Because JWT authentication is:

* Stateless
* Sessionless

No server-side session storage needed.

---

# 24. Generate JWT

```js
const token = jwt.sign(
  {
    id: req.user.id,
    displayName: req.user.displayName
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

---

# 25. JWT Structure Explained

## Payload

```js
{
  id: req.user.id,
  displayName: req.user.displayName
}
```

Data stored inside token.

---

## Secret Key

```js
process.env.JWT_SECRET
```

Used to sign token securely.

---

## Expiration

```js
expiresIn: '1h'
```

Token becomes invalid after 1 hour.

---

# 26. Why Token Expiration Matters

Without expiration:

* Stolen tokens remain valid forever

Expiration improves security.

---

# 27. Send Token to Client

```js
res.json({ token });
```

The frontend receives:

* JWT token

Frontend usually stores it in:

* localStorage
* cookies
* memory

---

# 28. Complete Authentication Flow

```txt
User → /auth/google
      ↓
Google Login Screen
      ↓
User Grants Permission
      ↓
Google Redirects to Callback
      ↓
Passport Authenticates User
      ↓
JWT Generated
      ↓
Token Sent to Client
```

---

# 29. Security Best Practices

## NEVER:

* Expose client secret
* Hardcode secrets
* Store secrets in GitHub

---

## ALWAYS:

* Use `.env`
* Use HTTPS in production
* Set token expiration
* Validate JWTs on protected routes

---

# 30. Missing Concepts in This Basic Setup

This tutorial is incomplete for production use.

It lacks:

* Database integration
* Refresh tokens
* Logout handling
* JWT verification middleware
* Protected routes
* Error handling
* HTTPS setup
* User persistence
* Token revocation

---

# 31. Common Beginner Mistakes

## Wrong Redirect URI

Most common issue.

Must match EXACTLY.

---

## Forgetting `.env`

Causes:

```txt
undefined clientID
```

---

## Not Enabling OAuth Consent Screen

Google authentication fails.

---

## Using Sessions with JWT Incorrectly

JWT authentication typically avoids sessions.

---

# 32. Production-Level Improvements

## Add Database

Use:

* MongoDB
* PostgreSQL
* MySQL

---

## Hash Sensitive Data

Use:

* bcrypt

---

## Add Protected Routes

Example:

```js
Authorization: Bearer <token>
```

---

## Verify JWT

Use:

```js
jwt.verify()
```

---

# 33. Final Architecture Overview

```txt
Frontend
   ↓
Google OAuth Login
   ↓
Backend Callback Route
   ↓
Passport Authentication
   ↓
JWT Generation
   ↓
Frontend Stores Token
   ↓
Authenticated API Requests
```

---

# 34. Essential Interview-Level Understanding

You should clearly understand:

| Topic                 | Must Know                      |
| --------------------- | ------------------------------ |
| OAuth                 | Delegated authentication       |
| JWT                   | Stateless authentication token |
| Passport              | Authentication middleware      |
| OAuth Scope           | Requested permissions          |
| Callback URL          | Redirect endpoint              |
| Environment Variables | Secure secret storage          |
| Middleware            | Request-processing functions   |
| Stateless Auth        | No server session storage      |

---

# 35. Minimal Working Mental Model

Think of the system like this:

```txt
Google verifies WHO the user is
JWT proves the user is authenticated afterward
Passport connects both systems
```
