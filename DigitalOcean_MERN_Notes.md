# DigitalOcean — Complete Notes for MERN Stack Developers

## 1. What is DigitalOcean?

A cloud infrastructure provider (IaaS) offering virtual servers, storage, databases, and networking. Popular with developers because of simple pricing, clean UI, and great documentation. Main competitor to AWS/GCP/Azure but much simpler for small-to-medium MERN apps.

**Core idea for a MERN dev:** instead of relying only on Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas (DB), DigitalOcean lets you control your own server(s) and host the entire stack — frontend, backend, database, reverse proxy — yourself.

---

## 2. Core DigitalOcean Products (Know These Names)

| Product | What it is | MERN use case |
|---|---|---|
| **Droplet** | A virtual private server (VPS) | Host Node/Express backend, or full MERN app |
| **App Platform** | PaaS (like Heroku/Vercel) — push code, DO builds & deploys | Quick deploy without managing servers |
| **Managed Databases** | Hosted MongoDB, PostgreSQL, MySQL, Redis | Replace MongoDB Atlas if you want everything in one place |
| **Spaces** | Object storage (S3-compatible) | Store images/files uploaded by users |
| **Load Balancer** | Distributes traffic across multiple Droplets | Scaling backend horizontally |
| **VPC (Virtual Private Cloud)** | Private network between your resources | Secure DB-to-backend communication |
| **Volumes (Block Storage)** | Extra attachable disk space | Extra storage for a Droplet |
| **Container Registry** | Store Docker images | CI/CD with Docker |
| **Kubernetes (DOKS)** | Managed K8s cluster | Large-scale microservices (advanced) |
| **Firewalls** | Network-level security rules | Restrict ports (only 22, 80, 443 open) |
| **DNS** | Manage domain records | Point your custom domain to your app |

> **For most MERN projects, you only need: Droplet (or App Platform) + Managed Database (optional) + Spaces (optional) + Firewall + Domain/DNS.**

---

## 3. Droplets (Virtual Servers) — The Core Concept

- A Droplet = a Linux VM you fully control (root SSH access).
- Billed hourly/monthly based on size (vCPU, RAM, SSD).
- Choose an image: **Ubuntu 22.04 LTS** is the standard choice for MERN deployments.
- Cheapest plan ("Basic Droplet", ~$4-6/mo) is enough for small/personal projects.

### Creating a Droplet — Checklist
1. Choose image: Ubuntu (LTS version)
2. Choose plan: Basic → Regular SSD (shared CPU) for small apps
3. Choose datacenter region (pick closest to your users)
4. Authentication: **SSH key** (preferred over password — more secure)
5. Hostname: name it meaningfully (e.g., `mern-prod-1`)
6. Create

### Connecting to a Droplet
```bash
ssh root@your_droplet_ip
```
If you used SSH keys, no password needed.

---

## 4. Initial Server Setup (Security Basics)

Do this on every fresh Droplet before deploying:

```bash
# 1. Update packages
apt update && apt upgrade -y

# 2. Create a non-root user
adduser deployuser
usermod -aG sudo deployuser

# 3. Copy SSH key to new user (so you don't lose access)
rsync --archive --chown=deployuser:deployuser ~/.ssh /home/deployuser

# 4. Set up basic firewall (UFW)
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

# 5. Disable root login & password auth (edit /etc/ssh/sshd_config)
# PermitRootLogin no
# PasswordAuthentication no
systemctl restart sshd
```

DigitalOcean also has a built-in **Cloud Firewall** (network-level, free) — set it up via the dashboard too: allow SSH (22), HTTP (80), HTTPS (443) only.

---

## 5. Deploying a MERN App on a Droplet (Manual Way)

This is the classic "do it yourself" deployment — understand this even if you later use App Platform.

### Step 1: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt install -y nodejs
node -v
```

### Step 2: Install & Run MongoDB (if self-hosting DB)
- Easier alternative: use **MongoDB Atlas** (free tier) instead of installing Mongo on the Droplet — avoids managing DB ops, backups, security.
- If self-hosting: install MongoDB Community Edition via official apt repo, enable auth, bind to localhost only.

### Step 3: Clone your project
```bash
git clone https://github.com/you/your-repo.git
cd your-repo
npm install
```

### Step 4: Environment Variables
- Create `.env` file on server (never commit secrets to git).
- Store: `MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV=production`, etc.

### Step 5: Process Manager — PM2
Keeps your Node app running forever, restarts on crash, restarts on reboot.
```bash
npm install -g pm2
pm2 start server.js --name "mern-backend"
pm2 startup        # generates a systemd command — run it
pm2 save           # saves current process list
pm2 list           # check status
pm2 logs           # view logs
pm2 restart mern-backend
```

### Step 6: Reverse Proxy — Nginx
Nginx sits in front of Node, handles port 80/443 → forwards to your app's internal port (e.g., 5000). Also serves your React build as static files.

```nginx
# /etc/nginx/sites-available/mernapp
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve React build
    root /var/www/your-repo/client/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Proxy API calls to Node/Express backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/mernapp /etc/nginx/sites-enabled/
nginx -t          # test config
systemctl restart nginx
```

### Step 7: Build React Frontend
```bash
cd client
npm run build
# Nginx serves this build folder as static files (see config above)
```

### Step 8: HTTPS — Free SSL via Let's Encrypt (Certbot)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Auto-renews via cron/systemd timer set up by certbot
```

---

## 6. Domain & DNS Setup

1. Buy domain anywhere (Namecheap, GoDaddy, etc.) — DO doesn't sell domains directly.
2. In DigitalOcean dashboard → **Networking → Domains** → Add your domain.
3. Add an **A record** pointing `@` (and `www`) to your Droplet's IP.
4. At your domain registrar, update **nameservers** to DO's:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
   (Or just add an A record directly at the registrar pointing to the Droplet IP — simpler, skips DO DNS entirely.)
5. DNS propagation can take a few minutes to 24 hours.

---

## 7. App Platform (Easier Alternative to Droplets)

PaaS option — similar to Vercel/Heroku/Render. No server management.

- Connect your GitHub repo → DO auto-detects Node/React → auto builds & deploys on every `git push`.
- Good for: quick MVP deployment, less DevOps overhead.
- Downsides: less control, can be pricier at scale, fewer customizations than raw Droplet + Nginx.
- Supports environment variables, custom domains, auto SSL — all from dashboard, no manual Certbot/Nginx needed.

**When to use what:**
| Situation | Choice |
|---|---|
| Learning DevOps / full control / cheapest at scale | Droplet |
| Fast deploy, don't want to manage servers | App Platform |
| Production app needing fine-tuned performance | Droplet (+ Load Balancer if scaling) |

---

## 8. Managed Databases (Optional alternative to MongoDB Atlas)

- DO offers **Managed MongoDB** (and Postgres/MySQL/Redis).
- Pros: automated backups, easy scaling, same-network (VPC) connection to your Droplet = lower latency, one dashboard for everything.
- Cons: costs more than self-hosted; MongoDB Atlas free tier is hard to beat for small projects.
- Connection: get connection string from dashboard, same as Atlas — drop into `mongoose.connect(MONGO_URI)`.

---

## 9. Spaces (Object Storage) — For File/Image Uploads

- S3-compatible storage bucket service.
- Use case: user-uploaded images/files in your MERN app (profile pics, documents) instead of storing on the server disk (which doesn't persist well and doesn't scale).
- Works with the **same AWS SDK** (`@aws-sdk/client-s3`) — just change the endpoint to DO's Spaces endpoint.
- Has CDN option built in for fast global delivery.

```js
// Example: configuring AWS SDK v3 for DO Spaces
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "nyc3",
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
});
```

---

## 10. Scaling Concepts (Good to Know)

- **Vertical scaling** = resize Droplet to bigger plan (more CPU/RAM). Easy, has downtime.
- **Horizontal scaling** = multiple Droplets + **Load Balancer** distributing traffic. No downtime, more complex (need shared session storage like Redis, shared DB).
- **Snapshots** = backup image of a Droplet, useful before risky changes.
- **Monitoring** = DO has free built-in monitoring (CPU, memory, disk, bandwidth graphs + alerts).

---

## 11. CI/CD Basics (Automating Deployment)

Manual deployment workflow gets old fast. Common patterns:

1. **GitHub Actions → SSH deploy script**: on push to `main`, Action SSHs into Droplet, pulls latest code, runs `npm install && pm2 restart`.
2. **DO App Platform**: built-in CI/CD — auto-deploys on push, no extra setup.
3. **Docker + Container Registry**: build Docker image → push to DO Container Registry → pull & run on Droplet or DOKS.

Simple GitHub Actions deploy script idea:
```yaml
# .github/workflows/deploy.yml
- name: Deploy to Droplet
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.DROPLET_IP }}
    username: deployuser
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd your-repo
      git pull origin main
      npm install
      pm2 restart mern-backend
```

---

## 12. Common MERN Deployment Architecture on DigitalOcean

```
User → Domain (DNS) → Droplet (Ubuntu)
                          │
                          ├── Nginx (port 80/443, SSL via Certbot)
                          │      ├── Serves React build (static)
                          │      └── Reverse proxy /api → Node/Express (PM2, port 5000)
                          │
                          └── MongoDB Atlas (or DO Managed MongoDB) — external DB
```

---

## 13. Quick Command Cheat Sheet

```bash
# SSH into droplet
ssh deployuser@droplet_ip

# PM2
pm2 start server.js --name app
pm2 restart app
pm2 stop app
pm2 logs app
pm2 list

# Nginx
nginx -t                      # test config
systemctl restart nginx
systemctl status nginx

# Firewall (UFW)
ufw status
ufw allow 443

# SSL renewal (auto, but to test)
certbot renew --dry-run

# Check running processes / ports
netstat -tulpn | grep LISTEN
```

---

## 14. Pricing Mental Model

- Droplets: starts ~$4-6/mo (1 vCPU, 1GB RAM) — fine for personal/small projects.
- Bandwidth: each Droplet includes free outbound transfer (e.g., 1TB+), overage billed.
- Managed DB: starts ~$15/mo (more than self-hosted, but saves DevOps time).
- Spaces: ~$5/mo for 250GB storage + 1TB transfer, includes CDN.
- Billing is by the hour, capped at the monthly rate — destroy a Droplet anytime to stop charges.

---

## 15. Key Interview/Recall Points (TL;DR)

- **Droplet** = your own Linux VPS; full control via SSH.
- **PM2** = keeps Node app alive (process manager, auto-restart).
- **Nginx** = reverse proxy + serves React static build + handles SSL termination.
- **Certbot** = free auto SSL (Let's Encrypt).
- **UFW + Cloud Firewall** = security, only open ports 22/80/443.
- **App Platform** = PaaS alternative, no server management, push-to-deploy.
- **Managed Database** = optional hosted Mongo/Postgres, alternative to Atlas.
- **Spaces** = S3-compatible storage for file uploads.
- **DNS (A record)** = connect custom domain to Droplet IP.
- **Load Balancer** = horizontal scaling across multiple Droplets.
- Typical MERN flow: Droplet → Node setup → clone repo → env vars → PM2 → Nginx → domain → SSL.
