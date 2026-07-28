# TanStack Query (React Query) — Quick Recall Notes
*For MERN Stack Devs — read in 10-15 min*

---

## 1. Why TanStack Query? (The Problem It Solves)

In plain MERN (React + axios + useEffect), you manually handle:
- Loading / error / data states
- Caching (none by default → refetch every mount)
- Re-fetching on focus/reconnect
- Avoiding race conditions, duplicate requests
- Pagination, infinite scroll, polling

**TanStack Query = server-state manager.** It treats data from your Express/MongoDB API as **server state** (different from client state like form inputs — it's async, owned by server, can go stale).

> Rule of thumb: Redux/Context = client state. TanStack Query = server state (replaces 80% of "fetch + useEffect + useState" boilerplate).

---

## 2. Setup

```bash
npm i @tanstack/react-query
npm i -D @tanstack/react-query-devtools
```

```jsx
// main.jsx / App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## 3. Core Concept #1 — `useQuery` (GET requests)

```jsx
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

function Todos() {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['todos'],                 // unique cache key
    queryFn: () =>
      axios.get('/api/todos').then(res => res.data),
    staleTime: 5000,                     // optional override
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>{error.message}</p>

  return data.map(todo => <div key={todo._id}>{todo.title}</div>)
}
```

### Key states to remember
| State | Meaning |
|---|---|
| `isLoading` | First fetch, no cached data yet |
| `isFetching` | ANY fetch happening (incl. background refetch) |
| `isError` / `error` | Failed |
| `isSuccess` | Data ready |
| `data` | The actual response |

> `isLoading` vs `isFetching`: isLoading = "no data at all yet". isFetching = "fetching right now" (even if showing stale cached data in background).

---

## 4. `queryKey` — The Most Important Concept

- It's the **cache identity**. Same key = same cache entry.
- Array format: `['todos']`, or with params: `['todos', userId]`, `['todo', id]`
- **Changing queryKey automatically refetches** — this is how you do dynamic/dependent queries.

```jsx
useQuery({
  queryKey: ['todo', todoId],   // changes when todoId changes → auto refetch
  queryFn: () => axios.get(`/api/todos/${todoId}`).then(r => r.data),
  enabled: !!todoId,            // don't run if todoId is undefined
})
```

> Mental model: queryKey is like a dependency array (similar to useEffect's deps), but it ALSO defines the cache slot.

---

## 5. Stale vs Cache Time (commonly confused)

| Concept | Default | Meaning |
|---|---|---|
| `staleTime` | `0` | How long data is considered "fresh" (won't refetch even if remounted) |
| `gcTime` (was `cacheTime` in v4) | `5 min` | How long **unused/inactive** data stays in memory before garbage collected |

> Fresh data → served from cache, no network call.
> Stale data → served from cache instantly, BUT triggers background refetch (stale-while-revalidate pattern).

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 1000 * 60 * 5,  // fresh for 5 min — good for data that doesn't change often
  gcTime: 1000 * 60 * 10,    // keep in memory 10 min after unused
})
```

---

## 6. Automatic Refetching (built-in, configurable)

By default, refetches happen on:
- Component remount
- Window refocus (`refetchOnWindowFocus`)
- Network reconnect (`refetchOnReconnect`)
- Stale query + new mount

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: false, // disable if annoying in dev
  refetchInterval: 10000,      // polling every 10s
})
```

---

## 7. Core Concept #2 — `useMutation` (POST/PUT/PATCH/DELETE)

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function AddTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newTodo) =>
      axios.post('/api/todos', newTodo).then(res => res.data),

    onSuccess: () => {
      // invalidate → refetch the todos list so UI updates
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (err) => console.error(err),
  })

  return (
    <button
      onClick={() => mutation.mutate({ title: 'New Task' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Adding...' : 'Add Todo'}
    </button>
  )
}
```

### mutation states
`isPending` (was `isLoading`), `isError`, `isSuccess`, `data`, `error`, `mutate()` (fire & forget), `mutateAsync()` (returns promise, use with try/catch + await)

> **Golden Rule:** `useQuery` = read (GET). `useMutation` = write (POST/PUT/PATCH/DELETE). Mutations don't auto-cache — you manually sync cache via `invalidateQueries` or `setQueryData`.

---

## 8. Cache Updates After Mutation — 2 Strategies

### A) Invalidate & Refetch (simple, safe — most common)
```js
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['todos'] })
}
```
→ Marks matching queries stale → triggers refetch. Easiest, slightly more network calls.

### B) Optimistic Update (instant UI, advanced)
```js
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData(['todos'])

    queryClient.setQueryData(['todos'], (old) =>
      old.map(t => t._id === newTodo._id ? newTodo : t)
    )

    return { previousTodos } // context for rollback
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos) // rollback
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] }) // re-sync with server
  },
})
```

> Optimistic = update UI immediately before server confirms, rollback if it fails. Use for snappy UX (likes, toggles, todo checks).

---

## 9. Dependent / Sequential Queries

```jsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
})

const { data: posts } = useQuery({
  queryKey: ['posts', user?._id],
  queryFn: () => fetchPostsByUser(user._id),
  enabled: !!user?._id,   // wait until user is loaded
})
```

---

## 10. Pagination & Infinite Scroll

### Paginated (page-based)
```jsx
const { data, isFetching } = useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  placeholderData: (prevData) => prevData, // keep old page visible while next loads (v5)
})
```

### Infinite Scroll
```jsx
import { useInfiniteQuery } from '@tanstack/react-query'

const {
  data, fetchNextPage, hasNextPage, isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['todos'],
  queryFn: ({ pageParam }) => fetchTodos(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) =>
    lastPage.hasMore ? allPages.length + 1 : undefined,
})

// data.pages is an array of page results
data.pages.map(page => page.todos.map(todo => <Todo key={todo._id} {...todo} />))
```

---

## 11. Manual Cache Manipulation (good for MERN CRUD)

```js
queryClient.getQueryData(['todos'])          // read cache
queryClient.setQueryData(['todos'], newData) // write cache directly
queryClient.invalidateQueries({ queryKey: ['todos'] }) // mark stale + refetch
queryClient.removeQueries({ queryKey: ['todos'] })     // remove from cache
queryClient.refetchQueries({ queryKey: ['todos'] })    // force refetch now
```

---

## 12. Error Handling Pattern (Express API + Axios)

```jsx
useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    try {
      const res = await axios.get('/api/todos')
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Something went wrong')
    }
  },
  retry: 1, // don't hammer your Express server on 404/500
})
```

---

## 13. Custom Hooks Pattern (MERN best practice)

Keep queries reusable — abstract into hooks per resource:

```js
// hooks/useTodos.js
export const useTodos = () =>
  useQuery({ queryKey: ['todos'], queryFn: () => axios.get('/api/todos').then(r => r.data) })

export const useAddTodo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (todo) => axios.post('/api/todos', todo).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}
```
```jsx
// Component.jsx
const { data: todos } = useTodos()
const { mutate: addTodo } = useAddTodo()
```

---

## 14. Comparison Cheat Sheet

| Need | Use |
|---|---|
| Fetch GET data | `useQuery` |
| Create/Update/Delete | `useMutation` |
| Infinite scroll feed | `useInfiniteQuery` |
| Multiple parallel queries | Call multiple `useQuery` OR `useQueries([...])` |
| Wait for one query before another | `enabled` option |
| Update UI instantly before server responds | Optimistic update (`onMutate`) |
| Sync after mutation | `invalidateQueries` |
| Auto re-fetch on interval | `refetchInterval` |

---

## 15. TanStack Query vs Redux/Context (interview-ready answer)

- Redux/Context: good for **client state** (theme, auth flags, UI toggles, form state).
- TanStack Query: good for **server/async state** (anything from your DB/API) — handles caching, loading, error, sync automatically.
- You usually **don't need Redux for API data anymore** if you use TanStack Query — drastically cuts boilerplate in MERN apps.

---

## 16. Quick Mental Model Recap

```
GET data       → useQuery        (cache-first, auto refetch)
POST/PUT/DEL   → useMutation     (manual, then invalidate cache)
queryKey       → cache identity + dependency trigger
staleTime      → "how long is this data trustworthy"
gcTime         → "how long do we keep unused cache around"
invalidateQueries → "refetch this because data may have changed"
```

---

### 🔁 60-Second Recall Drill
1. What hook for GET? → `useQuery`
2. What hook for POST? → `useMutation`
3. What triggers refetch on key change? → `queryKey`
4. What keeps data "fresh" without refetch? → `staleTime`
5. After a mutation, how do you update the list UI? → `invalidateQueries` (or optimistic `setQueryData`)
6. How to delay a query until a value exists? → `enabled: !!value`
7. How to do infinite scroll? → `useInfiniteQuery` + `getNextPageParam`
