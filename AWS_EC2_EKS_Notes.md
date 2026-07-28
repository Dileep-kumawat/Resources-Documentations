# AWS for MERN Stack Developers — EC2 & EKS Notes

---

## 1. EC2 (Elastic Compute Cloud)

### What it is
A **virtual server in the cloud**. Think of it as renting a remote computer where you install Node.js, MongoDB (or connect to Atlas), Nginx, etc. — basically a VPS.

### Core Concepts

| Term | Meaning |
|---|---|
| **Instance** | A single virtual machine |
| **AMI (Amazon Machine Image)** | The OS template (Ubuntu, Amazon Linux, etc.) used to launch an instance |
| **Instance Type** | Hardware spec, e.g. `t2.micro` (free tier), `t3.medium`. Format: `family.size` |
| **Key Pair** | SSH credentials (`.pem` file) to log into the instance |
| **Security Group** | Virtual firewall — controls inbound/outbound traffic (ports) |
| **Elastic IP** | A static public IP you can attach/detach from instances |
| **EBS (Elastic Block Store)** | Persistent disk storage attached to an instance |
| **VPC** | Virtual network your instance lives in (subnets, route tables) |

### Typical MERN Deployment Flow on EC2
1. Launch instance (Ubuntu AMI, `t2.micro` for free tier).
2. Configure **Security Group**: open ports
   - `22` (SSH)
   - `80` (HTTP)
   - `443` (HTTPS)
   - `5000`/`3000` (if testing app port directly)
3. SSH into instance:
   ```bash
   chmod 400 mykey.pem
   ssh -i "mykey.pem" ubuntu@<public-ip>
   ```
4. Install dependencies:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs nginx git
   ```
5. Clone repo, install packages, run app:
   ```bash
   git clone <repo-url>
   cd project && npm install
   ```
6. Use **PM2** to keep Node app alive:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name myapp
   pm2 startup && pm2 save
   ```
7. Use **Nginx** as reverse proxy (port 80 → 5000):
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```
8. (Optional) HTTPS via **Certbot** (Let's Encrypt).
9. MongoDB: usually **don't self-host** — use **MongoDB Atlas** and just whitelist EC2's IP, or allow `0.0.0.0/0` (not for prod).

### Key Gotchas
- Stopping vs Terminating: **Stop** = pause, billed for storage only, IP may change. **Terminate** = permanently deleted.
- Free tier = `t2.micro`/`t3.micro`, 750 hrs/month for 12 months only.
- Environment variables: use `.env` + `dotenv`, or AWS **Systems Manager Parameter Store** for secrets.
- Always restrict SSH (port 22) to your IP, not `0.0.0.0/0`.
- Auto Scaling Group + Load Balancer = scale EC2 horizontally (advanced, multi-instance setup).

### When to use EC2
- Single server / simple deployments.
- Full control over OS, custom configs.
- Cheaper for small/steady workloads vs managed services.
- **Downside**: you manage OS updates, scaling, downtime, security patches manually.

---

## 2. EKS (Elastic Kubernetes Service)

### What it is
AWS's **managed Kubernetes** service. Kubernetes (K8s) = orchestration system to run, scale, and manage **containerized apps** (Docker containers) automatically across multiple machines.

> Mental model: EC2 = one server you SSH into. EKS = a fleet of servers where Kubernetes automatically decides where your containers run, restarts them if they crash, and scales them.

### Why MERN devs care
If you containerize your app with **Docker**, EKS lets you:
- Run frontend, backend, and microservices as separate containers/pods.
- Auto-restart crashed containers.
- Auto-scale based on traffic.
- Do zero-downtime deployments (rolling updates).

### Core Kubernetes Concepts (needed before EKS makes sense)

| Term | Meaning |
|---|---|
| **Container** | Packaged app + dependencies (built via Docker) |
| **Pod** | Smallest deployable unit in K8s — wraps one (or few) containers |
| **Node** | A worker machine (EC2 instance) running pods |
| **Cluster** | Set of nodes managed together (control plane + worker nodes) |
| **Deployment** | Defines how many pod replicas to run, manages rolling updates |
| **Service** | Stable network endpoint to expose pods (internally or externally) |
| **Ingress** | Routes external HTTP traffic to services (like Nginx reverse proxy, but K8s-native) |
| **ConfigMap / Secret** | Store env variables / sensitive data separately from code |
| **kubectl** | CLI tool to talk to your cluster |
| **YAML manifests** | Config files describing your desired cluster state (declarative) |

### EKS-specific Pieces
- **Control Plane**: managed by AWS (you don't see/manage the master nodes) — this is what "EKS" actually charges for (~$0.10/hr flat fee).
- **Node Group**: the actual EC2 instances (or Fargate) that run your pods — you choose instance type/size.
- **Fargate option**: serverless — no EC2 nodes to manage, AWS runs containers directly (more expensive per-pod but zero server management).
- **ECR (Elastic Container Registry)**: AWS's Docker image registry — push your Docker images here before deploying.

### Typical MERN-on-EKS Flow
1. **Dockerize** frontend & backend:
   ```dockerfile
   # backend Dockerfile example
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```
2. Build & push image to **ECR**:
   ```bash
   docker build -t mern-backend .
   aws ecr create-repository --repository-name mern-backend
   docker tag mern-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/mern-backend
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/mern-backend
   ```
3. Create EKS cluster (commonly via **eksctl**, the easiest CLI tool):
   ```bash
   eksctl create cluster --name mern-cluster --region ap-south-1 \
     --nodegroup-name standard-workers --node-type t3.medium --nodes 2
   ```
4. Write a **Deployment** manifest (`deployment.yaml`):
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: backend-deployment
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: backend
     template:
       metadata:
         labels:
           app: backend
       spec:
         containers:
         - name: backend
           image: <account-id>.dkr.ecr.<region>.amazonaws.com/mern-backend
           ports:
           - containerPort: 5000
   ```
5. Write a **Service** manifest to expose it:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: backend-service
   spec:
     type: LoadBalancer
     selector:
       app: backend
     ports:
     - port: 80
       targetPort: 5000
   ```
6. Apply to cluster:
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   kubectl get pods
   kubectl get svc   # gives you the external LoadBalancer URL
   ```
7. MongoDB: still use **Atlas** (managed) — don't run stateful DBs in K8s unless you know what you're doing (needs PersistentVolumes, StatefulSets).

### When to use EKS
- Multiple microservices, need auto-scaling/self-healing.
- Team already uses Docker + wants production-grade orchestration.
- High-traffic apps needing zero-downtime deploys.
- **Downside**: steep learning curve, costs more (control plane fee + node costs + load balancer costs), overkill for small/simple MERN apps.

---

## 3. EC2 vs EKS — Quick Decision Table

| Scenario | Use |
|---|---|
| Solo dev, single MERN app, low traffic | **EC2** (simple, cheap) |
| Learning/portfolio project | **EC2** or even simpler: Render/Vercel/Railway |
| Multiple microservices, need scaling | **EKS** |
| Team with DevOps experience, production SaaS | **EKS** |
| Just want it live quickly without infra hassle | Neither — use **Elastic Beanstalk**, **ECS Fargate**, or PaaS (Render/Vercel) |

---

## 4. Quick Command Cheat Sheet

**EC2 (SSH & basics)**
```bash
ssh -i key.pem ubuntu@<ip>          # connect
pm2 list / pm2 logs / pm2 restart   # manage node process
sudo systemctl status nginx         # check nginx
sudo ufw allow 80,443,22            # firewall (if using ufw)
```

**Docker**
```bash
docker build -t app .
docker run -p 5000:5000 app
docker images / docker ps
```

**kubectl (EKS)**
```bash
kubectl get nodes
kubectl get pods
kubectl get svc
kubectl describe pod <name>
kubectl logs <pod-name>
kubectl delete -f deployment.yaml
kubectl scale deployment backend-deployment --replicas=4
```

**eksctl**
```bash
eksctl create cluster ...
eksctl delete cluster --name mern-cluster   # IMPORTANT: delete when done, avoid charges
```

---

## 5. Things to Remember (Exam/Interview Recall)

- **EC2 = VM rental**, you manage everything (OS, scaling, patches).
- **EKS = managed Kubernetes control plane**; you still manage/pay for worker nodes (EC2 or Fargate).
- **Kubernetes terms**: Pod (smallest unit) → Deployment (manages pods) → Service (exposes pods) → Ingress (routes external traffic).
- **ECR** = Docker image storage on AWS (push before EKS can pull).
- Always use **MongoDB Atlas** for DB in both setups — don't self-host Mongo in EC2/EKS for production.
- **PM2** = process manager for EC2 deployments (keeps Node app running, auto-restart).
- **Nginx** = reverse proxy on EC2 (maps port 80 → your app's port, handles SSL).
- Cost control: **terminate EC2** / **delete EKS cluster** when not in use — EKS control plane bills even when idle.
- Security: never leave SSH (22) or DB ports open to `0.0.0.0/0` in production.

---

## 6. Suggested Practice Path
1. Deploy a basic MERN app on a single EC2 instance manually (SSH + PM2 + Nginx).
2. Dockerize the same app (frontend + backend Dockerfiles).
3. Run it locally with `docker-compose`.
4. Push images to ECR.
5. Spin up a small EKS cluster with `eksctl`, deploy via `kubectl`.
6. Tear down the cluster (`eksctl delete cluster`) to avoid charges.
