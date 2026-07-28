# Razorpay Payment Integration — MERN Stack Notes

## 1. Core Concept (The Big Picture)

Razorpay integration ALWAYS follows this 3-step flow:

```
1. Backend creates an "Order" (with amount) → gets order_id
2. Frontend opens Razorpay Checkout popup using order_id → user pays
3. Backend VERIFIES the payment signature → confirms it's genuine
```

**Golden Rule:** Never trust the frontend. Payment success on frontend means NOTHING until backend verifies the signature using your secret key.

---

## 2. Setup

### Get API Keys
- Razorpay Dashboard → Settings → API Keys
- You get: `key_id` (public, used in frontend) and `key_secret` (private, NEVER expose, backend only)
- Use Test Mode keys (`rzp_test_...`) during development

### Install Packages
```bash
# Backend
npm install razorpay

# Frontend - no npm package needed, just load script via CDN
```

### Environment Variables (.env in backend)
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

---

## 3. Backend Setup (Node/Express)

### Initialize Razorpay Instance
```js
// config/razorpay.js
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
```

### Step A: Create Order Route
```js
const razorpayInstance = require("../config/razorpay");

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees from client

    const options = {
      amount: amount * 100,       // IMPORTANT: Razorpay needs amount in PAISE (smallest unit)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
});
```

> ⚠️ **Common Mistake:** Forgetting to multiply by 100. ₹500 must be sent as `50000`.

### Step B: Verify Payment Route (MOST IMPORTANT STEP)
```js
const crypto = require("crypto");

router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  // Recreate the signature on backend using order_id + payment_id
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    // ✅ Payment is genuine
    // → Update order status in DB to "paid"
    // → Save payment_id, order_id in DB
    res.status(200).json({ success: true, message: "Payment verified" });
  } else {
    // ❌ Signature mismatch = fraud / tampered data
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});
```

**Why this works:** Razorpay signs `order_id|payment_id` with your secret key and sends it to frontend as `razorpay_signature`. Only someone with the secret key (your backend) can recreate the same signature. If they match → payment is legit.

---

## 4. Frontend Setup (React)

### Step A: Load Razorpay Checkout Script
Add in `public/index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
OR load dynamically in a React component (more reliable):
```js
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

### Step B: Trigger Payment Flow
```jsx
const handlePayment = async () => {
  // 1. Load script
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Razorpay SDK failed to load. Check your internet.");
    return;
  }

  // 2. Call backend to create order
  const { data: order } = await axios.post("/api/create-order", {
    amount: 500, // in rupees
  });

  // 3. Configure Checkout options
  const options = {
    key: "rzp_test_xxxxxxxxxx",       // key_id (public, safe to expose)
    amount: order.amount,              // in paise, from backend response
    currency: order.currency,
    name: "My Store",
    description: "Order Payment",
    order_id: order.id,                // order_id from backend
    handler: async function (response) {
      // 4. This runs after successful payment
      // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature

      const verifyRes = await axios.post("/api/verify-payment", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verifyRes.data.success) {
        alert("Payment Successful!");
        // navigate to success page / update UI
      } else {
        alert("Payment verification failed!");
      }
    },
    prefill: {
      name: "John Doe",
      email: "john@example.com",
      contact: "9999999999",
    },
    theme: {
      color: "#3399cc",
    },
  };

  // 5. Open checkout popup
  const rzp = new window.Razorpay(options);
  rzp.open();

  // Optional: handle payment failure
  rzp.on("payment.failed", function (response) {
    alert("Payment Failed: " + response.error.description);
  });
};
```

---

## 5. Complete Flow Diagram (Mental Model)

```
[React: User clicks "Pay"]
        │
        ▼
[Frontend → POST /create-order] ─────► [Backend: razorpayInstance.orders.create()]
        │                                        │
        ◄────────────────────────────────────────┘
   (order_id, amount, currency)
        │
        ▼
[Frontend opens Razorpay Checkout popup with order_id]
        │
        ▼
[User enters card/UPI details → Razorpay processes payment]
        │
        ▼
[Razorpay returns: payment_id, order_id, signature → handler()]
        │
        ▼
[Frontend → POST /verify-payment] ────► [Backend: recompute HMAC signature]
        │                                        │
        ◄────────────────────────────────────────┘
   (success: true/false)
        │
        ▼
[Update UI / Save order as "Paid" in MongoDB]
```

---

## 6. MongoDB Schema Example (Order Model)

```js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
  },
}, { timestamps: true });
```

Save the order at "create-order" step with status `"created"`, then update to `"paid"` only after successful verification.

---

## 7. Webhooks (Production Best Practice)

Why? The `handler()` function on frontend may fail to fire if user closes browser/tab right after paying. Webhooks are Razorpay's server-to-server backup confirmation.

```js
router.post("/webhook", express.json(), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    // Trusted event from Razorpay
    const event = req.body.event;
    if (event === "payment.captured") {
      // Update DB: mark order as paid
    }
    res.status(200).json({ status: "ok" });
  } else {
    res.status(400).send("Invalid webhook signature");
  }
});
```
- Set up webhook URL in Razorpay Dashboard → Settings → Webhooks
- Use `express.json()` (raw body needed for signature check in some setups — check docs if mismatch occurs)

---

## 8. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `amount must be at least 100` | Sent amount in rupees not paise, or amount too low | Multiply by 100, min ₹1 (100 paise) |
| Signature mismatch on verify | Wrong key_secret, or comparing wrong fields | Ensure `order_id\|payment_id` order is exact, use correct secret |
| Checkout popup doesn't open | Script not loaded yet | Await script load before calling `new window.Razorpay()` |
| `Razorpay is not defined` | Script tag missing/blocked | Check CDN script loaded, no adblocker issue |
| CORS error on create-order | Backend CORS not configured | Add `cors()` middleware in Express |
| Payment succeeds but DB not updated | Relying only on frontend handler | Always also implement webhook as backup |

---

## 9. Key Things to Remember (Quick Recall)

1. **Two keys**: `key_id` (frontend-safe) + `key_secret` (backend-only, never expose).
2. **Amount unit**: Razorpay works in paise — always `amount * 100`.
3. **3-step dance**: Create Order (backend) → Checkout (frontend) → Verify Signature (backend).
4. **Verification = crypto.createHmac("sha256", secret)** on `order_id|payment_id`, compare to `razorpay_signature`.
5. **Never mark payment successful based on frontend response alone** — backend verification is the source of truth.
6. **Webhooks** = safety net for production (handles cases where frontend handler doesn't fire).
7. Test mode keys start with `rzp_test_`, live mode with `rzp_live_`.
8. Store `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` in your Order/Payment DB collection for audit trail.

---

## 10. Quick Package/API Cheat Sheet

```js
// Backend
new Razorpay({ key_id, key_secret })
razorpayInstance.orders.create({ amount, currency, receipt })

// Frontend
new window.Razorpay(options).open()
rzp.on("payment.failed", callback)

// Verification (backend)
crypto.createHmac("sha256", secret).update(`${order_id}|${payment_id}`).digest("hex")
```
