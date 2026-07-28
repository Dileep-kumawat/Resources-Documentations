# Origin UI — Quick Recall Notes (for MERN Devs)

> Goal: skim this in 5–10 min and have everything come back.

---

## 1. What is Origin UI?

- A **free, open-source React + Tailwind CSS component library**: originui.com
- **Not an npm package** — it's a **copy-paste** component collection (same philosophy as **shadcn/ui**).
- Follows **shadcn conventions**, so if you've used shadcn before, it feels identical.
- Built on top of **Radix UI primitives** (accessibility, keyboard nav, screen reader support) + Tailwind for styling.
- 200+ to 400+ components: buttons, inputs, selects, modals, tabs, navbars, cards, file uploads, OTP inputs, date pickers, charts, etc.
- As of **Feb 25, 2025**, the library moved to **Tailwind CSS v4**. Old v3 components are kept under `/legacy/`.
- **Note (2025–26 rename):** Origin UI has been evolving into **"coss ui"**, rebuilt on **Base UI primitives** instead of Radix, with 3 abstraction layers: Primitives → Particles → Atoms. Good to know if you see "coss ui" mentioned — same lineage, newer foundation.

### Why it matters for a MERN dev
- You already build the backend (Express/Mongo) and React frontend — Origin UI just gives you **production-ready, accessible UI pieces** so you don't hand-roll dropdowns, modals, toasts, etc.
- No vendor lock-in: code lives **in your repo**, so you can edit Tailwind classes/JSX directly like any other component you wrote.

---

## 2. Core Philosophy (memorize this)

| Trait | Meaning |
|---|---|
| Copy-paste, not `npm install` | You literally copy `.tsx` source into your own `components/ui` folder |
| Full ownership | Once copied, it's *your* code — no black-box dependency to update/patch |
| Composable primitives | Built on Radix UI (or Base UI in coss ui) for accessibility |
| Tailwind-first | All styling = Tailwind utility classes, easy to theme |
| shadcn-compatible | Can mix with existing shadcn/ui projects without conflicts |

---

## 3. Setup / Installation Flow

### Prerequisite
- A React project (Vite, Next.js, or CRA-equivalent) with **Tailwind CSS** already configured.
- Origin UI works great with Next.js but is **not Next-only** — any React project works.

### Two ways to add components

**A. Using the `shadcn` CLI (recommended)**
```bash
pnpm dlx shadcn@latest add https://originui.com/r/comp-01.json
```
- Replace `comp-01.json` with the specific component's registry URL (each component page on originui.com shows its own command).
- For legacy (Tailwind v3) version of a component:
```bash
pnpm dlx shadcn@latest add https://originui.com/r/legacy/comp-01.json
```

**B. Manual copy**
1. Go to the component page on originui.com.
2. Copy the `.tsx` code shown.
3. Paste into your project's `components/ui/` folder.
4. Copy `utils.ts` (usually the `cn()` helper using `clsx` + `tailwind-merge`) into `lib/utils.ts`.
   - If you already use shadcn, you likely already have this — Origin UI recommends using **its** version of shared files for consistent styling.

### Dependencies you'll typically need
```bash
npm install clsx tailwind-merge class-variance-authority @radix-ui/react-* lucide-react
```
(exact Radix package depends on which component — e.g. `@radix-ui/react-dialog` for modals)

---

## 4. Typical Folder Structure (MERN + React frontend)

```
client/
 ├─ src/
 │   ├─ components/
 │   │   └─ ui/              ← Origin UI components land here
 │   │        ├─ button.tsx
 │   │        ├─ dialog.tsx
 │   │        └─ input.tsx
 │   ├─ lib/
 │   │   └─ utils.ts         ← cn() helper
 │   ├─ pages/
 │   └─ App.tsx
 ├─ tailwind.config.js
 └─ package.json
```

---

## 5. The `cn()` Utility (you'll see this everywhere)

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
- `clsx` → conditionally joins class names.
- `twMerge` → resolves conflicting Tailwind classes (e.g. `px-2` vs `px-4` → keeps the latter).
- Used inside every component to merge default styles with any custom `className` prop you pass.

---

## 6. Anatomy of a Typical Component

Example pattern (Button):
```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

**Key takeaway:** Origin UI heavily uses **`class-variance-authority` (CVA)** to manage style variants (`variant`, `size`, etc.) — this is the recurring pattern across buttons, badges, alerts, inputs.

---

## 7. Component Categories (mental map)

| Category | Examples |
|---|---|
| Form & Input | Input, Textarea, Select, Checkbox, Radio, Switch, OTP input, Date picker, File upload, Combobox |
| Navigation | Navbar, Tabs, Breadcrumb, Pagination, Sidebar |
| Overlay/Feedback | Dialog/Modal, Drawer, Toast, Tooltip, Popover, Alert |
| Data Display | Table, Card, Badge, Avatar, Accordion, Charts |
| Buttons & Actions | Button (variants), Dropdown menu, Toggle |
| Layout | Separator, Skeleton (loading), Aspect Ratio |

For a MERN app think: **Login/Signup forms → Input + Button + Checkbox**, **Dashboards → Card + Table + Charts**, **CRUD modals → Dialog + Form components**, **Notifications after API calls → Toast/Alert**.

---

## 8. Using Components in a MERN App (practical flow)

1. Build your Express API as usual (`/api/users`, `/api/posts`, etc.).
2. In React, fetch data with `fetch`/`axios`/React Query.
3. Render results using Origin UI components instead of raw HTML:
   ```tsx
   import { Button } from "@/components/ui/button";
   import { Input } from "@/components/ui/input";

   function LoginForm() {
     return (
       <form onSubmit={handleSubmit}>
         <Input type="email" placeholder="Email" />
         <Input type="password" placeholder="Password" />
         <Button type="submit">Login</Button>
       </form>
     );
   }
   ```
4. Use **Dialog** for create/edit modals tied to POST/PUT requests.
5. Use **Toast** to show success/error after API calls (e.g., "User created successfully").
6. Use **Table** + pagination for listing MongoDB documents.

---

## 9. Theming / Customization

- Colors driven by **CSS variables** (e.g. `--primary`, `--background`) defined in `globals.css`, same as shadcn's theming model.
- Switch themes (light/dark) by toggling a `dark` class on `<html>` — Tailwind's `dark:` variant handles the rest.
- You can freely edit any copied component's Tailwind classes since it's your own code — no override gymnastics needed.

---

## 10. Origin UI vs shadcn/ui vs MUI/Ant — quick comparison

| | Origin UI | shadcn/ui | MUI / AntD |
|---|---|---|---|
| Install method | Copy-paste / CLI | Copy-paste / CLI | npm package |
| Styling | Tailwind | Tailwind | CSS-in-JS / LESS |
| Ownership of code | Full (in your repo) | Full | No (lives in node_modules) |
| Component count | 200–400+ | Smaller core set | Very large |
| Best for | Fast, custom-styled apps wanting more pre-built variety than shadcn | Minimal, highly customizable base | Enterprise apps needing huge ready-made systems fast |

---

## 11. Gotchas / Things to Remember

- Always check whether a component needs a Tailwind v4 setup — mixing v3 project + v4 component syntax can break styles (use `/legacy/` URL if your project is still on Tailwind v3).
- You must manually keep components updated — since it's copy-paste, there's **no auto-update**; re-copy from the site if you want newer versions.
- Component pages on originui.com show **live preview + code tab + CLI command** — that's your fastest "just grab it" workflow.
- Watch for the rename to **coss ui** (Base UI based) in newer docs/links — same idea, slightly different internals (no Radix dependency).

---

## 12. One-Line Recall Summary

> **Origin UI = a free gallery of accessible, Tailwind-styled React components you copy directly into your project (shadcn-style), letting a MERN dev skip writing common UI (forms, modals, tables, toasts) from scratch while keeping full code ownership.**

---

### Useful Links
- Site: https://originui.com
- GitHub (legacy name): `origin-space/originui`
- Rebrand: coss ui — built on Base UI primitives
