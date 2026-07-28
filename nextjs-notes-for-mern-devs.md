# Next.js — Revision Notes (for MERN Developers)

> Goal: skim this in 20–30 min and recall everything. Mental model throughout: "How is this different from my Express + React setup?"

---

## 1. What Next.js Actually Is

Next.js = React framework that adds: file-based routing, server-side rendering (SSR), static site generation (SSG), API routes (mini backend), built-in bundling/optimization (replaces Webpack config + CRA/Vite setup).

**MERN mental mapping:**
| MERN piece | Next.js equivalent |
|---|---|
| React (CRA/Vite) frontend | Next.js frontend (same React, different rendering model) |
| Express routes (`/api/users`) | `app/api/users/route.js` (Route Handlers) |
| `react-router-dom` | File-based routing (folders = routes) |
| `useEffect` + `fetch` for data | Server Components fetch data directly, no useEffect needed |
| Separate frontend/backend servers | One Next.js app can do both (full-stack in one repo) |
| `.env` + dotenv | `.env.local`, auto-loaded, `NEXT_PUBLIC_` prefix for client-exposed vars |

Next.js does NOT replace MongoDB/Express logic — you still write DB queries, auth, business logic. It replaces **React Router + Express's view/API layer + Webpack config**.

---

## 2. Project Setup

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev   # starts at localhost:3000
```

Choose: TypeScript (recommended), ESLint, Tailwind, `src/` directory, **App Router** (use this, not old Pages Router), import alias `@/*`.

**Two routing systems exist** (know this so you're not confused by old tutorials):
- `app/` directory → **App Router** (modern, React Server Components, Next.js 13+) — **learn this**
- `pages/` directory → **Pages Router** (legacy, still in older codebases/jobs)

---

## 3. File-Based Routing (App Router)

Folder structure = URL structure. Special filenames have meaning inside each folder:

```
app/
 ├─ layout.js        → wraps all pages (like a persistent <App> shell)
 ├─ page.js          → renders at "/"
 ├─ globals.css
 ├─ about/
 │   └─ page.js      → renders at "/about"
 ├─ blog/
 │   ├─ page.js              → "/blog"
 │   └─ [slug]/
 │       └─ page.js          → "/blog/:slug" (dynamic route, like Express's :id)
 ├─ dashboard/
 │   ├─ layout.js    → nested layout only for /dashboard/*
 │   ├─ loading.js   → shown while page.js is loading (auto Suspense)
 │   ├─ error.js     → catches errors in this route segment
 │   └─ page.js
 └─ api/
     └─ users/
         └─ route.js → API endpoint at "/api/users" (your "Express route")
```

**Key special files (per folder):**
- `page.js` — UI for that route (REQUIRED to make it a page)
- `layout.js` — shared UI wrapper, persists across navigation, doesn't re-render
- `loading.js` — auto-wraps page in `<Suspense>`, shown during data fetch
- `error.js` — error boundary for that segment (must be a Client Component)
- `not-found.js` — custom 404
- `route.js` — turns folder into an API endpoint (can't coexist with `page.js` in same folder)

**Dynamic routes:**
- `[id]/page.js` → `/posts/123` → `params.id = "123"` (like Express `:id`)
- `[...slug]/page.js` → catch-all → `/a/b/c` → `params.slug = ["a","b","c"]`
- `[[...slug]]/page.js` → optional catch-all (matches `/` too)

**Route Groups** (organize without affecting URL): `(marketing)/about/page.js` → still `/about`, parentheses are ignored in URL.

---

## 4. Server Components vs Client Components — THE BIG MENTAL SHIFT

This is the #1 new concept for a MERN dev. **By default, every component in `app/` is a Server Component.**

### Server Components (default)
- Render on the server, send only HTML to browser (no JS bundle for that component)
- Can `await` data directly inside the component — **no useEffect, no useState for fetching**
- Can directly query DB, read files, use secrets (`process.env.DB_PASSWORD` safe here)
- CANNOT use: `useState`, `useEffect`, `onClick`, browser APIs, React hooks, event listeners

```jsx
// app/blog/page.js — Server Component (default, no "use client")
async function BlogPage() {
  const res = await fetch('https://api.example.com/posts'); // runs on server
  const posts = await res.json();
  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
export default BlogPage;
```
This replaces your old `useEffect(() => { fetch... }, [])` + `useState` pattern entirely for initial data.

### Client Components (opt-in)
- Add `'use client'` at the very top of the file
- Needed for: `useState`, `useEffect`, `onClick`, `useContext`, browser-only APIs, hooks, interactivity, custom event handlers, third-party libs that use hooks
- This is basically your normal React component (what you already know from MERN)

```jsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Rule of thumb:** Default to Server Component. Only mark `'use client'` when you need interactivity/state/effects/browser APIs. Push `'use client'` as far down the tree as possible (don't make the whole page client just because one button needs `onClick` — extract that button into its own client component).

**Can't do:** import a Server Component INTO a Client Component file and expect it to stay server-rendered (it won't — once inside a client tree boundary issues apply). But you CAN pass Server Components as `children`/props into Client Components — common pattern for things like modals/wrappers.

---

## 5. Data Fetching (replaces your useEffect+axios pattern)

In Server Components, just `await` fetch directly — no loading state boilerplate needed (use `loading.js` for that).

```jsx
async function getUser(id) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: 'force-cache',       // default: cached like SSG (build-time-ish)
    // cache: 'no-store',       // like SSR — fetch fresh every request
    // next: { revalidate: 60 } // ISR — revalidate every 60s
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function UserPage({ params }) {
  const user = await getUser(params.id);
  return <h1>{user.name}</h1>;
}
```

**Caching cheat sheet (this trips everyone up coming from Express where every request is always fresh):**
| Option | Behavior | Like... |
|---|---|---|
| `cache: 'force-cache'` (default) | Cached indefinitely, reused across requests | SSG |
| `cache: 'no-store'` | Always fetch fresh, no caching | Traditional SSR / your Express behavior |
| `next: { revalidate: N }` | Cached but regenerated every N seconds | ISR (Incremental Static Regeneration) |

For DB calls (Mongoose etc.) instead of `fetch`, just call your DB function directly inside the async Server Component — no caching wrapper applies automatically there (that's only for the built-in `fetch`).

**Parallel data fetching** (avoid waterfall, like `Promise.all` in Express):
```jsx
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

---

## 6. API Routes / Route Handlers (your new "Express routes")

`app/api/users/route.js` — export functions named after HTTP methods.

```js
// app/api/users/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const users = await db.user.findMany(); // your DB logic, same as Express
  return NextResponse.json(users);
}

export async function POST(request) {
  const body = await request.json();
  const newUser = await db.user.create({ data: body });
  return NextResponse.json(newUser, { status: 201 });
}
```

Dynamic API route: `app/api/users/[id]/route.js`
```js
export async function GET(request, { params }) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  return NextResponse.json(user);
}
```

**Reading query params / headers:**
```js
import { NextRequest } from 'next/server';
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page'); // ?page=2
}
```

This is genuinely your Express `req`/`res` knowledge, just renamed. Middleware-equivalent: `middleware.js` at root (runs before request hits route, for auth checks, redirects, headers).

---

## 7. Navigation (replaces react-router-dom)

```jsx
import Link from 'next/link';
<Link href="/about">About</Link>   // like <Link to="/about"> in react-router, but auto-prefetches!

// Client Component programmatic navigation:
'use client';
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
router.back();

// Reading route info (Client Component):
import { usePathname, useSearchParams } from 'next/navigation';
```

**`params` vs `searchParams` in `page.js` (Server Component, passed automatically):**
```jsx
export default function Page({ params, searchParams }) {
  // params = { id: '123' } from [id] folder
  // searchParams = { sort: 'asc' } from ?sort=asc
}
```

---

## 8. Layouts, Metadata, Loading & Error UI

```jsx
// app/layout.js — REQUIRED root layout, wraps everything
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**SEO metadata** (replaces react-helmet):
```jsx
export const metadata = {
  title: 'My Page',
  description: 'Page description',
};

// or dynamic:
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return { title: post.title };
}
```

**Loading state automatically wraps `page.js` in Suspense:**
```jsx
// app/dashboard/loading.js
export default function Loading() {
  return <p>Loading...</p>;
}
```

**Error boundary (must be Client Component):**
```jsx
'use client';
export default function Error({ error, reset }) {
  return <button onClick={() => reset()}>Try again</button>;
}
```

---

## 9. Server Actions (replaces form POST → API call → state update dance)

A huge productivity win over MERN's typical flow. Mutate data directly from a form without manually writing a fetch + API route.

```jsx
// app/actions.js
'use server';

export async function createPost(formData) {
  const title = formData.get('title');
  await db.post.create({ data: { title } });
  revalidatePath('/posts'); // refresh cached data, like re-fetching
}
```

```jsx
// In a Server Component (form can be in a server component!)
import { createPost } from './actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

No `useState` for form, no manual `fetch('/api/posts', { method: 'POST' })`, no `onSubmit` handler needed for the basic case. Works with progressive enhancement (works even before JS loads).

For client-side feedback (pending states), pair with `useFormStatus` / `useActionState` hooks.

---

## 10. Images, Fonts, Environment Variables

```jsx
import Image from 'next/image';
<Image src="/logo.png" width={200} height={100} alt="logo" />
// auto: lazy loading, responsive sizing, optimized formats (replaces manual <img> optimization)

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] }); // self-hosts fonts, no FOUT/layout shift
```

**Env vars:**
- `.env.local` — for secrets (DB URL, API keys), server-only by default
- `NEXT_PUBLIC_*` prefix — exposed to the browser (use only for non-sensitive stuff, like your React `REACT_APP_*` before)

```
DATABASE_URL=mongodb://...        # server only, like your old .env
NEXT_PUBLIC_API_URL=https://...   # bundled into client JS, visible to anyone
```

---

## 11. Connecting MongoDB/Mongoose (your familiar stack)

```js
// lib/db.js
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.DATABASE_URL);
  isConnected = true;
}
```

```js
// app/api/users/route.js
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const users = await User.find();
  return Response.json(users);
}
```

Models, schemas, business logic — all unchanged from your Express/Mongoose knowledge. Caching the connection (the `isConnected` check) matters more here because Next.js can spin up many serverless function instances.

---

## 12. Rendering Strategies Summary (the "why" behind it all)

| Strategy | When data fetched | Use case |
|---|---|---|
| **SSG** (Static) | Build time | Blog, marketing pages, docs — content rarely changes |
| **SSR** (Server-side, `no-store`) | Every request | Dashboards, user-specific data, always-fresh data |
| **ISR** (`revalidate: N`) | Build time + background refresh | Product pages, content that changes occasionally |
| **CSR** (Client Component + useEffect) | In browser, after load | Highly interactive widgets, things needing browser-only APIs |

Your MERN app was always 100% CSR (or pure SSR via Express templates) — Next.js lets you mix all four per-route, which is the core value proposition.

---

## 13. Deployment Quick Notes

- `npm run build && npm start` for production locally
- Vercel (Next.js's creator) = zero-config deploy, auto handles serverless functions for API routes
- Can also deploy as Docker/Node server (`output: 'standalone'` in `next.config.js`) if not using Vercel
- API routes become serverless functions in production by default — keep cold-start in mind (don't do heavy work in module scope outside handlers)

---

## 14. Quick Glossary (Next.js term → MERN equivalent)

| Next.js term | MERN equivalent |
|---|---|
| `app/page.js` | A React Router route component |
| `app/api/.../route.js` | An Express route handler file |
| Server Component | Like rendering on Express + sending HTML, but it's React |
| Client Component (`'use client'`) | Your normal React component |
| Server Action | Express POST endpoint + frontend fetch, fused into one function |
| `layout.js` | App.js shell / shared layout wrapper |
| `middleware.js` | Express middleware (auth guard, logging) |
| `next/image` | `<img>` + manual lazy-load/optimization libs |
| `revalidatePath()` | Manually re-fetching/invalidating cache after a mutation |
| `.env.local` | `.env` + dotenv |

---

## 15. Things That Commonly Confuse MERN Devs (gotchas)

1. **"Why isn't my onClick working?"** → Forgot `'use client'` at top of file.
2. **"Why is my fetch showing stale data after I update the DB?"** → Default caching (`force-cache`); use `no-store`, `revalidate`, or `revalidatePath()`.
3. **"Can I use `useContext`/Redux in a Server Component?"** → No, Context/state only works in Client Components.
4. **"My env var is undefined in the browser"** → Missing `NEXT_PUBLIC_` prefix.
5. **"Hydration error" in console** → Server-rendered HTML doesn't match client render (often from `Date.now()`, `Math.random()`, or browser-only APIs running during SSR).
6. **Two routers exist** — make sure tutorials/docs you read say "App Router," not legacy "Pages Router" (`getServerSideProps`/`getStaticProps` are Pages Router patterns, NOT used in App Router).

---

### One-line takeaway
Next.js = React + (file routing + server rendering + built-in API layer), letting you blend your Express backend logic directly into your React components instead of running two separate servers.
