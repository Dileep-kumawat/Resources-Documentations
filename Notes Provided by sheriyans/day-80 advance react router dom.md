
## . `useNavigate()`

**What:** Hook used to **navigate programmatically** (via JavaScript, not clicks).

**Why:** Redirect after login, submit, logout, or any condition.

```jsx
import { useNavigate }from"react-router-dom";

functionLogin() {
const navigate =useNavigate();

functionhandleLogin() {
// login logic
navigate("/dashboard");// redirect
  }

return<buttononClick={handleLogin}>Login</button>;
}

```

**Key Points**

- Replaces `useHistory` (older versions)
- Used **inside components only**
- `navigate(-1)` → go back

---

## 2. `Outlet`

**What:** Placeholder to render **child (nested) routes**.

**Why:** Needed when using **nested routing**.

```jsx
import {Outlet }from"react-router-dom";

functionLayout() {
return (
<>
<h1>Navbar</h1>
<Outlet />
</>
  );
}

```

```jsx
{
path:"/",
element:<Layout />,
children: [
    {path:"home",element:<Home /> },
    {path:"about",element:<About /> }
  ]
}

```

**Key Points**

- Parent component must contain `<Outlet />`
- Child routes render **inside Outlet**

---

## 3. `createBrowserRouter`

**What:** Modern way to define routes (v6.4+).

**Why:** Cleaner, object-based routing with nesting.

```jsx
import { createBrowserRouter,RouterProvider }from"react-router-dom";

const router =createBrowserRouter([
  {
path:"/",
element:<Layout />,
children: [
      {path:"home",element:<Home /> },
      {path:"about",element:<About /> }
    ]
  }
]);

functionApp() {
return<RouterProviderrouter={router} />;
}

```

**Key Points**

- Replaces `<BrowserRouter>` + `<Routes>`
- Supports nested routes naturally
- Used with `<RouterProvider />`

---

## 4. `NavLink`

**What:** Special version of `Link` that knows **active route state**.

**Why:** To apply styles to the active link.

```jsx
import {NavLink }from"react-router-dom";

functionNavbar() {
return (
<NavLink
to="/home"
className={({isActive }) => (isActive ? "active" : "")}
    >
      Home
</NavLink>
  );
}

```

**Key Points**

- `isActive` helps style active links
- Best for navbars
- Use instead of `Link` when active styling is needed
Displaying Day 80 Notes.md.