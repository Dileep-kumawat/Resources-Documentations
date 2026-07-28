# Microservices — Quick Recall Notes (for MERN Devs)

## 1. What Microservices Actually Are

A microservices architecture splits one big app into many small, independently deployable services, each owning **one business capability** (e.g., User Service, Order Service, Payment Service) and **its own database**.

Compare to what you already know:

| Monolith (typical MERN app) | Microservices |
|---|---|
| One Express server, one repo | Many small Express/Node servers, often multiple repos |
| One MongoDB database for everything | Each service has its own DB (could be Mongo, Postgres, Redis, etc.) |
| One deployment = whole app redeploys | Deploy each service independently |
| Function calls between modules | Network calls (HTTP/gRPC/message queue) between services |
| Scale the whole app together | Scale only the service that needs it |

**Mental shortcut:** if your MERN app's `routes/` and `models/` folders got so big you wanted to split them into separate repos with separate servers and separate databases — that instinct *is* microservices.

---

## 2. Why Bother (and Why Not)

**Pros**
- Independent deployment — ship Order Service without touching Auth Service
- Independent scaling — scale only the heavy-traffic service
- Tech flexibility — one service can be Node, another Python, another Go
- Fault isolation — one service crashing doesn't (ideally) kill the whole app
- Smaller codebases = easier for teams to own a slice

**Cons (the real cost)**
- Network calls replace function calls → slower, less reliable, more error handling
- Distributed data → no single transaction across services (no more one Mongoose `.save()` across collections)
- Harder local dev — need to run many services together
- Harder debugging — a single user request may touch 5 services
- Operational overhead — needs Docker, orchestration, monitoring, API gateway, etc.

**Rule of thumb:** Don't start a project as microservices. Start as a monolith, split out services later when a clear bottleneck or team boundary appears ("monolith-first").

---

## 3. Core Building Blocks

### 3.1 Service
A small Node/Express (or any stack) app exposing an API for one bounded responsibility. Example split for an e-commerce MERN app:
- `auth-service` — login, signup, JWT issuing
- `user-service` — profile, preferences
- `product-service` — catalog, inventory
- `order-service` — cart, checkout, order history
- `payment-service` — payment processing
- `notification-service` — emails/SMS/push

Each is a standalone Node project with its own `package.json`, own DB, own port, own repo (or folder in a monorepo).

### 3.2 Database per Service
No shared MongoDB cluster used directly by multiple services. Each service owns its data and exposes it only through its API.

**Why:** prevents tight coupling at the DB schema level (the #1 way "microservices" silently turn back into a monolith).

**Consequence:** if Order Service needs product info, it can't just query Product Service's MongoDB — it must call Product Service's API (or use cached/replicated data).

### 3.3 API Gateway
A single entry point that routes client requests to the right service, instead of the frontend calling 6 different services directly.

```
React App → API Gateway → auth-service
                        → user-service
                        → product-service
                        → order-service
```

Common tools: **Express itself** (as a simple reverse proxy with `http-proxy-middleware`), **Nginx**, **Kong**, **AWS API Gateway**.

Gateway also handles: auth token verification, rate limiting, request logging, response aggregation.

### 3.4 Service-to-Service Communication

**Synchronous (request waits for response)**
- REST over HTTP (most familiar — just `axios`/`fetch` calling another service's endpoint)
- gRPC (faster, typed, more setup)

**Asynchronous (fire-and-forget / event-driven)**
- Message queues / brokers: **RabbitMQ**, **Kafka**, **Redis Pub/Sub**, **AWS SQS**
- A service publishes an event ("OrderCreated"), other services subscribe and react, without the publisher waiting for them

**When to use which:**
- Need an immediate answer (e.g., "is this user logged in?") → synchronous REST
- Just need to notify / trigger something that can happen later (e.g., "send confirmation email after order") → async message queue

### 3.5 Service Discovery
In a monolith you `import` a module. In microservices, services need to find each other's network address. Options:
- Hardcoded URLs / env vars (fine for small setups)
- DNS-based discovery (Docker Compose service names, Kubernetes service names)
- A registry tool (Consul, Eureka) for larger dynamic setups

### 3.6 Containerization (Docker)
Each service gets packaged into its own **Docker container** so it runs the same way everywhere (your laptop, CI, production).

```dockerfile
# Typical Node service Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
```

**Docker Compose** runs multiple services + their DBs together locally:

```yaml
services:
  auth-service:
    build: ./auth-service
    ports: ["4001:4000"]
  product-service:
    build: ./product-service
    ports: ["4002:4000"]
  mongo:
    image: mongo
    ports: ["27017:27017"]
```

### 3.7 Orchestration (Kubernetes)
Once you have many containers in production, you need something to deploy, restart, scale, and load-balance them — that's **Kubernetes (K8s)**. Not needed to *learn* microservices conceptually, but it's the standard production answer. Know the terms: Pod, Deployment, Service, Ingress.

---

## 4. Data & Transactions — The Hard Part

In MERN monolith land, you might do a Mongoose transaction across two collections. In microservices, **Order Service** and **Payment Service** have separate DBs — there's no single transaction.

**Patterns to know (just the names + idea):**

- **Saga Pattern** — a sequence of local transactions, each service does its part and emits an event; if a later step fails, compensating events undo earlier steps (e.g., OrderCreated → PaymentFailed → OrderCancelled).
- **Eventual Consistency** — accept that data across services will sync up *eventually*, not instantly. (E.g., Product Service's "in stock" count may lag a few seconds behind reality.)
- **CQRS (Command Query Responsibility Segregation)** — separate the "write" model from the "read" model; often paired with event sourcing in complex systems. (Good to recognize the term, not essential for most MERN-scale projects.)

---

## 5. Auth in Microservices

You can't have every service re-check credentials against a central session store on every call (too chatty, and Auth Service becomes a bottleneck/single point of failure).

**Standard approach:** JWT.
1. `auth-service` verifies login, issues a signed JWT.
2. Client sends JWT on every request (just like in a monolith).
3. API Gateway (or each service) verifies the JWT signature locally — no network call back to auth-service needed for every request, since the token is self-contained.
4. Services trust the JWT's claims (user id, role) once signature is valid.

This is the same JWT pattern you already use in MERN — just verified at the gateway/service level instead of one Express app.

---

## 6. Observability — How You Debug This

A single user click might hit 4 services. You need:
- **Centralized logging** — all services ship logs to one place (e.g., ELK stack: Elasticsearch + Logstash + Kibana, or simpler: just a shared log drain)
- **Distributed tracing** — a `trace-id`/`correlation-id` generated at the gateway, passed through every service call, so you can follow one request's full journey (tools: Jaeger, Zipkin, OpenTelemetry)
- **Health checks** — each service exposes `/health` so the orchestrator knows if it's alive
- **Metrics/monitoring** — Prometheus + Grafana to watch CPU, memory, request rates per service

**Practical habit to adopt now:** when calling another service, generate/forward a request ID in headers and log it everywhere. Saves hours later.

---

## 7. A Minimal Mental Walkthrough (MERN → Microservices)

Imagine splitting a MERN food-delivery app:

```
restaurant-service   (Express + MongoDB) → menu, restaurant data
order-service        (Express + MongoDB) → cart, order lifecycle
delivery-service      (Express + MongoDB) → rider assignment, tracking
notification-service (Express + Redis pub/sub) → push/SMS

API Gateway (Express + http-proxy-middleware or Nginx)
   ↕
React frontend (unchanged — still calls one base URL, the gateway)
```

Flow for "place an order":
1. React → Gateway → `order-service` (`POST /orders`)
2. `order-service` saves order, publishes `OrderCreated` event to message broker
3. `delivery-service` subscribes, assigns a rider
4. `notification-service` subscribes, sends confirmation SMS
5. `order-service` never waited on steps 3–4 — fully async

Your React code barely changes — it still just calls the Gateway's API like it called Express before. The complexity moves to the backend architecture.

---

## 8. Tooling Cheat Sheet for a MERN Dev Going Microservices

| Need | Tool (common choice) |
|---|---|
| Run multiple services locally | Docker Compose |
| Production orchestration | Kubernetes |
| API Gateway | Express + http-proxy-middleware, Nginx, Kong |
| Sync inter-service calls | REST (axios), gRPC |
| Async events | RabbitMQ, Kafka, Redis Pub/Sub |
| Auth | JWT (same as monolith), verified at gateway |
| Logging | ELK stack / simple shared logger |
| Tracing | OpenTelemetry, Jaeger |
| Service config | Environment variables, Consul/Vault for secrets |
| CI/CD per service | Separate pipelines per repo/service |

---

## 9. Common Pitfalls (Things That Bite Beginners)

- **Splitting too early** — premature microservices = "distributed monolith" (all the network overhead, none of the independence, because services still share a DB or deploy together).
- **Shared database between services** — defeats the entire point; couples services at the schema level.
- **Chatty synchronous calls** — Service A calls B calls C calls D synchronously = slow, fragile chain. Prefer async where possible.
- **No API versioning** — changing one service's API breaks others silently. Version your endpoints (`/v1/orders`).
- **Ignoring failure handling** — network calls fail. Always plan for timeouts, retries, circuit breakers (e.g., the `opossum` npm package for circuit breaking in Node).
- **No correlation IDs** — debugging becomes guesswork across logs from 6 services.

---

## 10. One-Paragraph Summary (For 30-Second Recall)

Microservices = breaking a MERN monolith into small, independently deployable Express services, each with its own database, communicating over the network (REST for sync needs, message queues like RabbitMQ/Kafka for async events) instead of in-process function calls. A gateway sits in front to route client requests so the React frontend still talks to one URL. JWT auth still works the same way, just verified at the gateway/service level. Docker packages each service; Kubernetes orchestrates them in production. The real cost is distributed data (no cross-service transactions — use sagas/eventual consistency) and debugging (need centralized logs, tracing, correlation IDs). Don't adopt this pattern until a monolith genuinely hits scaling/team-size pain — start monolith-first.

---

## 11. Recall Self-Test (Cover the Notes, Try Answering)

1. Why can't Order Service query Product Service's MongoDB directly?
2. When would you use a message queue instead of a direct REST call?
3. What's the API Gateway's job, and why does the frontend still feel unchanged?
4. How does JWT auth avoid making every service call back to auth-service?
5. Name the pattern for handling a multi-step transaction across services without 2PC.
6. What's a "distributed monolith" and how does it happen?
