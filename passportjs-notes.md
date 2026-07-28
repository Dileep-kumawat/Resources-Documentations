# Passport.js — Revision Notes (MERN Stack)

## 1. What is Passport.js?
- Authentication **middleware** for Node.js (works with Express).
- Does NOT handle login UI, sessions, or DB storage itself — it just **authenticates requests** using "strategies".
- Modular: each login method (local, Google, GitHub, JWT, etc.) = a separate **strategy** (separate npm package).

---

## 2. Core Concepts

| Term | Meaning |
|---|---|
| **Strategy** | A plugin that defines *how* to verify a user (e.g. `passport-local`, `passport-jwt`, `passport-google-oauth20`) |
| **Verify callback** | Function you write that checks credentials & returns the user |
| **Serialize** | Decide what user data to store in the session (usually just `user.id`) |
| **Deserialize** | Take that stored id and fetch the full user object on each request |
| **req.user** | Populated by Passport once authenticated |
| **req.isAuthenticated()** | Helper method added by Passport to check login state |
| **req.login() / req.logout()** | Manually log a user in/out |

---

## 3. Installation (Local Strategy + Sessions example)

```bash
npm install passport passport-local express-session
```

---

## 4. Basic Setup Flow (Local Strategy with Sessions)

### a) Configure strategy
```js
// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
  { usernameField: 'email' }, // default is 'username'
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Wrong password' });

      return done(null, user); // success
    } catch (err) {
      return done(err);
    }
  }
));

// Store only user id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Fetch full user on every request
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
```

### b) Wire into Express app
```js
const session = require('express-session');
const passport = require('./config/passport');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
```

### c) Login route
```js
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true, // optional, needs connect-flash
}));
```

### d) Custom callback (better for APIs / React frontend)
```js
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: 'Logged in', user });
    });
  })(req, res, next);
});
```

### e) Logout
```js
app.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});
```

### f) Protect routes (middleware)
```js
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Not authenticated' });
}

app.get('/dashboard', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});
```

---

## 5. Passport with JWT (common for MERN REST APIs / SPA + React)

Why: Sessions need cookies + server memory/store. JWT is **stateless**, great for React frontend + separate API, mobile apps.

```bash
npm install passport-jwt jsonwebtoken
```

```js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) return done(null, user);
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));
```

**No sessions needed** — skip `serializeUser`/`deserializeUser`, skip `express-session`.

### Login route issuing JWT
```js
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});
```

### Protecting routes with JWT
```js
app.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: req.user });
});
```

⚠️ Always pass `{ session: false }` when using JWT strategy (no session needed).

---

## 6. OAuth Strategies (Google / GitHub login)

```bash
npm install passport-google-oauth20
```

```js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));
```

### Routes
```js
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);
```

---

## 7. Local Strategy vs JWT Strategy — When to Use What

| | Session (Local Strategy) | JWT Strategy |
|---|---|---|
| State | Stateful (stored server-side / store like Redis) | Stateless |
| Storage | Cookie (`connect.sid`) | Token (localStorage / cookie) |
| Scaling | Needs shared session store across servers | Easy horizontal scaling |
| CSRF risk | Higher (cookie-based) | Lower (if not stored in cookie) |
| XSS risk | Lower | Higher (if token in localStorage) |
| Best for | Traditional server-rendered apps | React/Next.js SPA + REST API, mobile apps |
| Logout | Easy (destroy session) | Harder (must blacklist/short expiry) |

**MERN with separate React frontend → JWT strategy is more common.**
**MERN with EJS/server-rendered views → Session/Local strategy is common.**

---

## 8. Common Gotchas / Things You Always Forget

1. `passport.initialize()` and `passport.session()` must come **after** `express-session` middleware.
2. Forgetting `{ session: false }` in JWT routes → Passport tries session stuff unnecessarily.
3. `serializeUser`/`deserializeUser` only needed for **session-based** strategies, not JWT.
4. Always hash passwords (`bcrypt`) — Passport does NOT do this for you.
5. `done(err, user, info)` — 3 params: error, user (or false), info object (for messages).
6. CORS + cookies (session strategy) with React frontend → need `credentials: true` on both client (axios/fetch) and server CORS config, and `sameSite`/`secure` cookie settings in production (HTTPS).
7. For JWT in React: store token in memory/httpOnly cookie if possible (avoid plain localStorage for security-sensitive apps).
8. Multiple strategies can be registered — pass strategy name as string: `passport.authenticate('local', ...)`, `passport.authenticate('jwt', ...)`, `passport.authenticate('google', ...)`.
9. `req.user` is `undefined` if not authenticated — always check before accessing.

---

## 9. Quick Mental Model (TL;DR)

```
Request → passport.authenticate('strategy-name')
            → runs strategy's verify callback
              → done(err, user/false, info)
                → if user: req.user = user, next()
                → if false: 401 / failureRedirect
```

- **Session flow:** login → serialize(user.id) → cookie sent → every request deserializes back to full user.
- **JWT flow:** login → sign token → client sends `Authorization: Bearer <token>` → strategy verifies & decodes → attaches user.

---

## 10. Folder Structure Suggestion (MERN)

```
/config
  passport.js        # strategy configs
/middleware
  ensureAuth.js       # route protection
/models
  User.js
/routes
  auth.js             # /login /register /logout /auth/google etc.
server.js             # app.use(passport.initialize()) etc.
```

---

## 11. Minimal Cheat-Sheet (for last-minute recall)

- `passport.use(new Strategy(options, verifyCallback))` — register a strategy
- `passport.authenticate('name', options)` — middleware to trigger auth
- `passport.serializeUser()` / `deserializeUser()` — session only
- `req.login(user, cb)` — manually establish session
- `req.logout(cb)` — destroy session
- `req.isAuthenticated()` — boolean check
- `req.user` — current authenticated user object
- JWT routes → always `{ session: false }`
