# Better-Auth — Quick Recall Notes (MERN Stack)

## 1. What is Better-Auth?
- A **framework-agnostic, TypeScript-first authentication library** for Node/JS apps.
- Alternative to NextAuth/Auth.js, Passport, Lucia, Clerk (self-hosted instead of SaaS).
- Handles: email/password, social/OAuth login, sessions, email verification, 2FA, magic links, organizations/multi-tenant, rate limiting — via a **plugin system**.
- Core idea: you own the DB and the auth logic, Better-Auth just gives you a ready-made, secure implementation + endpoints + client SDK.

---

## 2. Architecture Overview
Two main pieces:
1. **Server instance** (`betterAuth()`) — created once, mounted as an API route handler (`/api/auth/*`). Generates the actual auth endpoints (sign-up, sign-in, sign-out, session, callback, etc.)
2. **Client instance** (`createAuthClient()`) — used in React frontend to call those endpoints (`signIn`, `signUp`, `signOut`, `useSession`, etc.)

```
React (client) ⇄ Express/Node (better-auth server) ⇄ MongoDB (adapter)
```

---

## 3. Installation
```bash
npm install better-auth
```
For MongoDB:
```bash
npm install mongodb
```
(Better-Auth ships adapters for Prisma, Drizzle, Kysely, MongoDB, etc.)

---

## 4. Server Setup (Express + MongoDB)

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET, // session/cookie signing
  baseURL: process.env.BETTER_AUTH_URL,   // e.g. http://localhost:5000
});
```

### Mounting in Express
Better-Auth gives a handler compatible with web `Request`/`Response`. For Express you need the **node adapter / toNodeHandler**:

```ts
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();

// MUST be mounted BEFORE express.json(), and Better-Auth handles its own body parsing
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json()); // your normal routes after this
```

⚠️ **Common gotcha:** mounting order matters — `express.json()` before the auth handler breaks request parsing.

---

## 5. Client Setup (React)

```bash
npm install better-auth
```

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000", // your backend URL
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Usage in components
```tsx
// Sign up
await signUp.email({
  email,
  password,
  name,
});

// Sign in
await signIn.email({ email, password });

// Social login
await signIn.social({ provider: "google" });

// Sign out
await signOut();

// Get session (reactive hook)
const { data: session, isPending } = useSession();
```

`useSession` auto-syncs with cookies — no manual token management needed for basic flow.

---

## 6. Session Handling
- Default: **cookie-based sessions** (secure, httpOnly cookies) — not JWT-in-localStorage. This avoids XSS token theft issues common in DIY MERN auth.
- Session data stored in DB (Mongo collection: `session`), cookie just holds a signed session token.
- Can configure expiry, cookie cache, refresh strategy:
```ts
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24,     // refresh every 1 day
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // cache session in cookie for 5 min (less DB hits)
  },
}
```

### Getting session on server (protected routes)
```ts
import { auth } from "./lib/auth";
import { fromNodeHeaders } from "better-auth/node";

app.get("/api/protected", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: session.user });
});
```

---

## 7. CORS (since React + Express are usually different ports)
```ts
import cors from "cors";

app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true, // REQUIRED so cookies are sent
}));
```
Also ensure client requests use `credentials: "include"` (Better-Auth client does this automatically).

---

## 8. Database / Schema
- Better-Auth auto-generates required collections/tables: `user`, `session`, `account` (for OAuth), `verification`.
- Use the CLI to generate/sync schema:
```bash
npx better-auth generate   # generates schema files (for ORMs like Prisma/Drizzle)
npx better-auth migrate    # for SQL-based adapters
```
- For MongoDB, the adapter auto-creates collections on first use — no manual migration needed.

---

## 9. Plugins (the real power of Better-Auth)
Add via `plugins: []` array in `betterAuth()` config, and matching client plugin on frontend.

| Plugin | Purpose |
|---|---|
| `twoFactor()` | TOTP/2FA support |
| `magicLink()` | Passwordless email login |
| `emailOTP()` | OTP-based verification |
| `organization()` | Multi-tenant / teams / roles |
| `admin()` | Admin panel role-based controls |
| `username()` | Username-based login (instead of/with email) |
| `passkey()` | WebAuthn/passkeys |
| `rateLimit` (built-in) | Brute-force protection |

Example:
```ts
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  // ...
  plugins: [twoFactor()],
});
```
Client side:
```ts
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [twoFactorClient()],
});
```

---

## 10. Email Verification
```ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
},
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    // use nodemailer/resend/etc.
    await sendEmail(user.email, "Verify your email", url);
  },
},
```
Better-Auth calls your function — **you bring your own email provider** (Resend, Nodemailer, SES, etc.) — it doesn't send emails itself.

---

## 11. Social/OAuth Login Setup Checklist
1. Register app on provider (Google/GitHub/etc.) → get `clientId` + `clientSecret`.
2. Set redirect URI: `{baseURL}/api/auth/callback/{provider}` (e.g. `http://localhost:5000/api/auth/callback/google`).
3. Add to `socialProviders` in server config.
4. Call `signIn.social({ provider: "google" })` on client — redirects automatically.

---

## 12. Common MERN Integration Gotchas (cheat sheet for debugging)
- ❌ Forgot `credentials: true` in CORS → cookies never sent → session always null.
- ❌ Mounted `express.json()` before auth handler → broken request bodies.
- ❌ Wrong `baseURL` mismatch between client and server → cookie domain issues.
- ❌ Using `localhost` vs `127.0.0.1` inconsistently → cookies won't match.
- ❌ Forgetting `trustedOrigins` config when frontend domain differs:
```ts
betterAuth({
  trustedOrigins: ["http://localhost:5173"],
})
```
- In production, cookies need `secure: true` (HTTPS) — set automatically when `NODE_ENV=production`, but reverse proxies (Render/Vercel/Nginx) sometimes need `trustProxy`.

---

## 13. Protecting React Routes
```tsx
function ProtectedRoute({ children }) {
  const { data: session, isPending } = useSession();
  if (isPending) return <Loader />;
  if (!session) return <Navigate to="/login" />;
  return children;
}
```

---

## 14. Mental Model Summary (for quick recall)
- **Better-Auth = batteries-included auth engine you self-host.**
- One `betterAuth()` server config + one Express catch-all route = full auth API.
- One `createAuthClient()` + hooks = full frontend auth UI logic.
- Sessions = secure cookies, stored server-side in your own MongoDB.
- Extend everything through **plugins** (2FA, magic link, orgs, passkeys, admin).
- You control the DB (Mongo) — Better-Auth just defines/manages the schema for you.

---

## 15. Useful Links
- Docs: https://www.better-auth.com/docs
- GitHub: https://github.com/better-auth/better-auth
