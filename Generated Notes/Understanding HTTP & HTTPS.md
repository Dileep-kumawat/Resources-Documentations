# 1) What is HTTP?

## Definition

**HTTP (HyperText Transfer Protocol)** is the communication protocol used by browsers and servers to exchange web data.

Think:

> Browser asks → Server responds

Example:

```http
GET /index.html HTTP/1.1
Host: example.com
```

Server:

```http
HTTP/1.1 200 OK
Content-Type: text/html
```

---

# Core Idea

HTTP is:

* **Application layer protocol**
* Built on top of **TCP**
* Stateless by default

## Stateless Means

Server does NOT remember previous requests automatically.

So websites use:

* Cookies
* Sessions
* Tokens
  to remember users.

---

# HTTP Request Structure

## Request Contains

* Method
* URL
* Headers
* Body (optional)

Example:

```http
POST /login HTTP/1.1
Host: site.com
Content-Type: application/json

{
  "user":"abc",
  "pass":"123"
}
```

---

# HTTP Methods

| Method | Purpose             |
| ------ | ------------------- |
| GET    | Fetch data          |
| POST   | Send/create data    |
| PUT    | Replace data        |
| PATCH  | Update partial data |
| DELETE | Remove data         |

---

# HTTP Versions

---

## HTTP/1.0

### Features

* One request per connection
* Slow
* Connection closes after each request

Problem:
Too many TCP connections.

---

## HTTP/1.1

### Improvements

* Persistent connections (`keep-alive`)
* Better caching
* Host header mandatory

### Problem

Still suffers from:

* Head-of-line blocking

Meaning:
One slow request blocks others.

---

## HTTP/2

### Major Improvements

* Multiplexing
* Header compression
* Faster loading

## Multiplexing

Multiple requests over single TCP connection simultaneously.

Huge performance boost.

---

## HTTP/3

### Biggest Change

Uses **QUIC** instead of TCP.

QUIC works over UDP.

### Benefits

* Faster connection setup
* Better for unstable/mobile networks
* Reduced latency

---

# HTTP Versions Quick Recall

| Version  | Key Feature          |
| -------- | -------------------- |
| HTTP/1.0 | Separate connections |
| HTTP/1.1 | Keep-alive           |
| HTTP/2   | Multiplexing         |
| HTTP/3   | QUIC + UDP           |

---

# 2) HTTP Status Codes

These are server responses.

## Format

3-digit numbers.

---

# 1xx → Informational

| Code | Meaning  |
| ---- | -------- |
| 100  | Continue |

Rarely used directly.

---

# 2xx → Success

| Code | Meaning    |
| ---- | ---------- |
| 200  | OK         |
| 201  | Created    |
| 204  | No Content |

### Remember

* 200 → success with response
* 201 → resource created
* 204 → success but empty response

---

# 3xx → Redirection

| Code | Meaning            |
| ---- | ------------------ |
| 301  | Permanent redirect |
| 302  | Temporary redirect |
| 304  | Not Modified       |

### Important

304 helps caching.

Browser reuses old cached resource.

---

# 4xx → Client Errors

User/browser mistake.

| Code | Meaning            |
| ---- | ------------------ |
| 400  | Bad Request        |
| 401  | Unauthorized       |
| 403  | Forbidden          |
| 404  | Not Found          |
| 405  | Method Not Allowed |
| 429  | Too Many Requests  |

## Key Difference

### 401

Needs authentication.

### 403

Authenticated but access denied.

---

# 5xx → Server Errors

Server problem.

| Code | Meaning               |
| ---- | --------------------- |
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |
| 504  | Gateway Timeout       |

---

# Status Code Recall Trick

| Range | Meaning      |
| ----- | ------------ |
| 1xx   | Info         |
| 2xx   | Success      |
| 3xx   | Redirect     |
| 4xx   | Client issue |
| 5xx   | Server issue |

---

# 3) What is HTTPS?

## Definition

HTTPS =

> HTTP + SSL/TLS Encryption

It secures communication between:

* Browser
* Server

---

# Why HTTPS is Better than HTTP

HTTP sends data in plain text.

Anyone intercepting traffic can read:

* Passwords
* Messages
* Bank info

HTTPS encrypts everything.

---

# Problems with HTTP

Attackers on same network can:

* Read data
* Modify data
* Steal sessions

This is called:

* Sniffing
* Man-in-the-middle attack

---

# HTTPS Provides

| Feature        | Meaning                          |
| -------------- | -------------------------------- |
| Encryption     | Nobody can read data             |
| Integrity      | Data cannot be modified secretly |
| Authentication | Confirms real website            |

---

# Example

Without HTTPS:

```text
password = mypass123
```

Visible to attacker.

With HTTPS:

```text
ajshd8912hj12...
```

Encrypted garbage to attacker.

---

# 4) How HTTPS Provides Secure Connection

This is where most people memorize blindly without understanding.

Understand the flow.

---

# HTTPS Working Flow

## Step 1 — Client Connects

Browser contacts server.

---

## Step 2 — Server Sends SSL Certificate

Certificate contains:

* Public key
* Domain info
* Issued by Certificate Authority (CA)

---

## Step 3 — Browser Verifies Certificate

Checks:

* Trusted CA?
* Expired?
* Domain matches?

If valid → continue.

Otherwise browser shows warning.

---

## Step 4 — Session Key Creation

Browser generates:

* Symmetric session key

Encrypts it using:

* Server public key

Sends to server.

---

## Step 5 — Server Decrypts

Using private key.

Now both share same session key.

---

## Step 6 — Secure Communication Starts

Actual data encrypted using:

* Symmetric encryption

Because it's much faster.

---

# Important Understanding

HTTPS uses BOTH:

| Encryption Type | Purpose             |
| --------------- | ------------------- |
| Asymmetric      | Secure key exchange |
| Symmetric       | Fast data transfer  |

---

# Memory Shortcut

## HTTPS Logic

1. Verify server identity
2. Exchange secret key safely
3. Communicate using encrypted session

---

# 5) What is SSL/TLS?

## SSL

Secure Sockets Layer

Old security protocol.

Deprecated now.

---

# TLS

Transport Layer Security

Modern replacement for SSL.

People still say “SSL” casually even though TLS is used.

---

# Purpose of TLS

Provides:

* Encryption
* Integrity
* Authentication

for network communication.

---

# TLS Uses

* HTTPS
* Secure emails
* VPNs
* Messaging apps

---

# Encryption Types

---

## Symmetric Encryption

Same key for:

* Encrypting
* Decrypting

### Fast

Used for actual communication.

Example:

```text
AES
```

---

## Asymmetric Encryption

Uses:

* Public key
* Private key

### Slower

Used for secure key exchange.

Example:

```text
RSA
ECC
```

---

# Important Point

TLS does NOT encrypt entire internet magically.

It only encrypts:

* Data between endpoints.

---

# 6) Proxy and Reverse Proxy

This confuses many people because they memorize diagrams without understanding direction.

Focus on:

> WHO the proxy represents.

---

# Proxy Server

## Represents CLIENTS

Client sends request to proxy.

Proxy sends request to internet.

---

# Flow

```text
User → Proxy → Website
```

Website sees:

* Proxy IP
  NOT actual user IP.

---

# Why Use Proxy?

| Purpose      | Example                     |
| ------------ | --------------------------- |
| Hide user IP | Privacy                     |
| Filtering    | School/company restrictions |
| Caching      | Faster access               |

---

# Reverse Proxy

## Represents SERVER

Clients think they talk directly to server.

Actually:

```text
User → Reverse Proxy → Backend Servers
```

---

# Why Use Reverse Proxy?

| Purpose         | Benefit            |
| --------------- | ------------------ |
| Load balancing  | Distribute traffic |
| Security        | Hide backend       |
| SSL termination | Handle HTTPS       |
| Caching         | Faster responses   |

---

# Real Examples

| Tool       | Type              |
| ---------- | ----------------- |
| Squid      | Proxy             |
| Nginx      | Reverse proxy     |
| Cloudflare | Reverse proxy/CDN |

---

# Easy Recall

| Type          | Represents |
| ------------- | ---------- |
| Proxy         | Client     |
| Reverse Proxy | Server     |

---

# 7) How VPN Works

## VPN = Virtual Private Network

Creates encrypted tunnel between:

* Your device
* VPN server

---

# Normal Internet Flow

```text
You → ISP → Website
```

ISP can see:

* Websites visited
* Traffic metadata

---

# VPN Flow

```text
You → Encrypted Tunnel → VPN Server → Website
```

Website sees:

* VPN server IP

NOT your real IP.

---

# What VPN Helps With

| Use              | Explanation                   |
| ---------------- | ----------------------------- |
| Privacy          | Hides traffic from ISP        |
| Security         | Encrypts public WiFi traffic  |
| Geo restrictions | Access region-blocked content |
| IP masking       | Hide real IP                  |

---

# How Restricted Content Access Works

Suppose Netflix content only for US.

Using US VPN:

* Website thinks request comes from US.

Because:

* VPN server IP is US-based.

---

# Important Reality Check

VPN is NOT magical anonymity.

VPN provider itself can see traffic unless:

* End-to-end encryption exists (HTTPS).

Bad VPNs can log everything.

---

# VPN + HTTPS Together

| Technology | Protects Against             |
| ---------- | ---------------------------- |
| HTTPS      | Others between you and site  |
| VPN        | ISP/local network monitoring |

---

# 8) Difference Between TCP and UDP

This is foundational networking knowledge.

Most students memorize:

> TCP reliable, UDP fast

Too shallow. Understand WHY.

---

# TCP (Transmission Control Protocol)

## Features

* Connection-oriented
* Reliable
* Ordered delivery
* Error checking
* Retransmission

---

# TCP Working

Before sending data:

* Connection established

Using:

## 3-way handshake

```text
SYN
SYN-ACK
ACK
```

---

# TCP Guarantees

If packet lost:

* Resend it.

If packets arrive out of order:

* Reorder them.

---

# Downsides

More overhead.
Slower than UDP.

---

# TCP Used In

| Use Case      |
| ------------- |
| HTTP/HTTPS    |
| Email         |
| File transfer |
| Banking       |

Because reliability matters.

---

# UDP (User Datagram Protocol)

## Features

* Connectionless
* Faster
* No delivery guarantee
* No retransmission

---

# UDP Behavior

Just sends packets.

No checking whether:

* Arrived?
* Ordered?
* Lost?

---

# Why UDP is Faster

No:

* Handshake
* Retransmission
* Ordering logic

Less overhead.

---

# UDP Used In

| Use Case       |
| -------------- |
| Gaming         |
| Live streaming |
| Video calls    |
| DNS            |
| VoIP           |

Because speed matters more than perfection.

---

# TCP vs UDP

| Feature        | TCP          | UDP               |
| -------------- | ------------ | ----------------- |
| Connection     | Yes          | No                |
| Reliable       | Yes          | No                |
| Ordered        | Yes          | No                |
| Speed          | Slower       | Faster            |
| Error recovery | Yes          | No                |
| Use cases      | Web, banking | Gaming, streaming |

---

# Important Advanced Understanding

HTTP/3 uses:

* QUIC over UDP

Why?

Because modern protocols implement reliability themselves more efficiently than TCP.

That’s why:

* UDP is becoming more important.

---

# Final Mental Model

## Internet Communication Stack

```text
Application Layer
    HTTP / HTTPS

Transport Layer
    TCP / UDP

Security Layer
    SSL/TLS

Routing Layer
    IP
```

---

# Ultra-Short Revision Sheet

## HTTP

Communication protocol for web.

## HTTPS

HTTP + TLS encryption.

## TLS

Provides encryption + authentication.

## HTTP Versions

* 1.0 → separate connections
* 1.1 → keep alive
* 2 → multiplexing
* 3 → QUIC over UDP

## Status Codes

* 2xx success
* 3xx redirect
* 4xx client issue
* 5xx server issue

## Proxy

Represents client.

## Reverse Proxy

Represents server.

## VPN

Encrypted tunnel hiding IP/location.

## TCP

Reliable but slower.

## UDP

Fast but unreliable.
