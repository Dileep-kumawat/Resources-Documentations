# Model Context Protocol (MCP) — Quick Recall Notes
*(for a MERN stack dev)*

## 1. What is MCP, in one line
MCP is an **open standard protocol that lets LLMs (like Claude) talk to external tools, data sources, and APIs in a uniform way** — think of it as **"USB-C for AI apps"**. Instead of writing a custom integration for every tool an AI needs, you expose your tool/data via an MCP **server**, and any MCP-compatible AI **client** can use it.

## 2. Why it exists (the problem it solves)
- Before MCP: every AI app had its own custom glue code to connect to Slack, GitHub, your DB, your internal APIs → N apps × M tools = N×M integrations.
- MCP standardizes this → N + M (one MCP server per tool, one MCP client per app). Same idea as REST standardizing client-server communication, or how Express middleware standardizes request handling.

## 3. Core Architecture (map it to MERN mentally)

| MCP Concept | MERN Analogy |
|---|---|
| **Host** (e.g. Claude Desktop, your app) | Your **frontend/React app** — the thing the user interacts with |
| **Client** (lives inside host, 1 per server) | Like an **Axios instance / API wrapper** dedicated to one backend |
| **Server** (you build this) | Your **Express/Node backend** exposing specific capabilities |
| **Transport** (stdio / HTTP+SSE / streamable HTTP) | Like choosing **REST vs WebSocket** for client-server comms |

Flow: `Host app → MCP Client → (transport) → MCP Server → external resource (DB, API, filesystem, etc.)`

## 4. The 3 Primitives an MCP Server Exposes
1. **Tools** — functions the AI can *call* (like an Express route handler / controller function). Example: `createGithubIssue(title, body)`. The AI decides when to call these based on user intent.
2. **Resources** — read-only data the AI can *fetch for context* (like a GET endpoint returning data, e.g. file contents, DB rows). Not "actions", just data.
3. **Prompts** — reusable prompt templates the server provides to guide how the AI uses tools/resources (like predefined "snippets" or "macros").

> Mental model: **Tools = POST/PUT (do something)**, **Resources = GET (read something)**, **Prompts = templates**.

## 5. Transports (how client ↔ server talk)
- **stdio** — for local servers (process spawned on your machine), like running a local CLI tool. Fast, simple, no network.
- **HTTP + SSE / Streamable HTTP** — for remote servers, like a normal REST API but supports streaming responses back to the client. This is what you'd use to host an MCP server like you'd host an Express API (deployed on a server, accessed over network).

## 6. Building an MCP Server (Node.js — MERN-relevant)
- Use the official SDK: `@modelcontextprotocol/sdk` (Node/TypeScript available — fits naturally into a MERN/Node background).
- Basic shape (conceptually, NOT exact API — check SDK docs when coding):
  ```js
  const server = new McpServer({ name: "my-app-server", version: "1.0.0" });

  server.tool("getUserOrders", { userId: z.string() }, async ({ userId }) => {
    const orders = await Order.find({ userId }); // your existing Mongoose model!
    return { content: [{ type: "text", text: JSON.stringify(orders) }] };
  });

  server.connect(transport);
  ```
- Key insight: **you can wrap your existing Express/Mongoose/REST logic inside MCP tool handlers.** MCP doesn't replace your backend — it adds an AI-friendly interface layer on top of it.
- Validation typically done with **Zod** (same as many Node devs already use for request validation).

## 7. Where MCP fits in a MERN app (practical use cases)
- Expose your app's backend functions (DB queries, business logic, internal APIs) as MCP tools so an AI assistant (Claude, Cursor, etc.) can act on your app's behalf.
- Example: building a customer-support AI for your e-commerce MERN app → MCP server exposes tools like `getOrderStatus`, `refundOrder`, `searchProducts` — all just wrapping your existing Express routes/Mongoose models.
- Also useful for **internal dev tooling**: e.g., expose your own DB/logs/docs as MCP resources so you (or your team) can query them via Claude directly.

## 8. MCP vs REST API vs Function Calling — don't confuse these
- **REST API**: generic client-server data exchange, no inherent "AI awareness."
- **Function calling (e.g., OpenAI/Claude tool use)**: the AI model itself decides to call a function you defined — but it's tightly coupled to *that one* AI integration, not reusable across apps.
- **MCP**: standardizes function calling + resource access so it's **reusable across any MCP-compatible AI client**, not locked to one app's code. It's a protocol layer above function calling.

## 9. Key Terms Cheat Sheet
| Term | Meaning |
|---|---|
| **Host** | The AI application (e.g. Claude Desktop, an IDE, your custom app) |
| **Client** | Protocol handler inside the host, 1:1 with a server |
| **Server** | Program exposing tools/resources/prompts |
| **Tool** | Callable function (AI decides when to invoke) |
| **Resource** | Read-only context data |
| **Prompt** | Reusable prompt template |
| **Transport** | stdio (local) or HTTP/SSE (remote) — how messages move |
| **Sampling** | Server can ask the client's LLM to generate text (less common, advanced) |

## 10. Quick Recall Summary (read this when in a hurry)
> MCP = standard protocol so AI apps can plug into tools/data without custom integration per tool.
> Architecture: **Host → Client → Server (your code) → External system**.
> Server exposes **Tools (actions), Resources (data), Prompts (templates)**.
> Build servers in Node with `@modelcontextprotocol/sdk`, wrap your existing Express/Mongoose logic as tool handlers, validate with Zod.
> Transport = stdio (local) or HTTP/SSE (remote/hosted, like an API).
> Use case for MERN devs: turn your backend into an AI-callable interface without rewriting your core logic.

## 11. Good Next Steps to Actually Learn (not just read)
1. Read official docs: https://modelcontextprotocol.io
2. Build a tiny local MCP server (stdio transport) wrapping one simple function (e.g., a "get weather" or "query my MongoDB" tool).
3. Connect it to Claude Desktop and test calling the tool via natural language.
4. Then try a remote/HTTP server version and deploy it like a normal Node API.
