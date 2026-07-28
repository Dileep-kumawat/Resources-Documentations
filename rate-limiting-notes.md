# Rate Limiting — Quick Recall Notes (MERN Stack)

> Goal of these notes: re-read once, remember everything. Optimized for scanning, not first-time learning.

---

## 1. What & Why

**Rate limiting** = controlling *how many requests* a client (user/IP/API key) can make to your server in a given time window.

**Why it matters:**
- 🛡️ Prevent **abuse / DDoS** (someone hammering your API)
- 💰 Control **infra cost** (DB/CPU usage spikes)
- 🔐 Stop **brute-force attacks** (login, OTP, password reset endpoints)
- ⚖️ Ensure **fair usage** across users (no single user hogs resources)
- 📦 Enforce **business limits** (free tier = 100 req/day, paid = 10k req/day)

**Where it lives in the stack:** Reverse proxy (Nginx/Cloudflare) → API Gateway → **Express middleware (your job as MERN dev)** → Application logic.

---

## 2. Core Vocabulary

| Term | Meaning |
|---|---|
| **Window** | Time period over which requests are counted (e.g., 1 min, 1 hour) |
| **Limit / Quota** | Max requests allowed in that window |
| **Key** | What you're limiting by — IP, user ID, API key, route |
| **429** | HTTP status code → "Too Many Requests" |
| **Retry-After** | Header telling client when to retry |
| **Throttling** | Slowing down requests instead of rejecting (delay vs deny) |
| **Burst** | Temporary spike allowed above steady-state rate |

---

## 3. The 5 Classic Algorithms

### 3.1 Fixed Window Counter
- Divide time into fixed blocks (e.g., every clock-minute). Count requests per block. Reset counter at boundary.
- ✅ Simple, cheap (one counter per key)
- ❌ **Edge burst problem**: 100 reqs at 0:59 + 100 reqs at 1:00 = 200 reqs in 1 second, both "allowed"

### 3.2 Sliding Window Log
- Store **timestamp of every request** in a list/set. On each request, remove timestamps older than `now - window`, count what's left.
- ✅ Perfectly accurate
- ❌ Memory-heavy (stores every timestamp) — bad at scale

### 3.3 Sliding Window Counter (hybrid)
- Combines fixed window + weighted average of previous window. Approximates sliding log without storing every timestamp.
- ✅ Good accuracy, low memory — **most production systems use this**

### 3.4 Token Bucket
- Bucket holds tokens (capacity = burst limit). Tokens refill at fixed rate. Each request consumes 1 token. No token → reject/queue.
- ✅ Allows bursts naturally, smooth refill, industry favorite (AWS, Stripe use variants)
- Used by: `express-rate-limit`, `rate-limiter-flexible`

### 3.5 Leaky Bucket
- Requests enter a queue (bucket); processed ("leak out") at a constant rate. Overflow = rejected.
- ✅ Smooths out traffic to a constant outflow rate (good for protecting downstream systems)
- ❌ Doesn't allow bursts like token bucket does

### Quick Comparison Table

| Algorithm | Memory | Accuracy | Allows Burst | Common Use |
|---|---|---|---|---|
| Fixed Window | Low | Low (edge bug) | Yes (unintended) | Simple APIs |
| Sliding Log | High | Perfect | No | Small-scale, precise needs |
| Sliding Counter | Low | High | Slight | Most modern APIs |
| Token Bucket | Low | High | **Yes (intended)** | Public APIs, payment gateways |
| Leaky Bucket | Low | High | No | Queue-based systems, protecting DB |

---

## 4. Where to Implement (Layered Defense)

```
Client (browser/app)
   ↓
CDN / Reverse Proxy (Cloudflare, Nginx) ── rate limit by IP, cheap & early
   ↓
API Gateway (Kong, AWS API Gateway) ── per API key/plan
   ↓
Express Middleware (YOUR CODE) ── per route, per user, business logic
   ↓
Database (MongoDB) ── connection pooling, query throttling (last resort)
```

👉 **As a MERN dev, your main job = Express middleware layer.** Infra layers are bonus knowledge for interviews.

---

## 5. Implementing in Express (Node.js)

### 5.1 Quick Win — `express-rate-limit` (single server / in-memory)

```bash
npm install express-rate-limit
```

```js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  standardHeaders: true,     // return RateLimit-* headers
  legacyHeaders: false,      // disable X-RateLimit-* (old headers)
  message: 'Too many requests, please try again later.',
  keyGenerator: (req) => req.ip, // default; customize for user-based limiting
});

app.use('/api/', limiter); // apply globally to /api routes
```

**Stricter limiter for sensitive routes (login, OTP, signup):**
```js
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,                    // only 5 attempts
  message: 'Too many login attempts, try again in 10 minutes.',
});

app.post('/api/auth/login', authLimiter, loginController);
```

⚠️ **Catch:** `express-rate-limit`'s default store is **in-memory** → counters reset on server restart and **don't sync across multiple Node instances** (PM2 cluster mode, multiple containers, load-balanced servers). For production with >1 instance → use Redis store.

### 5.2 Production-Grade — Redis-backed (multi-instance safe)

```bash
npm install rate-limiter-flexible ioredis
```

```js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

const redisClient = new Redis({ host: '127.0.0.1', port: 6379 });

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10,     // 10 requests
  duration: 1,    // per 1 second  → token bucket style
  blockDuration: 60, // block for 60s if exceeded (optional)
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ message: 'Too many requests' });
    });
};

app.use(rateLimiterMiddleware);
```

**Why Redis?** It's a shared, fast, in-memory store all your Node instances can read/write to — solving the "multiple servers, one counter" problem. This is the **industry-standard approach**.

### 5.3 Per-User Rate Limiting (not just IP)

```js
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => {
    // prefer logged-in user ID over IP (handles shared IPs / NAT / VPN better)
    return req.user?.id || req.ip;
  },
});
```

> 💡 IP-based limiting alone is weak: many users share one IP (corporate NAT, mobile carriers), and attackers rotate IPs easily. **Combine IP + user ID + API key** where possible.

### 5.4 Tiered / Plan-based Limiting (SaaS pattern)

```js
const getLimitForPlan = (plan) => ({ free: 50, pro: 1000, enterprise: 10000 }[plan] || 50);

app.use('/api/', (req, res, next) => {
  const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 day
    max: () => getLimitForPlan(req.user?.plan),
    keyGenerator: (req) => req.user?.id,
  });
  limiter(req, res, next);
});
```

---

## 6. MongoDB-Based Rate Limiting (no Redis available)

Useful for small apps where adding Redis is overkill. Store a counter doc per key with TTL index.

```js
// Schema
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., `user:123` or `ip:1.2.3.4`
  count: { type: Number, default: 1 },
  expiresAt: { type: Date, required: true },
});
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete (TTL index)
const RateLimit = mongoose.model('RateLimit', rateLimitSchema);

// Middleware
async function mongoRateLimiter(req, res, next) {
  const key = `ip:${req.ip}`;
  const windowMs = 60 * 1000;
  const max = 20;

  const record = await RateLimit.findOne({ key });

  if (!record) {
    await RateLimit.create({ key, count: 1, expiresAt: new Date(Date.now() + windowMs) });
    return next();
  }

  if (record.count >= max) {
    return res.status(429).json({ message: 'Too many requests' });
  }

  record.count += 1;
  await record.save();
  next();
}
```

⚠️ Slower than Redis (disk-backed, extra round trips) — fine for low-medium traffic, **not ideal for high QPS** auth endpoints.

---

## 7. HTTP Standards You Should Know

**Status code:** `429 Too Many Requests`

**Response headers (IETF draft standard — `standardHeaders: true` in express-rate-limit):**
```
RateLimit-Limit: 100
RateLimit-Remaining: 42
RateLimit-Reset: 1719600000
Retry-After: 120
```

**Sample 429 response body:**
```json
{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Try again in 2 minutes.",
  "retryAfter": 120
}
```

👉 Always send `Retry-After` — well-behaved clients (and your own React frontend) can use it to back off automatically.

---

## 8. Frontend (React) Side — Handling 429s Gracefully

```js
async function apiCall(url, options) {
  const res = await fetch(url, options);

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || 5;
    throw new RateLimitError(`Rate limited. Retry after ${retryAfter}s`);
  }
  return res.json();
}
```

- Show a toast: "You're doing that too fast — try again in Xs"
- Implement **exponential backoff** for retries in polling/auto-refresh logic
- **Debounce/throttle** search-as-you-type or button-mash actions on the client too (reduces load before it even hits your limiter) — use `lodash.debounce`

---

## 9. Common Real-World Use Cases (interview favorites)

| Scenario | Strategy |
|---|---|
| Login endpoint | Low limit (5/10min) per IP **and** per username, to stop brute force/credential stuffing |
| OTP / forgot-password | Very strict (3/hour) per phone/email — prevent SMS-bombing & cost abuse |
| Public search API | Token bucket, moderate burst allowed |
| Paid API (SaaS) | Per-API-key, tiered by plan, daily + per-second limits combined |
| File upload endpoint | Limit by size/time combo, not just count |
| Webhooks you expose | Limit by sender to avoid one partner overwhelming you |
| GraphQL APIs | Rate limit by **query cost/complexity**, not just request count (a single expensive query ≠ a simple one) |

---

## 10. Best Practices Checklist

- ✅ Use **Redis** (or similar shared store) once you have >1 server instance
- ✅ Apply **different limits per route** — auth/payment routes much stricter than read-only GETs
- ✅ Limit by **user ID** when authenticated, fall back to IP for anonymous
- ✅ Always return `429` + `Retry-After` header — don't just hang or silently drop
- ✅ Log/alert when limits are hit repeatedly (signal of attack or a bug in a client)
- ✅ Combine with **CAPTCHA** after N failed attempts on sensitive routes
- ✅ Rate limit at **multiple layers** (CDN + gateway + app) — defense in depth
- ✅ Document your limits in API docs (devs hate surprise 429s)
- ✅ Use **sliding window or token bucket** in production, avoid naive fixed-window for anything security-critical
- ✅ Test behind load (simulate concurrent requests) — race conditions in counters are real

---

## 11. Common Pitfalls (things that bite people)

- ❌ Using in-memory store (`express-rate-limit` default) behind a load balancer with multiple instances → limits don't actually work, each instance has its own counter
- ❌ Rate limiting only by IP → breaks for users behind shared/corporate NAT, and is trivially bypassed via VPN/proxy rotation
- ❌ Forgetting rate limiting on **password reset / OTP** routes — classic vulnerability
- ❌ Setting limits so strict that legitimate burst usage (e.g., a page loading 10 parallel API calls) gets blocked
- ❌ Not distinguishing between **read** (GET, cheap) and **write** (POST/PUT, expensive) — should have different limits
- ❌ No monitoring → you won't know your rate limiter is even working until an incident
- ❌ Counting failed requests (4xx/5xx) same as successful ones in some contexts where it shouldn't matter (or vice versa, e.g., login failures *should* count toward lockout)

---

## 12. Testing Rate Limits

```bash
# quick manual test with curl loop
for i in {1..20}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/test; done
```

```js
// Jest/Supertest example
test('blocks after exceeding limit', async () => {
  for (let i = 0; i < 5; i++) await request(app).get('/api/login');
  const res = await request(app).get('/api/login');
  expect(res.status).toBe(429);
});
```

Tools for load-testing: **k6**, **Artillery**, **Apache Bench (ab)**.

---

## 13. One-Line Mental Model (for fast recall)

> **"Token bucket lets you burst, leaky bucket forces a steady drip, fixed window is simple but leaky at edges, sliding window fixes that edge leak, and you need Redis the moment you have more than one server."**

---

## 14. Quick Interview Answers

**Q: How would you rate limit a login API?**
A: Per-IP **and** per-username combined limiter, strict (~5 attempts/10 min), Redis-backed for multi-instance, return 429 + Retry-After, optionally trigger CAPTCHA/account lockout after repeated failures.

**Q: Difference between throttling and rate limiting?**
A: Rate limiting **rejects** excess requests (429); throttling **delays/queues** them to smooth out the rate instead of dropping.

**Q: Why not just use in-memory counters in production?**
A: Doesn't scale across multiple server instances/processes (PM2 cluster, Kubernetes pods) — each has its own memory, so the real limit becomes `max × number_of_instances`. Use Redis or another shared store.

**Q: How do you rate limit by something other than IP?**
A: Custom `keyGenerator` — use authenticated user ID, API key, or a composite key (`userId:route`) depending on what you're protecting.

---

## 15. Libraries Cheat Sheet

| Library | Best For |
|---|---|
| `express-rate-limit` | Quick setup, single instance or small apps |
| `rate-limiter-flexible` | Production, Redis/Mongo/cluster support, token bucket |
| `express-slow-down` | Throttling (delay) instead of rejecting |
| Nginx `limit_req` | Edge/infra-level limiting before requests hit Node at all |
| Cloudflare Rate Limiting Rules | DDoS protection at the CDN edge, zero app code needed |

---
*End of notes — review section 13 & 14 right before an interview for max ROI.*
