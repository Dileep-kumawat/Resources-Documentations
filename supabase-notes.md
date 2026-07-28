# Supabase — Quick Recall Notes (for MERN Devs)

> Mental model: **Supabase = Postgres + Auth + Realtime + Storage + Edge Functions, all auto-wrapped in an instant REST/GraphQL API.**
> If MongoDB+Mongoose+Express+Auth0+Socket.io+S3 was a single managed product — that's Supabase, but on Postgres (SQL, not NoSQL).

---

## 1. Core Mental Mapping (MERN → Supabase)

| MERN Concept | Supabase Equivalent |
|---|---|
| MongoDB (NoSQL, schemaless) | **Postgres** (SQL, relational, schema required) |
| Mongoose Schema/Model | SQL **Tables** + constraints (defined via SQL or Table Editor UI) |
| Express REST routes (`app.get('/users')`) | **Auto-generated REST API** (PostgREST) — no route writing needed |
| Custom Express auth + JWT | **Supabase Auth** (built-in, JWT-based, providers ready) |
| Socket.io | **Realtime** (Postgres change subscriptions over websockets) |
| Multer + AWS S3 | **Supabase Storage** (S3-like buckets, built-in) |
| Express middleware for access control | **Row Level Security (RLS)** policies (SQL-based, DB-level) |
| Lambda / serverless functions | **Edge Functions** (Deno-based) |
| `mongoose.connect()` | `createClient(url, anonKey)` |

**Key mindset shift:** In MERN you write the backend. In Supabase, the backend is *generated* from your database schema — your main job becomes designing tables + writing RLS policies instead of writing CRUD routes.

---

## 2. Setup & Client

```bash
npm install @supabase/supabase-js
```

```js
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- **Project URL** + **anon/public key** → safe for frontend (like Firebase config).
- **service_role key** → backend ONLY, bypasses RLS, never expose to client. Equivalent to a "god mode" DB credential.

---

## 3. Database = Postgres

- Tables created via **SQL Editor** or **Table Editor** (GUI, like Mongo Compass but relational).
- Strong typing, foreign keys, joins — actual relational thinking required (unlike Mongo's embed/reference flexibility).

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  content text,
  created_at timestamp with time zone default now()
);
```

**Querying from JS (instead of Mongoose methods):**

```js
// SELECT (like Post.find())
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// INSERT (like Post.create())
const { data, error } = await supabase
  .from('posts')
  .insert([{ title: 'Hello', content: 'World', user_id: userId }])

// UPDATE (like Post.findByIdAndUpdate())
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'New Title' })
  .eq('id', postId)

// DELETE
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)

// JOIN (foreign table data) — like .populate()
const { data, error } = await supabase
  .from('posts')
  .select('*, users(name, avatar_url)')
```

> Every call returns `{ data, error }` — always check `error` (no try/catch needed unless network fails).

---

## 4. Auth (replaces your entire custom JWT/Auth0 setup)

```js
// Sign up
const { data, error } = await supabase.auth.signUp({
  email, password
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// OAuth (Google, GitHub, etc.) — just toggle provider in dashboard
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Get current session/user
const { data: { session } } = await supabase.auth.getSession()
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()

// Listen to auth state changes (like a global auth context)
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

- Auth users live in `auth.users` table automatically.
- Session stored client-side, auto-refreshes tokens — no manual refresh-token logic needed (unlike custom Express+JWT).
- `user.id` (UUID) is what you use as `user_id` foreign key everywhere.

---

## 5. Row Level Security (RLS) — THE big new concept

This replaces your Express `authMiddleware` / `req.user` checks. **Security lives in the database**, not in route handlers.

- **RLS is OFF by default disables all access**; once enabled on a table, you must write explicit policies or nobody (except service_role) can read/write.

```sql
-- Enable RLS
alter table posts enable row level security;

-- Allow users to read all posts
create policy "Public posts are viewable by everyone"
on posts for select
using (true);

-- Allow users to insert only their own posts
create policy "Users can insert their own posts"
on posts for insert
with check (auth.uid() = user_id);

-- Allow users to update/delete only their own posts
create policy "Users can update own posts"
on posts for update
using (auth.uid() = user_id);
```

> `auth.uid()` = currently logged-in user's ID, available inside SQL policies automatically (Supabase injects it from the JWT).

**Mental shortcut:** `using()` = condition for SELECT/UPDATE/DELETE row visibility. `with check()` = condition for what data can be INSERTED/UPDATED.

---

## 6. Realtime (replaces Socket.io for DB-driven updates)

```js
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// cleanup
supabase.removeChannel(channel)
```

- Listens to INSERT/UPDATE/DELETE on tables in real time — great for live dashboards, chat apps, collab tools.
- Must enable Realtime on the table (toggle in dashboard or via SQL: `alter publication supabase_realtime add table posts;`)

---

## 7. Storage (replaces Multer + S3/Cloudinary)

```js
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${file.name}`, file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`public/${file.name}`)

// Download
const { data, error } = await supabase.storage
  .from('avatars')
  .download('public/avatar1.png')
```

- Buckets = like S3 buckets. Can be public or private.
- Storage access ALSO governed by RLS-like policies (Storage policies, separate tab).

---

## 8. Edge Functions (replaces small Express endpoints / Lambda)

```bash
supabase functions new hello-world
```

```ts
// supabase/functions/hello-world/index.ts
Deno.serve(async (req) => {
  const { name } = await req.json()
  return new Response(JSON.stringify({ message: `Hello ${name}!` }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

```bash
supabase functions deploy hello-world
```

- Written in **TypeScript/Deno**, not Node.
- Use for: webhooks, payment processing, sending emails, anything needing secret keys (stripe, resend, etc.) that shouldn't be on client.
- Call from frontend:
```js
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Sahil' }
})
```

---

## 9. Local Dev & CLI (replaces `nodemon` + local Mongo)

```bash
npm install -g supabase
supabase init
supabase start      # spins up local Postgres + Studio + Auth via Docker
supabase db diff     # generate migration from schema changes
supabase db push     # push migrations to remote project
supabase link --project-ref <ref>
```

- Local Studio UI at `localhost:54323` mirrors the cloud dashboard.
- Migrations are SQL files in `supabase/migrations/` — like a schema version control (similar spirit to Mongoose migrations, but native & SQL-based).

---

## 10. Typical Full-Stack Flow (replacing your old MERN flow)

| Step | Old MERN | Supabase |
|---|---|---|
| Define data model | Mongoose schema | SQL `create table` |
| Write CRUD API | Express routes + controllers | Skip — auto REST API via `supabase-js` |
| Auth | Passport/JWT custom code | `supabase.auth.*` |
| Protect routes | `authMiddleware` | RLS policy `using(auth.uid() = user_id)` |
| File upload | Multer → S3 | `supabase.storage.from().upload()` |
| Real-time updates | Socket.io rooms/events | `.channel().on('postgres_changes')` |
| Deploy backend | Render/Railway + server.js | Nothing to deploy — Supabase is the backend |
| Custom serverless logic | Express route or Lambda | Edge Function |

**You basically only build the frontend (React) + database schema + RLS policies.** No Express server needed unless you want one for extra business logic (you still can use Express alongside Supabase via service_role key for admin tasks).

---

## 11. Gotchas / Things That Trip Up MERN Devs

- **No schemaless flexibility** — must define columns upfront (use `jsonb` column type if you want Mongo-like flexible fields).
- **RLS forgetting = either total lockout or total exposure.** Always test policies; enabling RLS without policies = nobody can access (except service_role).
- **IDs are UUIDs by default**, not Mongo ObjectIds — still strings, but format differs (`gen_random_uuid()`).
- **No `.populate()` magic** — joins must be defined via foreign keys + `select('*, related_table(*)')` syntax.
- **`anon` key is public** — security must come from RLS, NOT from hiding the key (different mindset from hiding `.env` secrets entirely).
- **Realtime requires explicit enabling** per table; not automatic like Mongo change streams once configured.
- **Transactions** aren't directly exposed via `supabase-js` — use Postgres functions/RPC (`supabase.rpc('function_name')`) for multi-step atomic operations.

---

## 12. Quick Cheat-Sheet Commands

```js
supabase.from('table').select()
supabase.from('table').insert([{...}])
supabase.from('table').update({...}).eq('id', x)
supabase.from('table').delete().eq('id', x)
supabase.from('table').select().single()        // get one row, not array
supabase.from('table').select().range(0, 9)      // pagination
supabase.rpc('function_name', { param: value })  // call Postgres function
supabase.auth.getUser()
supabase.auth.signOut()
supabase.storage.from('bucket').upload(path, file)
supabase.channel('name').on('postgres_changes', {...}, cb).subscribe()
```

---

## 13. One-Line Summary to Remember Everything

> **Supabase gives you Postgres with an auto-generated API, built-in auth, realtime subscriptions, file storage, and serverless functions — so your React frontend talks almost directly to the database, with security enforced via RLS instead of Express middleware.**
