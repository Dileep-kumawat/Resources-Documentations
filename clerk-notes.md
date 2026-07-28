# Clerk — Quick Recall Notes (MERN Stack)

## 1. What is Clerk?
- A **complete user management & authentication platform** (alternative to building your own auth with JWT/bcrypt, or to Firebase Auth/Auth0).
- Gives you: Sign up, Sign in, session management, user profile UI, organizations/teams, social logins (OAuth), MFA, email/SMS verification — all with **pre-built React components**.
- You don't write your own auth backend logic — Clerk handles it and gives you tokens to verify on your Express server.

---

## 2. Why use Clerk in MERN
| Without Clerk | With Clerk |
|---|---|
| Write signup/login routes, hash passwords, manage JWT yourself | Drop-in `<SignIn />`, `<SignUp />` components |
| Build "forgot password", email verification flows | Built-in |
| Manage sessions manually (cookies/localStorage) | Clerk manages sessions, auto-refresh |
| Build user profile/edit UI | `<UserButton />`, `<UserProfile />` ready-made |
| Build "Organizations"/teams from scratch | Built-in multi-tenancy support |

---

## 3. Core Setup Flow (MERN)

### A. Account & Project
1. Sign up at clerk.com → create application.
2. Get **Publishable Key** (frontend) and **Secret Key** (backend) from dashboard.

### B. Frontend (React)
```bash
npm install @clerk/clerk-react
```
```jsx
// main.jsx / index.js
import { ClerkProvider } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

<ClerkProvider publishableKey={clerkPubKey}>
  <App />
</ClerkProvider>
```

### C. Backend (Express/Node)
```bash
npm install @clerk/express
```
```js
import { clerkMiddleware, requireAuth } from '@clerk/express'

app.use(clerkMiddleware()) // attaches auth info to req

app.get('/api/protected', requireAuth(), (req, res) => {
  const { userId } = req.auth
  res.json({ message: `Hello user ${userId}` })
})
```

> Note: Clerk has rebranded backend SDKs over time (`@clerk/clerk-sdk-node` → `@clerk/express`). Always check current Clerk docs since exact package names change.

---

## 4. Key Frontend Components (drop-in UI)
| Component | Purpose |
|---|---|
| `<SignIn />` | Full sign-in page/widget |
| `<SignUp />` | Full sign-up page/widget |
| `<UserButton />` | Avatar dropdown — profile, sign out |
| `<UserProfile />` | Full account management page |
| `<SignedIn>...</SignedIn>` | Renders children only if user is logged in |
| `<SignedOut>...</SignedOut>` | Renders children only if logged out |
| `<RedirectToSignIn />` | Forces redirect to sign-in page |

```jsx
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react'

function Header() {
  return (
    <>
      <SignedIn><UserButton /></SignedIn>
      <SignedOut><SignInButton /></SignedOut>
    </>
  )
}
```

---

## 5. Key Hooks (React)
| Hook | Use |
|---|---|
| `useUser()` | Get current user object (`isSignedIn`, `user`) |
| `useAuth()` | Get auth state, `getToken()`, `userId`, `sessionId` |
| `useClerk()` | Access Clerk instance directly (e.g., `signOut()`) |
| `useSignIn()` / `useSignUp()` | Build **custom** sign-in/up flows (instead of pre-built UI) |

```jsx
import { useUser } from '@clerk/clerk-react'

function Profile() {
  const { isSignedIn, user } = useUser()
  if (!isSignedIn) return null
  return <p>Welcome {user.firstName}</p>
}
```

---

## 6. Protecting Backend Routes (the MERN-critical part)
- Frontend sends the Clerk session token automatically with API requests (if using Clerk's fetch wrapper) or you manually attach it:
```jsx
const { getToken } = useAuth()
const token = await getToken()

fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
})
```
- Backend verifies token via `clerkMiddleware()` + `requireAuth()` — populates `req.auth.userId`.
- Use `req.auth.userId` to fetch/match data in **MongoDB** (e.g., `User.findOne({ clerkId: req.auth.userId })`).

### Typical pattern: Sync Clerk user → MongoDB
Since Clerk stores user identity, but your app's extra data (orders, posts, etc.) lives in MongoDB:
1. Use **Clerk Webhooks** (`user.created`, `user.updated`, `user.deleted`) to sync user data into your MongoDB `User` collection automatically.
2. Store `clerkId` as a field in your Mongo schema to link records.

```js
// webhook handler example
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const evt = verifyWebhook(req) // using svix
  if (evt.type === 'user.created') {
    await User.create({ clerkId: evt.data.id, email: evt.data.email_addresses[0].email_address })
  }
  res.status(200).send('ok')
})
```

---

## 7. Protecting Frontend Routes
```jsx
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <Navigate to="/sign-in" />
  return children
}
```

---

## 8. Organizations (multi-tenant apps)
- Built-in support for **teams/workspaces**.
- `useOrganization()`, `<OrganizationSwitcher />`, `<OrganizationProfile />`.
- Each org has roles (admin, member) — useful for SaaS-style MERN apps.

---

## 9. Environment Variables (typical .env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx   # frontend
CLERK_SECRET_KEY=sk_test_xxx             # backend only, never expose
CLERK_WEBHOOK_SECRET=whsec_xxx           # for verifying webhooks
```

---

## 10. Common Gotchas
- **Publishable key** = safe for frontend. **Secret key** = backend only, never commit/expose.
- Always wrap app in `<ClerkProvider>` at the root — components/hooks fail silently otherwise.
- `isLoaded` from hooks must be checked before relying on `isSignedIn`/`user` (avoids flash of wrong UI).
- For Next.js, Clerk has a separate package (`@clerk/nextjs`) with middleware (`clerkMiddleware` in `middleware.ts`) — different from the Express setup above.
- MongoDB doesn't store passwords/auth at all when using Clerk — only store `clerkId` + app-specific data.
- Webhooks need raw body parsing (`express.raw`) — don't use `express.json()` globally before the webhook route, or signature verification fails.

---

## 11. Quick Mental Model
```
React (Clerk components/hooks) 
   → handles login UI + session 
   → sends Bearer token to Express
Express (clerkMiddleware + requireAuth) 
   → verifies token 
   → exposes req.auth.userId
MongoDB 
   → stores app data, linked via clerkId
   → synced via Clerk Webhooks (user.created/updated/deleted)
```

---

## 12. Where to go deeper (when actually building)
- Official docs: https://clerk.com/docs
- Express quickstart: docs → "Express" under Backend SDKs
- Webhook setup: docs → "Webhooks" (uses `svix` for signature verification)
