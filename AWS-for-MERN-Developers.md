# AWS for MERN Stack Developers — Revision Notes

> Goal: deploy, scale, and secure a MERN (MongoDB/Mongo-Atlas, Express, React, Node) app on AWS.

---

## 1. Core Mental Model

AWS = rented infrastructure pieces you wire together.

| MERN Piece | AWS Equivalent(s) |
|---|---|
| React frontend (static build) | S3 + CloudFront |
| Node/Express API | EC2 / Elastic Beanstalk / ECS (Fargate) / Lambda + API Gateway |
| MongoDB | DocumentDB (Mongo-compatible) or keep MongoDB Atlas, hosted outside AWS |
| File uploads | S3 |
| Auth secrets/env vars | Secrets Manager / Systems Manager Parameter Store |
| Domain + HTTPS | Route 53 + ACM (certificates) + CloudFront/ALB |
| CI/CD | CodePipeline/CodeBuild, or GitHub Actions deploying to AWS |
| Logs/monitoring | CloudWatch |
| Scaling | Auto Scaling Groups / ECS Service / Lambda (auto) |

---

## 2. IAM (Identity and Access Management)

- **Root account**: never use day-to-day. Lock it, enable MFA.
- **IAM Users**: individual people/services with credentials.
- **IAM Roles**: temporary permissions assumed by AWS resources (e.g., an EC2 instance assuming a role to access S3) — preferred over hardcoding keys.
- **IAM Policies**: JSON documents defining allowed/denied actions on resources.
- **Principle of least privilege**: give only the permissions needed.
- Never put AWS access keys in frontend code or commit to git — use `.env` + Secrets Manager.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

---

## 3. EC2 (Elastic Compute Cloud) — Virtual Servers

Use case: host your Node/Express backend like a traditional VPS.

- **AMI**: machine image (OS + software) used to launch instance (e.g., Ubuntu).
- **Instance type**: size of server (e.g., `t2.micro` — free tier, `t3.medium`).
- **Key pair**: SSH access (`.pem` file). Connect: `ssh -i key.pem ubuntu@<public-ip>`
- **Security Group**: virtual firewall — open ports (22 SSH, 80 HTTP, 443 HTTPS, 5000 for Node).
- **Elastic IP**: static public IP (so IP doesn't change on reboot).
- Typical deployment steps:
  1. Launch EC2, SSH in.
  2. Install Node, nginx, pm2.
  3. Clone repo, `npm install`, set `.env`.
  4. Run app with **pm2** (`pm2 start server.js`) so it survives crashes/reboots.
  5. Use **nginx** as reverse proxy: forward port 80/443 → Node's 5000.
  6. Add SSL via **Certbot** (Let's Encrypt) or use ACM + Load Balancer.
- EC2 = full control but you manage OS updates, scaling, patching yourself.

---

## 4. S3 (Simple Storage Service) — Object Storage

Use cases for MERN:
- Hosting the **React build** as a static website.
- Storing **user-uploaded files** (images, PDFs) instead of saving on server disk.

Key concepts:
- **Bucket**: container for objects (globally unique name).
- **Object**: file + metadata, identified by a key (path-like string).
- **Bucket Policy**: JSON rules controlling public/private access.
- **Static website hosting**: enable in bucket properties; point `index.html`.
- **Presigned URLs**: generate a temporary URL letting frontend upload/download directly to/from S3 without exposing credentials — very common pattern for MERN file uploads.

```js
// Node backend generating presigned upload URL
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });
const command = new PutObjectCommand({ Bucket: "my-bucket", Key: "uploads/file.png" });
const url = await getSignedUrl(s3, command, { expiresIn: 60 });
```

- Storage classes: Standard, Infrequent Access, Glacier (archival/cheap, slow retrieval).

---

## 5. CloudFront — CDN

- Caches content (S3 static site, API responses) at edge locations worldwide → faster load, lower latency.
- Sits in front of S3 bucket or ALB.
- Provides HTTPS via **ACM** certificates.
- Use it in front of your React S3 bucket for production frontend hosting.

**Typical static frontend deployment pipeline:**
`React build → S3 bucket → CloudFront distribution → Route 53 domain`

---

## 6. Route 53 — DNS

- Register/manage domain names.
- Create records: **A** (point to IP/ALB), **CNAME** (alias to another domain), **Alias** (AWS-specific, points to S3/CloudFront/ALB for free).
- Health checks + routing policies (failover, weighted, latency-based) for advanced setups.

---

## 7. RDS vs DocumentDB vs Keeping MongoDB Atlas

- **RDS**: managed relational DB (Postgres/MySQL) — only relevant if you pivot from Mongo.
- **DocumentDB**: AWS's MongoDB-compatible managed database. Works with Mongoose mostly, but not 100% feature-identical to real MongoDB.
- **Common real-world practice**: most MERN devs just keep using **MongoDB Atlas** (its own cloud, can be hosted on AWS infra under the hood) and connect from EC2/Lambda via connection string + IP allowlist or VPC peering. Simpler than migrating to DocumentDB.

---

## 8. Lambda + API Gateway — Serverless Backend

Alternative to running Express on EC2 — pay only per request, auto-scales, no server management.

- **Lambda**: run backend code (a function) without managing servers. Can wrap an entire Express app using `serverless-http`.
- **API Gateway**: creates HTTP endpoints that trigger Lambda functions.
- Cold starts: first invocation after idle is slower.
- Good for: small APIs, spiky traffic, MVPs. Less ideal for: long-running connections (websockets need API Gateway WebSocket support), heavy persistent state.

```js
// Wrapping Express app for Lambda
import serverless from "serverless-http";
import app from "./app.js";
export const handler = serverless(app);
```

- Frameworks that simplify this: **Serverless Framework**, **AWS SAM**, **AWS CDK**.

---

## 9. Elastic Beanstalk — Easiest "PaaS-like" Option

- You upload code (zip with `package.json`), Beanstalk handles EC2, load balancer, scaling, deployments automatically.
- Good middle ground between raw EC2 and full serverless — less config than EC2, more control than Lambda.
- Supports Node.js platform natively. Good for beginners deploying Express APIs quickly.

---

## 10. ECS / Fargate — Containers (Docker)

- If your MERN app is Dockerized:
  - **ECS (Elastic Container Service)**: orchestrates containers.
  - **Fargate**: serverless compute for containers (no EC2 management).
  - **ECR (Elastic Container Registry)**: stores your Docker images (like Docker Hub, but AWS).
- Flow: `Dockerfile → build image → push to ECR → ECS Service runs it → ALB routes traffic`.
- Good when you want containerized consistency between dev/prod and more control than Lambda but less ops than raw EC2.

---

## 11. Load Balancing & Scaling

- **ALB (Application Load Balancer)**: distributes incoming traffic across multiple EC2/ECS instances; handles HTTPS termination.
- **Auto Scaling Group (ASG)**: automatically adds/removes EC2 instances based on CPU/traffic.
- **Target Group**: set of instances the ALB forwards traffic to, with health checks.

---

## 12. Environment Variables & Secrets

- **Never** hardcode API keys, DB URIs, JWT secrets in code.
- **Systems Manager Parameter Store**: free, simple key-value storage for config.
- **Secrets Manager**: paid, auto-rotation support, better for DB credentials.
- On EC2: load via `.env` (use `dotenv`) populated at deploy time from Parameter Store.
- On Lambda: set environment variables directly in function config, or reference Secrets Manager at runtime.

---

## 13. CloudWatch — Monitoring & Logs

- **CloudWatch Logs**: collects console.log/error output from Lambda, EC2 (via agent), ECS.
- **CloudWatch Metrics**: CPU, memory, request count, latency dashboards.
- **CloudWatch Alarms**: trigger notifications (via SNS) when thresholds breached (e.g., CPU > 80%).
- Essential for debugging production issues without SSH-ing in every time.

---

## 14. SES (Simple Email Service) & SNS (Simple Notification Service)

- **SES**: send transactional emails (signup confirmation, password reset) from Node backend — replaces Nodemailer+Gmail in production.
- **SNS**: pub/sub messaging — push notifications, SMS, or triggering Lambda from events.
- **SQS (Simple Queue Service)**: message queue for decoupling services (e.g., offload heavy/background jobs from your Express API).

---

## 15. VPC (Virtual Private Cloud) — Networking Basics

- Your own isolated network within AWS.
- **Subnets**: public (internet-facing, has EC2/ALB) vs private (DB, no direct internet — more secure).
- **Internet Gateway**: lets public subnet reach internet.
- **NAT Gateway**: lets private subnet resources (e.g., DB) make outbound calls without being publicly reachable.
- For most beginner MERN deployments, default VPC is fine; learn custom VPCs once you need DB isolation/security hardening.

---

## 16. CI/CD on AWS

Two common approaches:

**A. GitHub Actions → AWS (most popular for MERN devs)**
- On push to `main`: build React, run tests, deploy to S3+CloudFront (frontend) and SSH/deploy script or ECS update (backend).
- Use `aws-actions/configure-aws-credentials` with IAM role.

**B. Native AWS CI/CD**
- **CodeCommit** (git repo, rarely used now — most use GitHub) →
- **CodeBuild** (runs build/test commands, like a Dockerfile for builds) →
- **CodeDeploy** (deploys to EC2/ECS/Lambda) →
- **CodePipeline** (orchestrates the above stages).

---

## 17. AWS Amplify — Frontend-Focused All-in-One

- Great for React apps: connect GitHub repo → auto build & deploy → custom domain + HTTPS, all managed.
- Also offers backend features (auth via Cognito, GraphQL API, storage) if you want a lower-code approach instead of hand-building Express APIs.
- Good shortcut for hosting just the React frontend without manually configuring S3+CloudFront.

---

## 18. Typical Full MERN-on-AWS Deployment Recipe (Simple Path)

1. **Frontend**: `npm run build` → upload `/build` to S3 → CloudFront distribution → Route 53 domain (or just use Amplify Hosting for one-click).
2. **Backend**: Dockerize Express app → push to ECR → run on ECS Fargate behind an ALB (or simpler: EC2 + pm2 + nginx for learning/small projects).
3. **Database**: keep MongoDB Atlas (separate, free tier available) OR DocumentDB inside the same VPC for tighter integration.
4. **File uploads**: S3 bucket + presigned URLs.
5. **Secrets**: Parameter Store / Secrets Manager, injected as env vars.
6. **Domain/SSL**: Route 53 + ACM certificate.
7. **CI/CD**: GitHub Actions deploying to S3 (frontend) and ECS/EC2 (backend) on every push to main.
8. **Monitoring**: CloudWatch logs + alarms.

---

## 19. Cost & Free Tier Notes

- Free tier (12 months for new accounts): `t2.micro`/`t3.micro` EC2, 5GB S3, 750 hrs/month RDS db.t2.micro, 1M Lambda requests/month free **forever**.
- Always set up a **Billing Alarm** in CloudWatch to avoid surprise charges.
- Shut down/terminate unused EC2 instances — they bill even when idle (unlike Lambda).

---

## 20. Quick Glossary (Cheat Sheet)

| Term | One-liner |
|---|---|
| EC2 | Rented virtual server |
| S3 | File/object storage |
| Lambda | Run code without managing a server |
| API Gateway | Creates HTTP endpoints for Lambda |
| RDS | Managed SQL database |
| DocumentDB | Managed MongoDB-compatible database |
| VPC | Your private network in AWS |
| IAM | Who can access what |
| CloudFront | CDN — caches content globally |
| Route 53 | DNS / domain management |
| ALB | Distributes traffic across servers |
| Auto Scaling | Adds/removes servers automatically |
| ECS/Fargate | Run Docker containers without managing servers |
| ECR | Stores Docker images |
| CloudWatch | Logs, metrics, alarms |
| SES | Send emails |
| SNS | Push notifications/pub-sub |
| SQS | Message queue |
| Secrets Manager | Securely store API keys/DB passwords |
| Amplify | Easy frontend (and backend) hosting/CI-CD for React |
| CodePipeline | AWS-native CI/CD orchestration |

---

### Suggested Learning Order (if revisiting from scratch)
IAM → EC2 → S3 → Security Groups → RDS/DocumentB(or stick w/ Atlas) → Route53 + CloudFront → Load Balancer/Auto Scaling → Lambda + API Gateway → Docker/ECS → CI/CD → CloudWatch/Secrets Manager.
