## Introduction

Most modern web applications need to **fetch data from APIs**.

For example:

- Fetch products from a database
- Get user profile data
- Send login requests
- Submit forms

In React applications, one of the most popular libraries used to communicate with APIs is **Axios**.

Axios helps us:

- Send HTTP requests
- Receive data from servers
- Handle errors easily
- Send data to backend APIs

This documentation explains **Axios from scratch in simple language**, including:

- Installation
- Sending headers
- Sending form data
- Query parameters
- Interceptors
- Pagination

---

# 1. What is Axios?

**Axios** is a JavaScript library used to make **HTTP requests**.

It allows React applications to communicate with **backend servers or APIs**.

Example tasks Axios can do:

- Fetch user data
- Send login credentials
- Create new records
- Update data
- Delete data

Axios supports common HTTP methods:

- **GET** → fetch data
- **POST** → send data
- **PUT** → update data
- **PATCH** → partially update data
- **DELETE** → remove data

---

# 2. Installing Axios

Before using Axios, we need to install it in the React project.

### Step 1 — Install Axios

```bash
npm install axios
```

After installation, Axios can be imported into any component.

---

# 3. Importing Axios

To use Axios, import it inside your React component.

```jsx
import axios from "axios";
```

Now Axios can be used to make API requests.

---

# 4. Making a GET Request

A **GET request** is used to fetch data from an API.

Example:

```jsx
axios.get("https://jsonplaceholder.typicode.com/posts")
```

This fetches data from the API.

---

# 5. Calling an API in React using useEffect

Usually APIs are called when the component **first loads**.

We use **useEffect** for that.

```jsx
import { useEffect, useState } from "react";
import axios from "axios";

function Posts() {

  const [posts, setPosts] = useState([]);

  useEffect(() => {

    axios.get("https://jsonplaceholder.typicode.com/posts")
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.log(error);
      });

  }, []);

  return (
    <div>
      {posts.map(post => (
        <p key={post.id}>{post.title}</p>
      ))}
    </div>
  );
}

export default Posts;
```

Flow:

```
Component loads
↓
useEffect runs
↓
Axios sends GET request
↓
Server returns data
↓
State updates
↓
UI renders
```

---

# 6. Using Async/Await with Axios

Instead of `.then()` we can use **async/await**.

```jsx
const fetchPosts = async () => {

  try {

    const response = await axios.get("/api/posts");

    console.log(response.data);

  } catch (error) {
    console.log(error);
  }

};
```

Advantages:

- Cleaner code
- Easier error handling

---

# 7. What is `response.data`?

When Axios calls an API, the server returns a **response object**.

Structure:

```
response
 ├── data
 ├── status
 ├── headers
 └── config
```

Example:

```jsx
const response = await axios.get("/api/posts");

console.log(response.data);
```

`response.data` contains the **actual API data**.

---

# 8. Sending Data using POST Request

A **POST request** sends data to the server.

```jsx
axios.post("/api/users", {
  name: "Ritik",
  email: "ritik@email.com"
});
```

Example with async:

```jsx
const addUser = async () => {

  try {

    const response = await axios.post("/api/users", {
      name: "John",
      email: "john@email.com"
    });

    console.log(response.data);

  } catch (error) {
    console.log(error);
  }

};
```

---

# 9. Updating Data using PUT Request

```jsx
axios.put("/api/users/1", {
  name: "Updated Name"
});
```

Example:

```jsx
await axios.put(`/api/users/${id}`, updatedUser);
```

---

# 10. Deleting Data using DELETE Request

```jsx
axios.delete("/api/users/1");
```

Example:

```jsx
const deleteUser = async (id) => {

  try {

    await axios.delete(`/api/users/${id}`);

  } catch (error) {
    console.log(error);
  }

};
```

---

# 11. What is a Header?

A **Header** is extra information sent with an HTTP request.

Headers provide **metadata about the request**.

Examples:

- Authorization tokens
- Content-Type
- Language
- API keys

Structure of an HTTP request:

```
Request
 ├── URL
 ├── Method
 ├── Headers
 └── Body
```

Example header:

```
Authorization: Bearer token123
Content-Type: application/json
```

---

# 12. Sending Headers with Axios

```jsx
axios.get("/api/profile", {
  headers: {
    Authorization: "Bearer token123"
  }
});
```

Async example:

```jsx
const response = await axios.get("/api/profile", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

Headers are mostly used for **authentication**.

---

# 13. Sending Form Data using Axios

Sometimes we send form data like:

- Signup forms
- Login forms
- Image uploads

---

# 14. Sending Normal Form Data (JSON)

```jsx
await axios.post("/api/register", {
  name: "Ritik",
  email: "ritik@email.com",
  password: "123456"
});
```

Axios automatically converts it to JSON.

---

# 15. Sending FormData (for File Upload)

```jsx
const formData = new FormData();

formData.append("name", "Ritik");
formData.append("image", file);

await axios.post("/api/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

Flow:

```
User selects file
↓
FormData created
↓
Axios sends request
↓
Server receives file
```

---

# 16. Creating a Reusable Axios Instance

In real applications we create a central Axios configuration.

### api/axios.js

```jsx
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",

});

export default api;
```

Usage:

```jsx
import api from "../api/axios";

const response = await api.get("/posts");
```

---

# 17. Sending Query Parameters (Params)

Sometimes APIs require query parameters.

Example API:

```
/api/products?page=1&limit=10
```

Axios example:

```jsx
axios.get("/api/products", {
  params: {
    page: 1,
    limit: 10
  }
});
```

Axios converts it to:

```jsx
/api/products?page=1&limit=10
```

Used for:

- Filtering
- Searching
- Pagination

---

# 18. Pagination using Axios

Pagination is used when large data needs to be split into pages.

Example API:

```
/api/products?page=1&limit=10
```

Example React implementation:

```jsx
import { useEffect, useState } from "react";
import axios from "axios";

function Products() {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {

    const res = await axios.get("/api/products", {
      params: {
        page: page,
        limit: 10
      }
    });

    setProducts(res.data);

  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <div>

      {products.map(product => (
        <p key={product.id}>{product.name}</p>
      ))}

      <button onClick={() => setPage(page - 1)}>Prev</button>
      <button onClick={() => setPage(page + 1)}>Next</button>

    </div>
  );
}
```

Flow:

```
User clicks Next
↓
Page state updates
↓
Axios request runs
↓
Server returns next page
↓
UI updates
```

Pagination helps:

- Reduce load time
- Improve performance
- Handle large datasets

---

# 19. Adding a Loader (Loading State)

When an API request is being made, it may take some time to receive data from the server.

During this time, we should show a **loading indicator** so the user knows that data is being fetched.

This is called a **Loader or Loading State**.

### Why Loaders are Important

Without a loader:

```
User opens page
↓
Blank screen
↓
Data appears suddenly
```

With a loader:

```
User opens page
↓
Loading indicator appears
↓
Data loads
↓
Content is displayed
```

This improves **user experience**.

---

## Basic Loader Example

We create a **loading state** using `useState`.

```jsx
import {useEffect,useState }from"react";
importaxiosfrom"axios";

functionPosts() {

const [posts,setPosts]=useState([]);
const [loading,setLoading]=useState(true);

constfetchPosts=async () => {

try {

constresponse=awaitaxios.get(
"https://jsonplaceholder.typicode.com/posts"
      );

setPosts(response.data);

    }catch (error) {
console.log(error);
    }

setLoading(false);

  };

useEffect(() => {
fetchPosts();
  }, []);

if (loading) {
return<h2>Loading...</h2>;
  }

return (
<div>
      {posts.map(post => (
<pkey={post.id}>{post.title}</p>
      ))}
</div>
  );
}

exportdefaultPosts;
```

---

## Loader Flow

```
Component loads
↓
loading = true
↓
Axios request sent
↓
Server returns data
↓
loading = false
↓
UI renders data
```

---

## Loader with Spinner Example

Instead of text, we can show a **spinner loader**.

```jsx
if (loading) {
return<divclassName="spinner">Loading...</div>;
}
```

Example CSS spinner:

```css
.spinner {
  font-size:18px;
  font-weight:bold;
}
```

You can also use libraries like:

- React Loader Spinner
- Material UI CircularProgress
- Tailwind loaders

---

## Loader with Pagination Example

When changing pages, we should also show a loader.

```jsx
constfetchProducts=async () => {

setLoading(true);

constres=awaitaxios.get("/api/products", {
    params: {
      page:page,
      limit:10
    }
  });

setProducts(res.data);
setLoading(false);

};
```

UI:

```jsx
{loading? (
<p>Loading products...</p>
): (
products.map(product => (
<pkey={product.id}>{product.name}</p>
  ))
)}
```

---

## Best Practices for Loaders

Recommended practices:

- Always show a loader during API calls
- Use skeleton loaders for better UX
- Avoid blank screens
- Handle loading states for pagination and filters
- Reset loader when new request starts

---

# 20. Axios Interceptors

Interceptors run code **before request** or **after response**.

Used for:

- Adding authentication tokens
- Global error handling
- Logging

Flow:

```
Request
↓
Interceptor
↓
Server
↓
Response
↓
Interceptor
```

---

# 21. Request Interceptor Example

```jsx
axios.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

  },
  (error) => Promise.reject(error)
);
```

---

# 22. Response Interceptor Example

```jsx
axios.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response.status === 401) {
      console.log("Unauthorized user");
    }

    return Promise.reject(error);

  }
);
```

---

# 23. Axios Request Lifecycle

```
Component
↓
Axios Request
↓
Request Interceptor
↓
Server Receives Request
↓
Server Sends Response
↓
Response Interceptor
↓
Component receives data
```

---

# 24. Recommended Folder Structure

```
src
 ├── api
 │     └── axios.js
 ├── services
 │     ├── authService.js
 │     └── productService.js
 ├── pages
 │     └── Products.jsx
 ├── components
 │     └── ProductCard.jsx
```

---

# 25. Best Practices for Axios

Recommended practices:

- Create a central Axios instance
- Use services layer
- Handle errors globally
- Use interceptors for authentication
- Keep API calls outside components when possible

---

# Final Summary

Axios helps React applications communicate with backend APIs easily.

Important concepts:

```
axios.get()       → fetch data
axios.post()      → send data
axios.put()       → update data
axios.delete()    → remove data
headers           → request metadata
FormData          → file uploads
params            → query parameters
pagination        → load data page by page
interceptors      → request/response middleware
response.data     → actual API data
```

Using Axios correctly helps developers build **clean, scalable, and production-ready React applications**.