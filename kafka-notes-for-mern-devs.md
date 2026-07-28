# Kafka — Quick Recall Notes (for MERN Developers)

> Goal: skim this in 15-20 min and recall everything. Written using Node.js/Express/MongoDB analogies you already know.

---

## 1. What is Kafka, really?

Kafka is a **distributed event streaming platform**. Think of it as a super-scalable, persistent, append-only **message queue / pub-sub system** — but way more powerful than Redis Pub/Sub or a simple Bull/BullMQ job queue.

**MERN analogy:**
- Redis Pub/Sub = fire-and-forget, no replay, no persistence.
- Kafka = like a **Git log of events** — append-only, ordered, replayable, persisted to disk, and multiple "readers" can read at their own pace without affecting each other.

**Why it exists:** When you have multiple services (microservices) that need to communicate asynchronously and reliably — without one service calling another's REST API directly (tight coupling) — Kafka decouples producers and consumers.

---

## 2. Core Concepts (the vocabulary)

| Kafka Term | What it means | MERN equivalent |
|---|---|---|
| **Broker** | A Kafka server that stores data | Like a MongoDB node |
| **Cluster** | Group of brokers working together | Like a MongoDB replica set |
| **Topic** | A named stream/category of messages (e.g. `order-created`) | Like a MongoDB collection name, or an event name in EventEmitter |
| **Partition** | A topic is split into partitions for parallelism | Like sharding a collection |
| **Producer** | App that sends/writes messages to a topic | `res.send()` but for events — your Express service pushing data out |
| **Consumer** | App that reads messages from a topic | An Express route handler, but triggered by events instead of HTTP |
| **Consumer Group** | A group of consumers sharing the work of reading a topic | Like a worker pool (PM2 cluster mode) |
| **Offset** | A pointer/index of a message's position in a partition | Like a MongoDB `_id` or array index — tracks "how far you've read" |
| **Zookeeper / KRaft** | Manages cluster metadata, leader election (older Kafka used Zookeeper, modern Kafka uses built-in KRaft) | Like MongoDB's config servers in a sharded cluster |
| **Message/Record** | The actual data unit sent — has a key, value, timestamp, headers | Like a JSON document |
| **Schema Registry** | (Optional, often with Avro/Protobuf) enforces message structure | Like a Mongoose schema, but for events |

---

## 3. The Mental Model

```
Producer → writes to → Topic (split into Partitions) → read by → Consumer Group
```

- A **topic** is split into **partitions** for scalability (parallel reads/writes).
- Each message in a partition gets an **offset** (incrementing ID).
- Messages within a partition are **strictly ordered**. Across partitions, no guaranteed order.
- Kafka **does not delete messages after consumption** (unlike RabbitMQ/SQS) — messages persist based on a retention policy (e.g., 7 days), so multiple consumers can replay/re-read.

```
Topic: "order-created"
 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Partition 0 │ │ Partition 1 │ │ Partition 2 │
 │ [m0,m1,m2..]│ │ [m0,m1,m2..]│ │ [m0,m1,m2..]│
 └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 4. Producers — How sending works

- Producer decides which **partition** a message goes to, usually via a **key** (e.g., `userId`). Same key → always same partition → guarantees order for that key.
- No key → round-robin across partitions (no order guarantee).

```js
// Example using kafkajs (most popular Node.js client)
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-mern-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

async function sendOrderEvent(order) {
  await producer.connect();
  await producer.send({
    topic: 'order-created',
    messages: [
      { key: order.userId, value: JSON.stringify(order) },
    ],
  });
}
```

**Delivery guarantees (acks):**
- `acks: 0` — fire and forget (fast, risky)
- `acks: 1` — leader broker confirms (balanced)
- `acks: -1 / 'all'` — all in-sync replicas confirm (safest, slowest)

---

## 5. Consumers — How reading works

- Consumers belong to a **consumer group** (`groupId`).
- Kafka guarantees each **partition** is read by only **one consumer within a group** at a time → enables horizontal scaling (add more consumers = more parallelism, up to the number of partitions).
- Multiple **different groups** can independently read the same topic (like multiple services subscribing to the same event).

```js
const consumer = kafka.consumer({ groupId: 'email-service' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-created', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`Sending confirmation email for order ${order.id}`);
    },
  });
}
```

**Key idea:** If you have 3 partitions and 3 consumers in the same group, each consumer handles 1 partition. Add a 4th consumer → it sits idle (more consumers than partitions = wasted).

---

## 6. Why use Kafka instead of REST calls between services?

| Direct REST calls (microservice A → B) | Kafka (A → topic → B) |
|---|---|
| Tight coupling — A must know B's URL | Decoupled — A doesn't know who consumes |
| If B is down, request fails | B can be down; message waits in Kafka until B is back |
| Synchronous, blocking | Asynchronous, non-blocking |
| Hard to add a 3rd service listening to the same event | Just add another consumer group |
| No replay | Can replay old events (e.g., rebuild a cache) |

**Classic MERN/microservices use case:**
```
Order Service → publishes "order-created" event
   ├── Email Service (consumer group: email) → sends confirmation email
   ├── Inventory Service (consumer group: inventory) → reduces stock
   └── Analytics Service (consumer group: analytics) → logs event
```
All three react independently, in parallel, without Order Service knowing/calling them directly.

---

## 7. Common Use Cases

- Event-driven microservices communication (as above)
- Activity/audit logging (user actions, clickstreams)
- Real-time analytics pipelines
- Log aggregation (centralizing logs from many services)
- Decoupling a monolith before microservices migration
- Powering "outbox pattern" for reliable DB + event consistency
- Real-time notifications/feeds (similar to how you might use Socket.io, but for backend-to-backend, not backend-to-browser)

**Note:** Kafka is NOT typically used to push events directly to the browser. You'd still use WebSockets/Socket.io for that — Kafka feeds the backend service, which then emits via Socket.io to the client.

---

## 8. Node.js Ecosystem (what you'd actually use)

| Library | Purpose |
|---|---|
| `kafkajs` | Most popular, pure JS Kafka client (no native deps) — **recommended starting point** |
| `node-rdkafka` | Wraps C++ librdkafka, faster but needs native build tools |
| Confluent Cloud / AWS MSK | Managed Kafka (avoid running Kafka yourself in dev/prod) |
| Docker Compose | Easiest way to run Kafka locally for learning |

**Quick local setup (Docker):**
```yaml
# docker-compose.yml (Kafka in KRaft mode, no Zookeeper needed)
services:
  kafka:
    image: bitnami/kafka:latest
    ports:
      - "9092:9092"
    environment:
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
```

---

## 9. Important Gotchas / Interview Points

- Kafka ≠ traditional message queue (RabbitMQ/SQS). Messages **aren't removed** after consumption — they expire based on **retention period**, not consumption.
- Ordering is guaranteed **only within a partition**, not across the whole topic.
- More partitions = more parallelism, but also more overhead and complexity in ordering.
- Kafka is **at-least-once delivery by default** — your consumer logic must be **idempotent** (handle duplicate messages safely), similar to how you'd design idempotent REST endpoints (e.g., using a unique `orderId` check before processing).
- Kafka stores data on disk (not just memory) — that's part of why it's durable and can replay history.
- Rebalancing: when a consumer joins/leaves a group, partitions get reassigned — can cause brief processing pauses.
- Kafka does NOT have built-in request-response (it's one-way streaming); for request-response patterns you typically still use REST/gRPC, with Kafka for the async/event side.

---

## 10. One-Sentence Summary (for fast recall)

> **Kafka is a durable, ordered, replayable event log that lets multiple independent services publish and subscribe to streams of events asynchronously, at scale — replacing tightly-coupled REST calls between microservices with decoupled producer/consumer messaging.**

---

## 11. Suggested Practice Project (to cement it)

Build a tiny MERN + Kafka demo:
1. Express API: `POST /orders` → saves to MongoDB → produces `order-created` event to Kafka.
2. A separate Node consumer service (`email-service`) listens to `order-created` → logs "email sent".
3. Another consumer (`inventory-service`) listens to the same topic → logs "stock updated".
4. Run both consumers, create an order, watch both react independently in their own terminal logs.

This single exercise covers: producer, topic, partition basics, consumer groups, and decoupled architecture — the 80% of Kafka you'll actually use as a MERN dev.
