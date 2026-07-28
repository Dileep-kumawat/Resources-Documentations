# Progressive Web App (PWA) — Quick Recall Notes
*(MERN Stack Developer Edition)*

---

## 1. What is a PWA?

A **web app** that behaves like a **native app** using modern browser APIs.

> Normal website + Service Worker + Manifest + HTTPS = PWA

**Core idea:** One codebase (React/Next/etc.) → installable, offline-capable, app-like experience.

---

## 2. The 3 Pillars (Must Remember)

| Pillar | What it does | File/API |
|---|---|---|
| **Manifest** | Makes app installable, defines icon/name/theme | `manifest.json` |
| **Service Worker** | Background script — caching, offline, push | `sw.js` |
| **HTTPS** | Required for service worker to even register | SSL cert |

If you remember nothing else: **Manifest = looks like app, Service Worker = works like app.**

---

## 3. PWA Checklist (Lighthouse criteria)

- [ ] Served over HTTPS
- [ ] Has a valid `manifest.json` linked in `<head>`
- [ ] Registers a Service Worker
- [ ] Responsive on mobile
- [ ] Fast load (works on slow 3G)
- [ ] Works offline (at least app shell)
- [ ] Add to Home Screen prompt works

---

## 4. manifest.json — Cheat Sheet

```json
{
  "name": "My MERN App",
  "short_name": "MERNApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#317EFB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Link it in HTML:**
```html
<link rel="manifest" href="/manifest.json" />
```

**Key fields to recall:**
- `display: standalone` → hides browser UI (looks native)
- `start_url` → page opened when launched from home screen
- `icons` → need 192x192 & 512x512 minimum

---

## 5. Service Worker — Lifecycle (Important!)

```
Register → Install → Activate → Fetch (intercepts network calls)
```

### a) Register (in your React entry — `index.js`)
```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.log('SW failed', err));
  });
}
```

### b) Install + Cache (in `sw.js`)
```js
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = ['/', '/index.html', '/styles.css', '/app.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});
```

### c) Activate (cleanup old caches)
```js
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});
```

### d) Fetch (intercept requests → serve from cache or network)
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

---

## 6. Caching Strategies (Interview-Important)

| Strategy | How it works | Use case |
|---|---|---|
| **Cache First** | Check cache → fallback to network | Static assets (CSS, JS, images) |
| **Network First** | Try network → fallback to cache | API data that changes often |
| **Stale-While-Revalidate** | Serve cache instantly + update cache in background | Best of both — feeds, dashboards |
| **Cache Only** | Always from cache | Offline-only assets |
| **Network Only** | Always from network | Analytics, non-cacheable calls |

```js
// Network First example
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
```

---

## 7. React + PWA (CRA / Vite)

### Create React App (built-in support)
```bash
npx create-react-app my-app --template cra-template-pwa
```
- Generates `service-worker.js` + `serviceWorkerRegistration.js`
- In `index.js`, change:
```js
serviceWorkerRegistration.register(); // instead of unregister()
```

### Vite (recommended now)
```bash
npm install vite-plugin-pwa -D
```
```js
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My MERN App',
        short_name: 'MERN',
        theme_color: '#317EFB',
        icons: [/* same as above */]
      }
    })
  ]
}
```
✅ Handles manifest + SW generation automatically — **less boilerplate, preferred in 2025+**.

---

## 8. MERN-Specific Considerations

- **Frontend (React)** → PWA lives here (manifest + SW)
- **Backend (Node/Express)** → just needs to serve over **HTTPS** + correct CORS headers; SW caches frontend assets & API GET responses
- **MongoDB data** → not cached directly; cache the **API responses** via service worker (Network First strategy works well)
- **Auth (JWT)** → be careful caching authenticated API responses — don't cache sensitive/user-specific data with Cache First
- **Push Notifications** → needs backend support (web-push library) + Service Worker `push` event

```js
// Backend: web-push setup (Node)
const webpush = require('web-push');
webpush.setVapidDetails('mailto:you@example.com', publicKey, privateKey);
```

```js
// Service Worker: handle push
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, { body: data.body });
});
```

---

## 9. Install Prompt (Add to Home Screen)

```js
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // show your own custom "Install App" button
});

installButton.addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    console.log(choice.outcome); // 'accepted' or 'dismissed'
  });
});
```

---

## 10. Testing & Debugging

- **Chrome DevTools → Application tab**
  - Manifest section → validate manifest
  - Service Workers section → check registration/status
  - Cache Storage → inspect cached files
- **Lighthouse** (DevTools → Lighthouse) → run PWA audit, get score + fixes
- Test offline: DevTools → Network → "Offline" checkbox

---

## 11. Common Gotchas (Remember These!)

1. Service Worker **won't register on localhost without HTTPS exception** (browsers allow `localhost` as exception, but production needs real HTTPS)
2. Always **bump cache version** (`v1` → `v2`) when you update cached files, or users get stale assets
3. Service Worker has its **own scope** — `/sw.js` at root controls whole site; in subfolder, only controls that subfolder
4. SW updates **don't apply immediately** — need `skipWaiting()` + `clients.claim()` to force update
5. Don't cache POST requests (Cache API only works well with GET)

```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
```

---

## 12. One-Line Summary Table (Final Recall)

| Concept | One-liner |
|---|---|
| PWA | Web app that feels native |
| Manifest | Makes it installable |
| Service Worker | Makes it offline-capable + intercepts requests |
| HTTPS | Mandatory requirement |
| Cache First | Static files |
| Network First | Dynamic/API data |
| Stale-While-Revalidate | Fast + fresh |
| vite-plugin-pwa | Easiest setup for React+Vite |
| beforeinstallprompt | Custom install button |
| skipWaiting + clients.claim | Force SW update |

---

## 13. Quick Revision Flow (60-second recall)

```
PWA = Manifest (install) + Service Worker (offline) + HTTPS
   ↓
SW lifecycle: install → activate → fetch
   ↓
Caching strategy: Cache First (static) / Network First (API)
   ↓
React: use vite-plugin-pwa or CRA pwa template
   ↓
Test: Chrome DevTools → Application + Lighthouse
```
