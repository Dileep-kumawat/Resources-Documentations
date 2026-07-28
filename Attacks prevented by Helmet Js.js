// security-headers.js
// Express backend with Helmet configured for each protection shown

const express = require("express");
const helmet = require("helmet");

const app = express();

/**
 * 1. Cross-Site Scripting (XSS)
 * Content-Security-Policy
 */
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // block untrusted scripts
            styleSrc: ["'self'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    })
);

/**
 * 2. Clickjacking
 * X-Frame-Options
 */
app.use(
    helmet.frameguard({
        action: "deny", // prevents embedding in iframes
    })
);

/**
 * 3. MIME Sniffing
 * X-Content-Type-Options
 */
app.use(helmet.noSniff());

/**
 * 4. SSL Stripping / MitM
 * Strict-Transport-Security
 */
app.use(
    helmet.hsts({
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    })
);

/**
 * 5. Stack Fingerprinting
 * Removes X-Powered-By
 */
app.disable("x-powered-by");

/**
 * 6. DNS Leakage
 * X-DNS-Prefetch-Control
 */
app.use(
    helmet.dnsPrefetchControl({
        allow: false,
    })
);

/**
 * 7. Referrer Leakage
 * Referrer-Policy
 */
app.use(
    helmet.referrerPolicy({
        policy: "no-referrer",
    })
);

/**
 * 8. Spectre / Memory Attack
 * Cross-Origin-Opener-Policy
 */
app.use(
    helmet.crossOriginOpenerPolicy({
        policy: "same-origin",
    })
);

/**
 * 9. Cross-Origin Data Theft
 * Cross-Origin-Resource-Policy
 */
app.use(
    helmet.crossOriginResourcePolicy({
        policy: "same-origin",
    })
);

/**
 * 10. Rogue Feature Access
 * Permissions-Policy
 */
app.use(
    helmet({
        permissionsPolicy: {
            features: {
                camera: ["()"],
                microphone: ["()"],
                geolocation: ["()"],
            },
        },
    })
);

/**
 * 11. Cross-Origin Embedding
 * Cross-Origin-Embedder-Policy
 */
app.use(
    helmet.crossOriginEmbedderPolicy({
        policy: "require-corp",
    })
);

/**
 * 12. IE Legacy XSS
 * X-XSS-Protection
 * Disable buggy old browser filter
 */
app.use(helmet.xssFilter());
// Helmet sets: X-XSS-Protection: 0

/**
 * 13. Flash/Plugin Attacks
 * X-Permitted-Cross-Domain-Policies
 */
app.use(
    helmet.permittedCrossDomainPolicies({
        permittedPolicies: "none",
    })
);

/**
 * 14. IE File Download XSS
 * X-Download-Options
 */
app.use(helmet.ieNoOpen());

/**
 * Optional: Hide or block other risky defaults
 */
app.use(helmet.hidePoweredBy());

/**
 * Sample route
 */
app.get("/", (req, res) => {
    res.send("Secure Express backend with Helmet");
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});