# Auth.js (NextAuth.js) — Quick Recall Notes for MERN Devs

> Mental model: In MERN you build auth yourself (bcrypt + JWT + middleware + cookies).
> Auth.js does the **same job** but as a pre-built, pluggable layer for Next.js. Map every concept back to what you already know.

---

## 1. What Auth.js Actually Is

- Formerly **NextAuth.js**. Now framework-agnostic (`@auth/core`), with `next-auth` as the Next.js wrapper.
- Handles: OAuth login (Google, GitHub...), Credentials login (email/password — your custom logic), session management, JWT or DB sessions, CSRF protection.
- It replaces: your `/login`, `/register`, `/refresh-token` routes + `jsonwebtoken` + `passport.js` + cookie-parser logic.

**MERN analogy:**
| MERN (manual) | Auth.js |
|---|---|
| Express route `/api/auth/login` | Built-in `/api/auth/*` routes |
| `jwt.sign()` | Session/JWT auto-created |
| `jwt.verify()` middleware | `auth()` helper / middleware |
| Passport strategies | "Providers" |
| MongoDB `users` collection | "Adapter" (Prisma/Mongo adapter) — optional |
| `httpOnly` cookie you set manually | Auto-set secure cookies |

---

## 2. Installation & Setup (v5 / Auth.js — App Router)

```bash
npm install next-auth@beta
```

Create **`auth.ts`** at project root:

```ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        // YOUR custom logic — same as MERN login controller
        const user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return user // becomes session.user
      },
    }),
  ],
})
```

Create the catch-all API route **`app/api/auth/[...nextauth]/route.ts`**:

```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

This single file replaces ALL your manual `/login`, `/logout`, `/callback`, `/session` Express routes.

---

## 3. Environment Variables

```env
AUTH_SECRET=your-random-secret      # like JWT_SECRET in MERN — used to sign tokens/cookies
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

Generate secret: `npx auth secret`

---

## 4. Providers (= Passport Strategies)

Three categories:

1. **OAuth providers** — Google, GitHub, Discord, etc. (config = clientId + clientSecret from their dev console).
2. **Credentials provider** — your own email/password logic (like your MERN `authController.login`).
3. **Email provider** — magic link login (passwordless, sends email with token).

```ts
providers: [
  Google({ clientId, clientSecret }),
  GitHub({ clientId, clientSecret }),
  Credentials({ authorize: async (creds) => { /* check DB */ } }),
]
```

⚠️ Credentials provider **cannot** use database sessions — it's forced to JWT strategy (security reasons, just like raw MERN JWT auth).

---

## 5. Sessions: JWT vs Database (the core decision)

This is the #1 thing to internalize — it maps directly to your MERN knowledge.

### JWT Strategy (default, no DB needed)
- Exactly like your MERN `jwt.sign({id, role}, SECRET)`.
- Session data is encoded **inside the cookie** (encrypted JWT).
- Stateless — no DB lookup on every request.
- Use when: Credentials provider, or you don't want a sessions table.

### Database Strategy
- Like storing a `sessionId` in Mongo and a cookie pointing to it.
- Needs an **Adapter** (Prisma, MongoDB, etc.) to persist sessions/users/accounts.
- Session ID stored in cookie → DB lookup happens server-side every request.
- Use when: you want instant logout-everywhere, session revocation, OAuth provider account linking.

```ts
export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" }, // or "database"
  providers: [...],
})
```

**MERN comparison:** JWT strategy = your typical stateless JWT auth. Database strategy = session-based auth (like `express-session` + MongoStore) — just managed for you.

---

## 6. Adapters (Optional — only for DB sessions / OAuth account storage)

An Adapter = the Mongoose/Prisma equivalent that tells Auth.js how to talk to your DB.

```bash
npm install @auth/mongodb-adapter mongodb
```

```ts
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

export const { handlers, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [...],
})
```

This auto-creates collections: `users`, `accounts`, `sessions`, `verification_tokens` — similar to how you'd design your own MongoDB schema for auth + OAuth linking.

> If using ONLY Credentials provider with JWT sessions, **you don't need an adapter at all** — you manage your own `users` collection manually (just like before), and Auth.js only handles the cookie/JWT part.

---

## 7. Getting the Session (Client vs Server)

### Server Component / Route Handler / Server Action
```ts
import { auth } from "@/auth"

export default async function Page() {
  const session = await auth()
  if (!session) return <p>Not logged in</p>
  return <p>Hello {session.user.name}</p>
}
```
This is your `req.user` equivalent from Express `authMiddleware`.

### Client Component (needs `SessionProvider`)

Wrap app in `app/layout.tsx`:
```tsx
import { SessionProvider } from "next-auth/react"
<SessionProvider>{children}</SessionProvider>
```

Use in a component:
```tsx
"use client"
import { useSession } from "next-auth/react"

const { data: session, status } = useSession()
// status: "loading" | "authenticated" | "unauthenticated"
```

### API Route (Route Handler)
```ts
import { auth } from "@/auth"
export async function GET(req) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  // protected logic
}
```
= your MERN `verifyToken` middleware, just inline.

---

## 8. Sign In / Sign Out

**Server side (Server Actions — preferred in App Router):**
```ts
import { signIn, signOut } from "@/auth"

// In a form action
<form action={async () => { "use server"; await signIn("github") }}>
  <button>Sign in with GitHub</button>
</form>

<form action={async () => { "use server"; await signOut() }}>
  <button>Sign out</button>
</form>
```

**Client side:**
```tsx
import { signIn, signOut } from "next-auth/react"
<button onClick={() => signIn("credentials", { email, password })}>Login</button>
<button onClick={() => signOut()}>Logout</button>
```

For Credentials provider, `signIn("credentials", {...})` internally calls your `authorize()` function — same as POSTing to your old `/login` controller.

---

## 9. Protecting Routes (Middleware)

`middleware.ts` at project root = your old Express `authMiddleware`, but applied at the edge before the page even renders.

```ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}
```

Custom logic version:
```ts
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  if (!isLoggedIn && req.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})
```

---

## 10. Callbacks (Customizing the Token/Session — IMPORTANT)

This is how you inject custom fields (role, userId, etc.) — equivalent to what you'd put in `jwt.sign(payload)` manually.

```ts
export const { handlers, auth } = NextAuth({
  providers: [...],
  callbacks: {
    // Runs whenever a JWT is created/updated — like building your payload
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    // Runs when session is checked — like shaping req.user
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
})
```

Without this, `session.user` only has `name`, `email`, `image` by default — you MUST add callbacks to get custom fields like `role` or `_id`, just like you'd customize your JWT payload in MERN.

---

## 11. TypeScript: Extending Session Type (common gotcha)

Create `types/next-auth.d.ts`:
```ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}
```
Without this, TS will complain `session.user.role` doesn't exist (since you added it manually in callbacks).

---

## 12. Mental Mapping Cheat Sheet

| You'd write in MERN | Auth.js equivalent |
|---|---|
| `POST /api/auth/register` (bcrypt hash + save) | You still write this yourself — Auth.js has NO register endpoint, only login |
| `POST /api/auth/login` | `Credentials` provider `authorize()` |
| `jwt.sign(payload, SECRET, {expiresIn})` | Auto handled (JWT strategy) + customize via `callbacks.jwt` |
| `jwt.verify()` middleware | `auth()` / `middleware.ts` |
| `req.user = decoded` | `session.user` |
| `res.cookie("token", jwt, {httpOnly:true})` | Done automatically |
| Passport Google strategy boilerplate | `GoogleProvider({clientId, clientSecret})` |
| Manual "logout" (clear cookie) | `signOut()` |
| Refresh token rotation logic | `session.maxAge`, `updateAge` config (optional, simpler) |

**Key realization:** Auth.js does NOT replace your registration/signup logic or your User schema — you still own that. It replaces the *login session/token plumbing* layer.

---

## 13. Common Gotchas (things that trip up MERN devs)

1. **No built-in signup/register** — you write your own API route + bcrypt hashing, then just use Credentials provider to *log in* against it.
2. **`authorize()` return value becomes `user`** in the `jwt` callback — don't return the whole Mongoose doc (it's not serializable); return a plain object.
3. **Credentials provider forces JWT sessions** — can't use DB sessions with it.
4. **`auth()` is async** — always `await` it (server-side).
5. **Middleware runs on Edge runtime** — no Node-only APIs (like `mongoose` directly) inside `middleware.ts`. Keep DB calls in `authorize()`/route handlers, not middleware.
6. **`session.user` is minimal by default** — must extend via `callbacks` + TS module augmentation to add `id`/`role`.
7. **`.env` variable naming changed in v5** — prefix is `AUTH_` not `NEXTAUTH_` (e.g. `AUTH_SECRET` not `NEXTAUTH_SECRET`), though old names still work for backward compat.

---

## 14. Quick Setup Checklist (for recall when starting a project)

1. `npm install next-auth@beta`
2. Create `auth.ts` → define `providers`, `session.strategy`, `callbacks`
3. Create `app/api/auth/[...nextauth]/route.ts` → export `GET, POST`
4. Add `.env` vars (`AUTH_SECRET`, provider IDs/secrets)
5. Wrap app in `<SessionProvider>` if using client components
6. Use `auth()` in server components/routes, `useSession()` in client components
7. Add `callbacks.jwt` + `callbacks.session` to inject custom fields (id, role)
8. Extend TS types in `types/next-auth.d.ts`
9. Protect routes via `middleware.ts`
10. Write your own `/register` API route — Auth.js won't do this part

---

## 15. One-Line Summary

> **Auth.js = Passport.js + JWT/session middleware + cookie handling, pre-wired for Next.js — you still own your User model, password hashing, and registration logic, but login sessions, OAuth, and route protection are handled for you via providers + callbacks + `auth()`.**
