# Redis Notes for a Full Stack MERN Developer

---

# 1. What is Redis?

Redis = **Remote Dictionary Server**

It is an **in-memory database** used mainly for:

* Caching
* Session storage
* Real-time systems
* Rate limiting
* Queues
* Pub/Sub messaging

Think of Redis as:

> “Ultra-fast temporary storage sitting between your backend and database.”

---

# 2. Why MERN Developers Need Redis

Without Redis:

```text
Client → Express → MongoDB
```

Every request hits MongoDB.

With Redis:

```text
Client → Express → Redis Cache → MongoDB
```

Most repeated requests become insanely fast.

---

# 3. Core Advantages

| Feature             | Why It Matters                  |
| ------------------- | ------------------------------- |
| RAM-based           | Very fast                       |
| Key-value structure | Simple                          |
| Expiration support  | Perfect for tokens/cache        |
| Pub/Sub             | Real-time apps                  |
| Data structures     | More powerful than normal cache |
| Lightweight         | Easy integration                |

---

# 4. Real MERN Use Cases

## Most Important Ones

### 1. API Caching

Reduce MongoDB load.

### 2. Session Storage

Store login sessions.

### 3. JWT Blacklisting

Logout support for JWT auth.

### 4. Rate Limiting

Prevent spam attacks.

### 5. Queues

Background jobs.

### 6. Pub/Sub

Chats + notifications.

---

# 5. Installation

## Ubuntu

```bash
sudo apt install redis-server
```

## Mac

```bash
brew install redis
```

## Start Redis

```bash
redis-server
```

## Open CLI

```bash
redis-cli
```

## Test

```bash
PING
```

Output:

```bash
PONG
```

---

# 6. Redis Mental Model

Redis stores:

```text
KEY → VALUE
```

Example:

```bash
SET name "Dileep"
GET name
```

---

# 7. Basic Commands

## Set Value

```bash
SET user "dileep"
```

## Get Value

```bash
GET user
```

## Delete

```bash
DEL user
```

## Check Exists

```bash
EXISTS user
```

## Expire Key

```bash
EXPIRE user 60
```

Meaning:

```text
Delete after 60 sec
```

## TTL

```bash
TTL user
```

---

# 8. Redis Data Types (VERY IMPORTANT)

Most beginners only learn strings.

Big mistake.

Redis becomes powerful because of its data structures.

---

# 9. Strings

Most common.

```bash
SET name "John"
GET name
```

Used for:

* Tokens
* Cache
* Counters
* JSON strings

---

# 10. Hashes

Like JavaScript objects.

```bash
HSET user:1 name John age 22
```

Get all:

```bash
HGETALL user:1
```

Perfect for:

* User profiles
* Settings
* Metadata

---

# 11. Lists

Ordered collections.

```bash
LPUSH tasks "task1"
RPUSH tasks "task2"
```

Get all:

```bash
LRANGE tasks 0 -1
```

Used for:

* Queues
* Notifications
* Activity logs

---

# 12. Sets

Unique values only.

```bash
SADD skills react node mongodb
```

Get:

```bash
SMEMBERS skills
```

Used for:

* Tags
* Followers
* Unique visitors

---

# 13. Sorted Sets (VERY IMPORTANT)

Stores score + value.

```bash
ZADD leaderboard 100 player1
```

Get:

```bash
ZRANGE leaderboard 0 -1 WITHSCORES
```

Used for:

* Rankings
* Leaderboards
* Trending posts

---

# 14. Installing Redis in Node.js

Install package:

```bash
npm install redis
```

---

# 15. Connecting Redis with Express

```js
const redis = require("redis");

const client = redis.createClient();

client.on("error", err => {
  console.log(err);
});

async function connectRedis() {
  await client.connect();
}

connectRedis();
```

---

# 16. Most Important MERN Concept — Caching

This is where Redis becomes valuable.

---

# 17. Problem Without Caching

```text
Every request → MongoDB
```

Problems:

* Slow
* Expensive
* DB overload

---

# 18. Caching Flow

```text
Client Request
      ↓
Check Redis
      ↓
Cache Hit? → Return Fast
      ↓
Cache Miss
      ↓
MongoDB Query
      ↓
Store in Redis
      ↓
Return Response
```

---

# 19. Example — API Caching

```js
app.get("/users", async (req, res) => {

  const cachedUsers = await client.get("users");

  if (cachedUsers) {
    return res.json(JSON.parse(cachedUsers));
  }

  const users = await User.find();

  await client.set(
    "users",
    JSON.stringify(users),
    {
      EX: 60
    }
  );

  res.json(users);
});
```

---

# 20. Understanding EX

```js
EX: 60
```

Means:

```text
Expire after 60 seconds
```

Critical for cache freshness.

---

# 21. Cache Invalidation (IMPORTANT)

Biggest beginner mistake:

> “I cached data but forgot to update cache.”

Example:

If user changes profile:

* Update MongoDB
* Delete Redis cache

```js
await client.del("users");
```

---

# 22. Session Storage

Without Redis:

```text
Sessions stored in server memory
```

Problem:

* Not scalable
* Lost after restart

With Redis:

```text
Shared session storage
```

Perfect for:

* Multi-server apps
* Production systems

---

# 23. Packages for Sessions

```bash
npm install express-session connect-redis
```

---

# 24. JWT Blacklisting

JWT problem:

```text
Cannot force logout easily
```

Redis solution:

Store invalid tokens.

Example:

```bash
SET blacklist:token123 true EX 3600
```

During auth:

```js
const blocked = await client.get(`blacklist:${token}`);
```

If exists:

```text
Reject token
```

---

# 25. Rate Limiting (EXTREMELY IMPORTANT)

Protects APIs from:

* Spam
* Bots
* DDoS
* Brute force attacks

---

# 26. Rate Limiting Logic

Each request:

```text
Increase counter
```

If counter exceeds limit:

```text
Block request
```

---

# 27. Example

```js
const requests = await client.incr(ip);

if (requests === 1) {
  await client.expire(ip, 60);
}

if (requests > 100) {
  return res.status(429).json({
    message: "Too many requests"
  });
}
```

Meaning:

```text
100 requests per minute
```

---

# 28. Pub/Sub (Real-Time Systems)

Redis supports messaging.

Publisher:

```bash
PUBLISH chat "Hello"
```

Subscriber:

```bash
SUBSCRIBE chat
```

---

# 29. MERN Pub/Sub Use Cases

* Chat apps
* Notifications
* Live sports
* Multiplayer games
* Real-time dashboards

---

# 30. Queues & Background Jobs

Heavy tasks should not block APIs.

Wrong:

```text
API waits for email sending
```

Correct:

```text
API pushes job to queue
```

Worker handles later.

---

# 31. Popular Queue Libraries

## BullMQ

Most popular.

```bash
npm install bullmq
```

---

# 32. Queue Flow

```text
Client Request
      ↓
Add Job to Redis Queue
      ↓
Worker Processes Job
```

---

# 33. Queue Use Cases

* Email sending
* Video compression
* Payment processing
* Notifications
* Report generation

---

# 34. Redis Pub/Sub vs Queue

## Pub/Sub

Real-time messaging.

If subscriber offline:

```text
Message lost
```

---

## Queue

Reliable processing.

Jobs remain until completed.

---

# 35. Redis Persistence

Redis is RAM-based.

Data may disappear.

Redis supports persistence:

## RDB

Snapshot backups.

## AOF

Logs every write.

---

# 36. Important Redis Concepts

## Cache Hit

Data found in Redis.

## Cache Miss

Need MongoDB query.

## Eviction

Redis deletes old keys when memory full.

---

# 37. Common Redis Patterns

---

## Cache Aside Pattern

Most common.

Flow:

```text
Check cache
↓
If missing → DB
↓
Store in cache
```

---

## Write Through Cache

Update cache + DB together.

---

# 38. Common Redis Key Naming

VERY IMPORTANT.

Bad:

```text
user
```

Good:

```text
user:1
user:profile:1
post:comments:22
session:abc123
```

---

# 39. Production Best Practices

## Always Use Expiry

Bad:

```text
Permanent cache
```

Good:

```text
Temporary cache
```

---

## Don't Cache Everything

Cache:

* Frequent reads
* Expensive queries

Do NOT cache:

* Highly dynamic data

---

## Keep Keys Organized

Use namespaces.

---

# 40. Redis vs MongoDB

| Redis          | MongoDB        |
| -------------- | -------------- |
| RAM-based      | Disk-based     |
| Ultra-fast     | Slower         |
| Temporary data | Permanent data |
| Cache layer    | Main database  |
| Key-value      | Document DB    |

---

# 41. Redis Architecture in MERN

```text
Frontend (React)
        ↓
Backend (Node/Express)
        ↓
Redis Cache Layer
        ↓
MongoDB
```

---

# 42. Interview Questions (VERY IMPORTANT)

## Why Redis is faster?

Because it stores data in RAM.

---

## Why use Redis with MongoDB?

To reduce database load and improve response speed.

---

## Difference between Redis and MongoDB?

Redis = cache/in-memory
MongoDB = primary persistent database

---

## What is cache invalidation?

Removing outdated cache.

---

## What is TTL?

Time To Live.

Automatic key expiration.

---

## What is Pub/Sub?

Messaging system between services.

---

## What are Redis queues?

Background job processing system.

---

# 43. Biggest Beginner Mistakes

## Mistake 1

Using Redis as primary DB without understanding persistence.

---

## Mistake 2

Caching everything blindly.

---

## Mistake 3

Forgetting cache invalidation.

This creates stale data bugs.

---

## Mistake 4

Not setting expiry.

Memory fills fast.

---

# 44. What You Actually Need as MERN Developer

You do NOT need advanced Redis internals initially.

Master these:

✅ Caching
✅ Rate limiting
✅ Sessions
✅ JWT blacklist
✅ Queues
✅ Pub/Sub basics

That alone covers most real-world MERN jobs.

---

# 45. Real Production Stack Example

```text
React Frontend
      ↓
Express API
      ↓
Redis
   - Cache
   - Sessions
   - Queue
   - Rate Limiting
      ↓
MongoDB
```

---

# 46. Redis Learning Priority (IMPORTANT)

Learn in this order:

1. Basic commands
2. Node.js integration
3. Caching
4. Expiry/TTL
5. Rate limiting
6. Sessions
7. Pub/Sub
8. Queues
9. Advanced scaling

Most people try advanced stuff too early.

---

# 47. One-Line Revision Sheet

## Redis = ultra-fast temporary storage for performance and real-time systems.

### Remember:

* RAM = fast
* Cache reduces DB load
* TTL prevents stale data
* Pub/Sub = messaging
* Queue = background jobs
* Sorted Sets = rankings
* Hashes = objects

---

# 48. Final Quick Recall

## Redis is mainly used in MERN for:

✅ Faster APIs
✅ Reduced MongoDB load
✅ Authentication/session management
✅ Real-time communication
✅ Background jobs
✅ Security/rate limiting

---

# 49. What Actually Matters in Real Projects

Most tutorials waste time explaining theory forever.

Real companies care about:

* Can you cache APIs?
* Can you prevent spam?
* Can you build scalable auth?
* Can you use queues?
* Can you optimize performance?

That’s where Redis matters.
