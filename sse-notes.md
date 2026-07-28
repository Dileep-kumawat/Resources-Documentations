# Server-Sent Events (SSE) — Quick Recall Notes (MERN)

## 1. What is SSE?
A way for the **server to push data to the client over a single, long-lived HTTP connection**, one-way only (server → client).

- Built on plain HTTP (no special protocol like WebSocket).
- Browser native `EventSource` API handles reconnection automatically.
- Text-based, UTF-8 only (no binary data).

## 2. SSE vs WebSocket vs Polling

| Feature | SSE | WebSocket | Polling |
|---|---|---|---|
| Direction | Server → Client only | Bi-directional | Client → Server (repeated) |
| Protocol | HTTP | ws:// (own protocol) | HTTP |
| Auto-reconnect | Yes (built-in) | No (manual) | N/A |
| Browser support | Good (no IE) | Good | Universal |
| Use case | Notifications, live feed, AI streaming, stock ticker | Chat, gaming, collaborative editing | Simple/legacy fallback |
| Overhead | Low | Low after handshake | High (repeated requests) |

**Rule of thumb:** Need client→server too? Use WebSocket. Only need server→client updates? Use SSE — simpler, works over normal HTTP/HTTPS, plays nice with proxies/load balancers, no extra library needed on backend.

## 3. How it works (Protocol-level)

Client opens a normal HTTP GET request. Server responds with headers that keep the connection open:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

Server then streams data as **text chunks** in this format:

```
data: hello world

data: {"price": 102.5}

event: priceUpdate
data: {"price": 103.1}
id: 42
retry: 5000

```

### Field meanings:
- `data:` — the actual payload (string). Multiple `data:` lines = one multi-line message.
- `event:` — custom event name (default is `"message"`). Lets you have multiple event types on one connection.
- `id:` — message ID. Browser remembers `Last-Event-ID` and sends it back on reconnect (for resuming).
- `retry:` — reconnection time in ms if connection drops.
- **Each message MUST end with a blank line (`\n\n`)** — this is critical, it's the message delimiter.

## 4. Backend (Express/Node) Implementation

```js
app.get('/api/events', (req, res) => {
  // 1. Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // send headers immediately

  // 2. Send a message anytime
  const sendEvent = (data, eventName = 'message') => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({ msg: 'connected' });

  // 3. Example: push every 3s
  const interval = setInterval(() => {
    sendEvent({ time: new Date().toISOString() }, 'tick');
  }, 3000);

  // 4. Cleanup when client disconnects
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});
```

### Key backend gotchas:
- Don't use `res.json()` or `res.send()` — they close the connection. Use `res.write()` repeatedly.
- Always handle `req.on('close')` to clear intervals/listeners → prevents memory leaks.
- If behind **Nginx**, disable buffering: `X-Accel-Buffering: no` header, or proxy config `proxy_buffering off;` — otherwise events get stuck/batched.
- If using **compression middleware** (gzip), exclude the SSE route — compression buffers output.
- CORS: SSE is a GET request, so normal CORS headers apply (`Access-Control-Allow-Origin`). Must allow credentials if using cookies.
- **Auth problem**: `EventSource` (native) cannot send custom headers (no Authorization header). Common workarounds:
  - Pass token as query param: `/api/events?token=xyz`
  - Use cookies (httpOnly) for auth instead
  - Or use a polyfill/fetch-based SSE client that supports headers

## 5. Frontend (React) Implementation

### Native EventSource:
```jsx
useEffect(() => {
  const es = new EventSource('http://localhost:5000/api/events', {
    withCredentials: true // if using cookies
  });

  es.onmessage = (e) => {
    console.log('default message:', JSON.parse(e.data));
  };

  es.addEventListener('tick', (e) => {
    console.log('tick event:', JSON.parse(e.data));
  });

  es.onerror = (err) => {
    console.error('SSE error', err);
    // EventSource auto-reconnects by default, no need to manually reconnect
  };

  return () => es.close(); // cleanup on unmount
}, []);
```

### React state example:
```jsx
const [messages, setMessages] = useState([]);

useEffect(() => {
  const es = new EventSource('/api/events');
  es.onmessage = (e) => {
    setMessages(prev => [...prev, JSON.parse(e.data)]);
  };
  return () => es.close();
}, []);
```

### Custom SSE via `fetch` (when you need headers, e.g. Authorization Bearer token):
```js
const res = await fetch('/api/events', {
  headers: { Authorization: `Bearer ${token}` }
});
const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // parse "data: ...\n\n" manually
}
```
> Use a small library like `@microsoft/fetch-event-source` for this pattern — handles reconnection, headers, parsing for you.

## 6. MongoDB Integration Pattern (MERN)

Common use case: stream DB changes to client live.

```js
// Using MongoDB Change Streams + SSE
app.get('/api/orders/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const changeStream = Order.watch(); // mongoose model watch

  changeStream.on('change', (change) => {
    res.write(`data: ${JSON.stringify(change)}\n\n`);
  });

  req.on('close', () => {
    changeStream.close();
    res.end();
  });
});
```
> Note: `watch()` requires MongoDB replica set (Atlas supports this by default).

## 7. Common Real-World Use Cases
- AI chat streaming (ChatGPT-style token-by-token response) — **most common in modern apps**
- Live notifications (likes, comments, order status)
- Stock price / crypto ticker
- Progress bars for long-running server jobs (file upload, video processing)
- Live dashboards / analytics
- Log streaming (e.g., deployment logs)

## 8. Limitations to Remember
- **One-way only** — client can't send data over the same connection (use separate POST request for client→server, then push response via SSE).
- **Browser connection limit**: ~6 concurrent SSE/HTTP connections per domain (HTTP/1.1). Not an issue with HTTP/2 (multiplexed).
- No binary support — text only (base64-encode if needed).
- Some corporate proxies/firewalls may buffer or block long-lived connections.
- Not supported well by older IE/Edge Legacy (need polyfill — rarely an issue today).

## 9. Quick Mental Model
> "SSE = a GET request that never really ends. Server keeps writing chunks to the same open response. Browser's EventSource just keeps reading and re-fires `onmessage`. If it drops, browser auto-reconnects via GET again."

## 10. Minimal Checklist to Implement SSE in MERN
- [ ] Backend: set 3 SSE headers + `flushHeaders()`
- [ ] Backend: use `res.write()`, never `res.end()` until close
- [ ] Backend: handle `req.on('close')` cleanup
- [ ] Backend: disable compression/buffering for this route
- [ ] Frontend: `new EventSource(url)`, `.onmessage`, custom `.addEventListener(eventName)`
- [ ] Frontend: cleanup `es.close()` in `useEffect` return
- [ ] Auth: token via query param/cookie (not headers, unless using fetch-based client)
