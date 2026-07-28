# 🔐 Access Token & Refresh Token — Quick Recall Notes (MERN)

## 1. Why do we even need this?

HTTP is **stateless** — server doesn't remember you between requests. We need a way to prove "I'm logged in" on every request *without* sending username/password again. That's what tokens do.

---

## 2. Access Token

| Property | Details |
|---|---|
| **What** | A short-lived JWT (JSON Web Token) proving the user is authenticated |
| **Lifespan** | Short — **15 min to 1 hour** |
| **Stored where** | In memory (React state/context) — ❌ avoid localStorage (XSS risk) |
| **Used for** | Sent in `Authorization: Bearer <token>` header on every protected API request |
| **Contains** | Payload like `{ userId, role, iat, exp }` (signed, not encrypted) |
| **Verified by** | Middleware on backend using `jwt.verify(token, ACCESS_TOKEN_SECRET)` |

**Why short-lived?** If it leaks (XSS, intercepted), damage window is small — it expires quickly.

### Generate Access Token (Node/Express)
```js
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}
```

### Verify Access Token (Middleware)
```js
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) return res.sendStatus(401); // No token

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Invalid/expired
    req.user = decoded;
    next();
  });
}
```

---

## 3. Refresh Token

| Property | Details |
|---|---|
| **What** | A long-lived token used **only** to get a new access token |
| **Lifespan** | Long — **7 days to 30 days** (sometimes longer) |
| **Stored where** | ✅ **HttpOnly Secure Cookie** (JS can't read it → safe from XSS) |
| **Used for** | Sent ONLY to a special `/refresh-token` endpoint, not every API call |
| **Stored in DB?** | Yes, usually — so server can revoke/invalidate it (logout, security breach) |
| **Verified by** | A separate secret: `REFRESH_TOKEN_SECRET` |

**Why long-lived but safer?** It never touches frontend JS (httpOnly cookie), and it's checked against DB, so it can be revoked anytime.

### Generate & Send Refresh Token (on Login)
```js
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

// Login route
app.post("/login", async (req, res) => {
  // ...validate user credentials...

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refreshToken in DB (so we can revoke later)
  await User.findByIdAndUpdate(user._id, { refreshToken });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,      // only over HTTPS
    sameSite: "strict",// CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, user: { id: user._id, name: user.name } });
});
```

### Refresh Token Endpoint
```js
app.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403); // Token revoked/invalid

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});
```

### Logout (Revoke Refresh Token)
```js
app.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  res.clearCookie("refreshToken");
  res.sendStatus(204);
});
```

---

## 4. The Full Flow (Visual Mental Model)

```
1. LOGIN
   Client → /login (email, password)
   Server → checks DB → generates accessToken + refreshToken
   Server → sends accessToken in JSON body
   Server → sends refreshToken in httpOnly cookie

2. USING THE APP
   Client → attaches accessToken in Authorization header
   Server → verifies → allows access to protected routes

3. ACCESS TOKEN EXPIRES (after 15 min)
   Client → API call fails with 401/403
   Client → automatically calls /refresh-token
            (browser sends httpOnly cookie automatically)
   Server → verifies refreshToken against DB
   Server → issues a NEW accessToken
   Client → retries original request with new accessToken

4. LOGOUT
   Client → calls /logout
   Server → deletes refreshToken from DB + clears cookie
```

---

## 5. Frontend (React) — Axios Interceptor Pattern

This is the **real-world pattern** used to auto-refresh tokens silently.

```js
// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // important! sends httpOnly cookie
});

let accessToken = null; // kept in memory (e.g. via context/state)

export const setAccessToken = (token) => { accessToken = token; };

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post("/refresh-token"); // cookie auto-sent
        setAccessToken(res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest); // retry original failed request
      } catch (err) {
        // refresh failed → force logout/redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 6. Access Token vs Refresh Token — Cheat Table

| | Access Token | Refresh Token |
|---|---|---|
| **Purpose** | Authorize API requests | Get new access token |
| **Lifespan** | Short (mins) | Long (days/weeks) |
| **Storage (frontend)** | Memory (NOT localStorage) | HttpOnly cookie |
| **Sent with** | Every protected request (header) | Only to refresh endpoint |
| **Stored in DB** | No (stateless) | Usually yes (revocable) |
| **Risk if stolen** | Limited (expires fast) | High → mitigated by httpOnly + DB check |
| **Secret used** | `ACCESS_TOKEN_SECRET` | `REFRESH_TOKEN_SECRET` (different!) |

---

## 7. Common Interview/Recall Questions

**Q: Why not just use one long-lived token?**
→ If stolen, attacker has long-term access. Splitting into short access + long refresh limits exposure and allows revocation.

**Q: Why store refresh token in httpOnly cookie, not localStorage?**
→ localStorage is accessible via JS → vulnerable to **XSS**. httpOnly cookies can't be read by JS at all.

**Q: How do you "logout" if JWTs are stateless?**
→ You can't truly invalidate a JWT before expiry (it's stateless) — but you CAN delete the refresh token from DB, so no new access tokens can be issued, and clear the cookie. Old access token works until it naturally expires (hence keeping it short).

**Q: What's in the JWT payload? Is it encrypted?**
→ JWT is **signed**, not **encrypted**. Anyone can decode and read the payload (base64) — just can't *modify* it without invalidating the signature. So **never put passwords/sensitive secrets in payload.**

**Q: What is `sameSite` and `secure` in cookie options for?**
→ `secure: true` → cookie only sent over HTTPS. `sameSite: "strict"/"lax"` → protects against CSRF by restricting cross-site cookie sending.

**Q: What happens if refresh token also expires?**
→ User is forced to log in again with credentials.

---

## 8. Security Checklist (Don't skip!)

- [ ] Access token: short expiry (15m–1h)
- [ ] Refresh token: httpOnly + secure + sameSite cookie
- [ ] Different secrets for access vs refresh tokens
- [ ] Refresh tokens stored in DB → allows revocation
- [ ] Rotate refresh token on each use (optional, more secure) — issue new refresh token every time old one is used, invalidate old one
- [ ] Always use HTTPS in production
- [ ] Never store tokens in localStorage if avoidable (XSS risk)
- [ ] Implement logout to clear cookie + remove DB token
- [ ] Rate-limit `/refresh-token` and `/login` endpoints

---

## 9. One-Line Summary to Remember Forever

> **Access token = your daily ID card (expires fast, used everywhere).**
> **Refresh token = the vault key that mints new ID cards (kept locked away, used rarely).**
