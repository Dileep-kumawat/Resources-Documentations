# shadcn/ui — Quick Recall Notes (for MERN devs)

## 1. What is shadcn/ui, really?

- **Not a component library** (no `npm install shadcn-ui` that gives you a black-box `<Button/>` from node_modules).
- It's a **CLI + collection of copy-paste components** built on **Radix UI** (unstyled, accessible primitives) + **Tailwind CSS**.
- When you "add" a component, the **actual source code (.tsx)** gets copied into *your* project (usually `src/components/ui/`). You own it, can edit it freely.
- Think of it like: Radix gives behavior/accessibility, Tailwind gives styling, shadcn gives you the pre-wired glue code.

**Why MERN devs like it:**
- Works great with React + Next.js + Vite.
- No runtime dependency bloat — only the components you add live in your repo.
- Fully customizable (it's just your code), good with REST/GraphQL data from Express/Mongo backends since it's just UI.

---

## 2. Prerequisites

- React project (Vite, Next.js, Remix, etc.)
- Tailwind CSS installed & configured
- TypeScript (recommended, but JS works too)

---

## 3. Installation (Vite + React example)

```bash
# 1. Create app
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install

# 2. Install Tailwind
npm install tailwindcss @tailwindcss/vite
# configure tailwind in vite.config.ts & index.css (per Tailwind docs)

# 3. Init shadcn
npx shadcn@latest init
```

`init` asks:
- Style (New York / Default)
- Base color (slate, zinc, etc.)
- CSS variables for theming? (yes recommended)
- Path aliases (`@/components`, `@/lib/utils`)

This creates:
```
components.json     # shadcn config
src/lib/utils.ts     # cn() helper (clsx + tailwind-merge)
src/index.css        # CSS variables for theme
```

---

## 4. Adding Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card input dialog form table dropdown-menu
```

- This drops actual source files into `src/components/ui/button.tsx` etc.
- Edit them directly — no "ejecting" needed, you already have the code.

---

## 5. Using a Component

```tsx
import { Button } from "@/components/ui/button"

function App() {
  return <Button variant="outline" size="lg">Click Me</Button>
}
```

Common props pattern (via `class-variance-authority` / `cva`):
- `variant`: `default | destructive | outline | secondary | ghost | link`
- `size`: `default | sm | lg | icon`

---

## 6. The `cn()` Utility (IMPORTANT — used everywhere)

`src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- Merges conditional classNames AND resolves Tailwind conflicts (e.g. `p-2 p-4` → keeps `p-4`).
- Use it whenever you override styles:
```tsx
<Button className={cn("bg-red-500", isActive && "bg-green-500")} />
```

---

## 7. cva (class-variance-authority) — How variants work

Each component (e.g. `button.tsx`) defines variants like this:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

- This is how shadcn gives you Tailwind variants without writing them manually each time.
- You can add your own custom variant by editing this object directly.

---

## 8. Theming (CSS Variables)

In `index.css`, shadcn defines design tokens as CSS variables (HSL values):

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

`tailwind.config.js` maps these to Tailwind classes:
```js
colors: {
  background: "hsl(var(--background))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
}
```

- To re-theme your whole app → just change these CSS variables (e.g. brand colors).
- Use [ui.shadcn.com/themes](https://ui.shadcn.com/themes) to generate a custom palette and paste it in.

### Dark Mode
- Toggle by adding/removing `.dark` class on `<html>`.
- Pair with `next-themes` (Next.js) or a manual context + localStorage (Vite/CRA).

```tsx
// simple toggle (non-Next)
document.documentElement.classList.toggle("dark")
```

---

## 9. Forms — shadcn + react-hook-form + zod (MOST IMPORTANT PATTERN)

This is the combo you'll use constantly for MERN CRUD forms (login, signup, create-post, etc.)

```bash
npx shadcn@latest add form input label
npm install react-hook-form zod @hookform/resolvers
```

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: z.infer<typeof schema>) {
    // call your Express API here, e.g. axios.post("/api/login", values)
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Login</Button>
      </form>
    </Form>
  )
}
```

**Recall trick:** Form = `useForm` (state) + `zod` (validation schema) + shadcn `<FormField>` (wires both to UI + shows errors automatically).

---

## 10. Data Tables (great for admin panels / Mongo collections display)

```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

Pattern: Define `columns` (with accessorKey matching your Mongo schema fields) → pass `data` (fetched from Express API) → `useReactTable` hook → render `<Table>`.

```tsx
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
]

const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
```
Use for: user lists, order tables, product inventories — typical MERN admin dashboard need.

---

## 11. Common Components Cheat Sheet

| Component | Use case | Install |
|---|---|---|
| `button` | Actions | `add button` |
| `input` / `textarea` | Form fields | `add input textarea` |
| `card` | Containers (product card, dashboard widget) | `add card` |
| `dialog` | Modals | `add dialog` |
| `sheet` | Slide-in panel (mobile nav, filters) | `add sheet` |
| `dropdown-menu` | Context menus, user avatar menu | `add dropdown-menu` |
| `select` | Custom `<select>` | `add select` |
| `table` | Tabular data | `add table` |
| `toast` / `sonner` | Notifications (API success/error) | `add sonner` |
| `tabs` | Tabbed UI | `add tabs` |
| `avatar` | User profile pic | `add avatar` |
| `badge` | Status labels (Pending/Active) | `add badge` |
| `skeleton` | Loading states (while fetching from API) | `add skeleton` |
| `alert-dialog` | Confirm delete actions | `add alert-dialog` |
| `popover` / `tooltip` | Hints, small overlays | `add popover` |
| `command` | Search/command palette (cmdk) | `add command` |
| `calendar` / `date-picker` | Date inputs | `add calendar` |

---

## 12. Toasts (notifications for API responses)

```bash
npx shadcn@latest add sonner
```
```tsx
// in root layout
import { Toaster } from "@/components/ui/sonner"
<Toaster />

// anywhere
import { toast } from "sonner"
toast.success("User created!")
toast.error("Failed to save to MongoDB")
```
Perfect for wrapping your axios/fetch calls to Express endpoints.

---

## 13. Typical MERN Integration Pattern

```tsx
// Fetching + displaying with loading skeleton
function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("/api/users")
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton className="h-10 w-full" />

  return (
    <div className="grid gap-4">
      {users.map(u => (
        <Card key={u._id}>
          <CardHeader><CardTitle>{u.name}</CardTitle></CardHeader>
          <CardContent>{u.email}</CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 14. Folder Structure After Setup

```
src/
  components/
    ui/              <- shadcn generated components (button.tsx, card.tsx...)
    YourComponent.tsx <- your own components, can import from ui/
  lib/
    utils.ts         <- cn() helper
  index.css          <- tailwind + CSS variable themes
components.json       <- shadcn config (style, aliases, paths)
```

---

## 15. Updating Components

- No auto-update via npm (since code is copied). To get latest version of a component:
```bash
npx shadcn@latest add button --overwrite
```
⚠️ This overwrites your custom edits — diff before overwriting if you've customized it.

---

## 16. Key Mental Model (for fast recall)

```
Radix UI  → behavior + accessibility (focus trap, ARIA, keyboard nav)
Tailwind  → styling utility classes
cva       → variant system (size, color, style props)
shadcn CLI→ scaffolds the glue code into YOUR repo
cn()      → merges/overrides Tailwind classes safely
```

**One-liner to remember:** *"shadcn isn't a library you install — it's a code generator that hands you Radix + Tailwind components you fully own and can hack on."*

---

## 17. Useful Links
- Docs: https://ui.shadcn.com/docs
- Components list: https://ui.shadcn.com/docs/components
- Theme generator: https://ui.shadcn.com/themes
- Blocks (prebuilt page sections): https://ui.shadcn.com/blocks
