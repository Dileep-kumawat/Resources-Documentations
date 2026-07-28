# Firebase for MERN Stack Developers — Revision Notes

> Goal: Map Firebase concepts to things you already know from MERN (Express, MongoDB, JWT auth, REST APIs) so recall is fast.

---

## 1. What Firebase Actually Is

Firebase = a BaaS (Backend-as-a-Service) by Google. It replaces pieces of your custom Node/Express backend with managed services.

| MERN piece | Firebase equivalent |
|---|---|
| Express + Node server | Cloud Functions (serverless backend) |
| MongoDB | Firestore (or Realtime Database) |
| Your own JWT/auth logic | Firebase Authentication |
| Multer + S3/Cloudinary | Firebase Storage |
| Custom WebSocket/socket.io | Firestore/RTDB real-time listeners |
| Nginx/Heroku hosting | Firebase Hosting |
| Manual analytics setup | Firebase Analytics |

You can use **only the pieces you need** — e.g., keep Express backend, just use Firebase Auth + Storage.

---

## 2. Core Setup

```bash
npm install firebase          # client SDK (React app)
npm install -g firebase-tools # CLI (for hosting/functions deploy)
firebase login
firebase init
```

`firebaseConfig.js` (client side, in React app):

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig);
export default app;
```

⚠️ This config is **safe to expose** in frontend (it's not a secret) — security comes from **Firebase Security Rules**, not hiding keys.

---

## 3. Firestore (NoSQL DB) — vs MongoDB

### Mental Model
- **Collection** ≈ MongoDB Collection
- **Document** ≈ MongoDB Document (but max 1MB, no deep nesting recommended)
- **Sub-collection** = collection nested inside a document (no direct Mongo equivalent — like a "join table" living inside the parent)
- No schema, no Mongoose-style models — fully schemaless.

### Key Differences from MongoDB
- No native joins — denormalize data (duplicate data across documents) instead of `$lookup`/`populate`.
- Querying is **limited**: no `OR` across fields easily (pre-2023), no full-text search (use Algolia/Typesense for that).
- Real-time by default via `onSnapshot` — no need for socket.io.
- Pricing is per **read/write/delete operation**, not just storage — watch your query patterns (avoid reading whole collections in loops).

### CRUD Cheatsheet (Client SDK v9 modular)

```js
import { getFirestore, collection, addDoc, getDocs, getDoc, doc,
         updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";

const db = getFirestore(app);

// CREATE
await addDoc(collection(db, "users"), { name: "Sam", age: 22 });

// CREATE with custom ID (like Mongo's custom _id)
import { setDoc } from "firebase/firestore";
await setDoc(doc(db, "users", "user123"), { name: "Sam" });

// READ all
const snapshot = await getDocs(collection(db, "users"));
snapshot.forEach(d => console.log(d.id, d.data()));

// READ one
const docSnap = await getDoc(doc(db, "users", "user123"));
if (docSnap.exists()) console.log(docSnap.data());

// UPDATE
await updateDoc(doc(db, "users", "user123"), { age: 23 });

// DELETE
await deleteDoc(doc(db, "users", "user123"));

// QUERY (like find({ age: { $gt: 18 } }))
const q = query(collection(db, "users"), where("age", ">", 18), orderBy("age"));
const result = await getDocs(q);

// REAL-TIME LISTENER (no socket.io needed!)
onSnapshot(collection(db, "users"), (snap) => {
  snap.docChanges().forEach(change => console.log(change.type, change.doc.data()));
});
```

### Firestore vs Realtime Database (RTDB) — when asked
- **Firestore**: better queries, scales better, document/collection model → use this by default.
- **RTDB**: single big JSON tree, cheaper for very high-frequency small writes (e.g., live cursor position, presence systems).

---

## 4. Firebase Authentication — vs your custom JWT auth

Replaces: bcrypt password hashing + JWT signing + refresh token logic + email verification system you'd build manually.

### Supported methods
Email/Password, Google, GitHub, Phone (OTP), Anonymous, Facebook, Apple.

### Setup (Email/Password)

```js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth(app);

// SIGNUP
await createUserWithEmailAndPassword(auth, email, password);

// LOGIN
await signInWithEmailAndPassword(auth, email, password);

// LOGOUT
await signOut(auth);

// GOOGLE LOGIN
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);

// LISTEN TO AUTH STATE (like checking JWT on every page load)
onAuthStateChanged(auth, (user) => {
  if (user) console.log("Logged in:", user.uid);
  else console.log("Logged out");
});
```

### How this talks to YOUR Express backend
Firebase gives the client an **ID token** (JWT-like). Send it to your Express API in headers, verify it server-side with Firebase Admin SDK — this is the standard MERN + Firebase Auth pattern.

```js
// Client: get token and send to your own backend
const token = await auth.currentUser.getIdToken();
fetch("https://your-express-api.com/protected", {
  headers: { Authorization: `Bearer ${token}` }
});
```

```js
// Server (Express) — verify with Admin SDK
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) });

app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).send("Unauthorized");
  }
});
```

**This is the #1 interview-relevant pattern**: Firebase Auth (frontend) + Express (your business logic backend) + Admin SDK (token verification).

---

## 5. Firebase Storage — vs Multer/Cloudinary

```js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const storage = getStorage(app);

// UPLOAD
const storageRef = ref(storage, `images/${file.name}`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);

// DELETE
await deleteObject(ref(storage, `images/${file.name}`));
```

Equivalent to: Multer (handles file) + S3/Cloudinary (stores file) + returning a public URL — Firebase does all three.

---

## 6. Cloud Functions — vs Express routes

Serverless functions = your Express route handlers, but each deploys independently, auto-scales, no server to manage.

```js
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// HTTP endpoint (like an Express route)
exports.getUsers = functions.https.onRequest((req, res) => {
  res.json({ message: "Hello from Cloud Function" });
});

// TRIGGER on Firestore write (no MERN equivalent — this is event-driven)
exports.onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate((snap, context) => {
    console.log("New user:", snap.data());
  });
```

```bash
firebase deploy --only functions
```

**When to prefer Cloud Functions over your Express server**: small event-driven tasks (send email on signup, resize image on upload, scheduled cron jobs) rather than your whole app's API layer (cold starts make it less ideal for high-traffic full backends — many MERN devs keep Express on Render/Railway and only use Functions for triggers).

---

## 7. Security Rules — vs Express middleware/authorization checks

This is the part with **no direct MERN equivalent** — pay extra attention here since it's the most commonly forgotten piece.

In MERN you write `if (req.user.id !== doc.userId) return res.status(403)` in Express. In Firebase, since the client talks **directly** to the DB (no Express in between for Firestore calls from the frontend), you write that same authorization logic as **declarative rules**, not code.

```js
// Firestore rules (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

```bash
firebase deploy --only firestore:rules
```

⚠️ **Default rules in test mode allow anyone to read/write** — this is the #1 production security mistake. Always lock down before launch.

---

## 8. Hosting — vs Vercel/Netlify

```bash
firebase init hosting
npm run build           # React build
firebase deploy --only hosting
```

`firebase.json`:
```json
{
  "hosting": {
    "public": "build",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
`rewrites` = handles React Router client-side routing (same problem as configuring Express `app.get('*', ...)` or Vercel's rewrites).

---

## 9. Common MERN + Firebase Architecture Patterns

**Pattern A — Firebase replaces everything:**
React → Firebase Auth + Firestore + Storage + Functions + Hosting (no custom Express server at all).

**Pattern B — Hybrid (most common in real MERN jobs):**
React → Firebase Auth only (for login) → sends ID token → Express/Node API (your business logic, still using MongoDB) → Admin SDK verifies token.

**Pattern C — Firebase as a feature add-on:**
Keep full MERN stack (Express + MongoDB + JWT), just use Firebase Storage for file uploads or Firebase Cloud Messaging for push notifications.

---

## 10. Quick Reference: SDK Imports Cheat Sheet

```js
import { initializeApp } from "firebase/app";
import { getAuth, ... } from "firebase/auth";
import { getFirestore, ... } from "firebase/firestore";
import { getStorage, ... } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
```

---

## 11. Gotchas / Things People Forget

- Firestore document **size limit**: 1MB. Don't store large arrays growing unbounded inside one doc.
- No native `$lookup`/joins — design data **denormalized** (duplicate small bits of related data) like you would for read-heavy NoSQL.
- Billing: reads/writes/deletes are metered — `getDocs()` on a big collection in a loop = expensive. Use pagination (`limit()`, `startAfter()`).
- `onAuthStateChanged` is **async** — don't assume `auth.currentUser` is populated immediately on app load.
- Security Rules are NOT the same as Express middleware — they run on Google's servers, not yours, and apply only to direct client→Firebase calls (not to calls going through your own Express API).
- Realtime listeners (`onSnapshot`) must be **unsubscribed** (call the returned function) in `useEffect` cleanup to avoid memory leaks.

---

## 12. 60-Second Recall Summary

> Firebase = managed backend services. Auth replaces your JWT system, Firestore replaces MongoDB (but no joins, denormalize instead), Storage replaces Multer+S3, Cloud Functions replace small Express routes/triggers, Hosting replaces Vercel, and Security Rules replace your Express authorization middleware — except rules live in Firebase config, not your code. Most real MERN jobs use Firebase Auth + Express/MongoDB hybrid: client logs in via Firebase, sends ID token to Express, Admin SDK verifies it server-side.
