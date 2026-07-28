# Nodemailer (with Gmail) — Quick Recall Notes

## 1. What is Nodemailer?
A Node.js module to **send emails** from a server (Node/Express backend) — used for OTP, signup verification, password reset, contact forms, order confirmations, etc.

```bash
npm install nodemailer
```

---

## 2. Gmail Setup — IMPORTANT (App Password, not your real password)

Gmail blocks normal password login for apps. You MUST use an **App Password**.

### Steps to get Gmail App Password:
1. Go to your Google Account → **Security**
2. Turn ON **2-Step Verification** (mandatory, App Password won't show without it)
3. Search **"App Passwords"** in account settings (or go to: https://myaccount.google.com/apppasswords)
4. Select app → "Mail", Select device → "Other" → name it (e.g. "NodeApp")
5. Google gives a **16-character password** → copy it (spaces don't matter)
6. Use this in your `.env`, NOT your real Gmail password

```
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx   # 16-char app password
```

⚠️ Never hardcode credentials — always use `.env` + `dotenv`.

---

## 3. Basic Setup Code

```js
const nodemailer = require("nodemailer");
require("dotenv").config();

// 1. Create a transporter (the "mail sender" config)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Define mail options
const mailOptions = {
  from: process.env.EMAIL_USER,        // sender
  to: "receiver@example.com",          // receiver
  subject: "Test Email",
  text: "This is a plain text email",  // plain text
  html: "<h1>This is HTML email</h1>", // HTML version (optional)
};

// 3. Send mail
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
```

---

## 4. Using Async/Await (Cleaner — preferred in real projects)

```js
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email sending failed:", err);
  }
};

module.exports = sendEmail;
```

Usage anywhere in your app:
```js
sendEmail("user@example.com", "Welcome!", "<h2>Welcome to our app 🎉</h2>");
```

---

## 5. Real MERN Use Case: OTP Email Verification

```js
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};
```

Typical flow:
1. User signs up → generate random OTP (`Math.floor(100000 + Math.random()*900000)`)
2. Save OTP + expiry time in DB (or Redis)
3. Send OTP via `sendOTPEmail()`
4. User submits OTP → compare with DB value → verify

---

## 6. Sending Attachments

```js
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "user@example.com",
  subject: "Invoice",
  text: "Please find attached invoice",
  attachments: [
    {
      filename: "invoice.pdf",
      path: "./files/invoice.pdf", // local file path
    },
  ],
});
```

---

## 7. Reusable Transporter (Best Practice — don't recreate every call)

`utils/mailer.js`
```js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
```

Then import wherever needed:
```js
const transporter = require("./utils/mailer");
transporter.sendMail({...});
```

---

## 8. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Invalid login` | Using real Gmail password | Use App Password instead |
| `Less secure app blocked` | 2FA not enabled / old method | Enable 2-Step Verification + App Password |
| `self signed certificate` | TLS issue (rare) | Add `tls: { rejectUnauthorized: false }` in transporter config |
| `Connection timeout` | Network/firewall blocking port 465/587 | Check internet, try `host: "smtp.gmail.com", port: 587, secure: false` |
| OTP/email not received | Went to spam | Check spam folder; for production use proper domain + SPF/DKIM |

---

## 9. Alternative Manual SMTP Config (instead of `service: "gmail"`)

```js
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

---

## 10. Production Tip
Gmail SMTP is fine for learning/small projects, but has **sending limits** (~500/day) and may get flagged as spam.  
For real production apps, prefer: **SendGrid, Mailgun, AWS SES, Resend** — same Nodemailer code, just swap transporter config/API.

---

## 🔑 Quick Recall Summary
- `npm install nodemailer`
- Enable 2FA on Gmail → generate **App Password**
- `createTransport({ service: "gmail", auth: { user, pass } })`
- `transporter.sendMail({ from, to, subject, text/html })`
- Use **async/await**, store credentials in `.env`
- Common MERN use: **OTP verification, password reset, welcome emails**
- For production scale → switch to SendGrid/SES/Mailgun
