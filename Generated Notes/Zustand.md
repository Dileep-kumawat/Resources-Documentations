# Zustand (React State Management)

## What is Zustand?

[Zustand Official Docs](https://zustand.docs.pmnd.rs/?utm_source=chatgpt.com)

Zustand = **small, fast, scalable state management** for React.

Core idea:

* Create a **global store**
* Components subscribe only to needed state
* Minimal boilerplate
* No providers required
* Uses hooks internally

Mental model:

```txt
Component ↔ Store ↔ State + Actions
```

---

# Why Zustand Exists

React problems:

* Prop drilling
* Too many context providers
* Redux boilerplate fatigue
* State syncing pain

Zustand fixes this by giving:

✅ Simple API
✅ Global state
✅ Selective re-rendering
✅ Easy async handling
✅ No reducers required

---

# Installation

```bash
npm install zustand
```

---

# Basic Store

## Store Creation

```js
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,

  increase: () =>
    set((state) => ({
      count: state.count + 1,
    })),

  decrease: () =>
    set((state) => ({
      count: state.count - 1,
    })),
}))
```

---

# Using Store in Components

```js
const count = useStore((state) => state.count)
const increase = useStore((state) => state.increase)
```

---

# Core Concepts

---

# 1. `create()`

Creates store.

```js
const useStore = create((set, get) => ({
  ...
}))
```

---

# 2. `set`

Updates state.

```js
set({ count: 10 })
```

Functional update:

```js
set((state) => ({
  count: state.count + 1,
}))
```

Think:

```txt
set = state updater
```

---

# 3. `get`

Access current state inside store.

```js
const current = get().count
```

Useful for:

* conditional logic
* derived calculations
* chaining actions

---

# State + Actions Pattern

Best practice:

```js
const useStore = create((set) => ({
  data: [],
  loading: false,

  setLoading: (value) => set({ loading: value }),

  addItem: (item) =>
    set((state) => ({
      data: [...state.data, item],
    })),
}))
```

---

# Selectors (VERY IMPORTANT)

## Bad

```js
const store = useStore()
```

Causes unnecessary re-renders.

---

## Good

```js
const count = useStore((state) => state.count)
```

Only re-renders when `count` changes.

This is one of Zustand’s biggest performance advantages.

---

# Multiple State Selection

```js
const { count, increase } = useStore((state) => ({
  count: state.count,
  increase: state.increase,
}))
```

---

# Async Actions

Zustand does NOT care if action is async.

```js
const useStore = create((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true })

    const res = await fetch('/api/users')
    const data = await res.json()

    set({
      users: data,
      loading: false,
    })
  },
}))
```

Huge advantage:
No thunk/saga nonsense.

---

# Updating Nested State

## Manual way

```js
set((state) => ({
  user: {
    ...state.user,
    name: 'John',
  },
}))
```

---

# Using Immer

Install:

```bash
npm install immer
```

Example:

```js
import { produce } from 'immer'

set(
  produce((state) => {
    state.user.name = 'John'
  })
)
```

---

# Middleware

Zustand supports middleware.

Most important:

| Middleware            | Purpose                     |
| --------------------- | --------------------------- |
| persist               | localStorage/sessionStorage |
| devtools              | Redux DevTools              |
| immer                 | immutable updates           |
| subscribeWithSelector | advanced subscriptions      |

---

# Persist Middleware

Saves state to storage.

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      theme: 'dark',

      setTheme: (theme) =>
        set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

---

# Devtools Middleware

```js
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools((set) => ({
    count: 0,
  }))
)
```

Use Redux DevTools extension.

---

# Combining Middleware

```js
create(
  persist(
    devtools((set) => ({
      ...
    })),
    { name: 'app' }
  )
)
```

---

# Derived State

Avoid storing computable values.

## Bad

```js
totalPrice
```

if already derivable from cart.

---

## Good

```js
const total = useStore(
  (state) =>
    state.cart.reduce(
      (a, item) => a + item.price,
      0
    )
)
```

Rule:

```txt
Store source of truth, not calculations.
```

---

# Splitting Stores

Do NOT create one giant store.

## Better

```txt
authStore
cartStore
themeStore
chatStore
```

This improves:

* maintainability
* performance
* debugging

---

# Access State Outside React

Very useful.

```js
const count = useStore.getState().count
```

Update outside component:

```js
useStore.setState({ count: 5 })
```

Subscribe:

```js
const unsub = useStore.subscribe(
  (state) => console.log(state)
)
```

---

# Subscribe with Selector

```js
useStore.subscribe(
  (state) => state.count,
  (count) => console.log(count)
)
```

Efficient subscriptions.

---

# Zustand vs Redux

| Zustand                  | Redux             |
| ------------------------ | ----------------- |
| Minimal boilerplate      | Heavy boilerplate |
| No provider needed       | Requires provider |
| Simple async             | Thunks/sagas      |
| Easier learning curve    | Steeper           |
| Small bundle             | Larger            |
| Less strict architecture | Very structured   |

---

# Zustand vs Context API

| Zustand                | Context          |
| ---------------------- | ---------------- |
| Fine-grained updates   | Broad re-renders |
| Global state optimized | Not optimized    |
| Easier scaling         | Provider hell    |
| Better performance     | Can become slow  |

---

# Best Practices

## 1. Use selectors always

```js
useStore((s) => s.count)
```

NOT:

```js
useStore()
```

---

## 2. Keep actions inside store

Cleaner architecture.

---

## 3. Split stores logically

Avoid monster stores.

---

## 4. Persist only needed data

Don’t persist temporary UI state.

---

## 5. Avoid duplicated state

Derived values should be computed.

---

# Common Mistakes

---

## Mistake 1 — Overusing global state

Not everything belongs in Zustand.

Keep local UI state in React when possible.

Example:

```txt
modal open state
input typing state
hover state
```

Usually local.

---

## Mistake 2 — Selecting whole store

```js
const store = useStore()
```

Kills performance.

---

## Mistake 3 — Giant centralized store

Hard to maintain.

---

## Mistake 4 — Storing derived values

Creates sync bugs.

---

# Real-World Folder Structure

```txt
src/
 ├── stores/
 │    ├── authStore.js
 │    ├── cartStore.js
 │    ├── themeStore.js
 │
 ├── components/
 ├── pages/
```

---

# Example — Auth Store

```js
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  login: async (data) => {
    const res = await api.login(data)

    set({
      user: res.user,
      token: res.token,
    })
  },

  logout: () =>
    set({
      user: null,
      token: null,
    }),
}))
```

---

# Example — Cart Store

```js
const useCartStore = create((set) => ({
  cart: [],

  addToCart: (product) =>
    set((state) => ({
      cart: [...state.cart, product],
    })),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter(
        (item) => item.id !== id
      ),
    })),
}))
```

---

# TypeScript Pattern

```ts
type Store = {
  count: number
  increase: () => void
}

const useStore = create<Store>((set) => ({
  count: 0,

  increase: () =>
    set((state) => ({
      count: state.count + 1,
    })),
}))
```

---

# When Zustand Is Great

Use Zustand for:

✅ Auth state
✅ Cart state
✅ Theme state
✅ User settings
✅ Dashboard state
✅ Shared app state
✅ WebSocket/live state

---

# When Zustand Is NOT Ideal

Avoid for:

❌ Server cache management
❌ Complex backend syncing
❌ Heavy normalized relational data

For server cache:

Use:

* React Query
* SWR

Zustand is NOT a replacement for server-state libraries.

---

# The Core Mental Model

```txt
Zustand = Global Hook Store
```

You create:

```txt
state + actions
```

Then components subscribe to only what they need.

That’s the whole philosophy.

---

# Fast Recall Summary

```txt
create() → create store
set() → update state
get() → access current state
selectors → avoid unnecessary renders
persist → save state
devtools → debugging
async → works naturally
middleware → extensibility
```

---

# One-Liner Understanding

```txt
Redux power with React Context simplicity.
```

---

# Interview-Level Questions

## Why Zustand is faster than Context?

Because components subscribe selectively instead of rerendering entire provider trees.

---

## Why selectors matter?

They minimize re-renders.

---

## Does Zustand replace React Query?

No.

Zustand = client/global state
React Query = server/cache state

---

## Does Zustand need Provider?

No.

---

## Biggest advantage?

Extremely low complexity with excellent performance.

---

# Final Memory Compression

```txt
Zustand Flow:

create store
→ define state
→ define actions
→ use selectors
→ update with set()
→ async works directly
→ middleware for persist/devtools
```

If you master:

* selectors
* async actions
* persist
* middleware
* store architecture

…you already know 90% of real-world Zustand usage.