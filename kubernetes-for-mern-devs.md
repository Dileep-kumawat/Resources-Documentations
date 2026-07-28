# Kubernetes for MERN Stack Developers — Quick Recall Notes

## 1. Why Kubernetes (the "why bother" in MERN terms)
- Docker Compose runs containers on **one machine**. Kubernetes (K8s) runs containers across **many machines (a cluster)**, with auto-restart, auto-scaling, load balancing, and zero-downtime deploys.
- Mental model: Compose = "run my app." K8s = "keep my app running, no matter what."
- Your MERN app pieces map like this:
  - React build → served via Nginx container (static files) OR via a Node SSR server
  - Node/Express API → containerized backend
  - MongoDB → either containerized (StatefulSet) or, more commonly in prod, an external managed DB (Atlas) — K8s just connects to it

---

## 2. Core Building Blocks (the vocabulary)

| Term | What it is | MERN analogy |
|---|---|---|
| **Cluster** | Set of machines (nodes) running K8s | Your whole server fleet |
| **Node** | A single machine (VM/physical) in the cluster | One EC2 instance |
| **Pod** | Smallest deployable unit; wraps 1+ containers | One running `docker run` of your API container |
| **Container** | Same as Docker container | `node` or `nginx` image instance |
| **Deployment** | Manages a set of identical Pods, handles rollouts/rollbacks | "Keep 3 copies of my Express API running" |
| **ReplicaSet** | Ensures N pod replicas exist (managed by Deployment, rarely touched directly) | Auto-healing for pods |
| **Service** | Stable network endpoint to reach a group of Pods | Like an internal load balancer / DNS name for your API |
| **Ingress** | Routes external HTTP(S) traffic into the cluster, with paths/domains | Like Nginx reverse proxy + routing rules |
| **ConfigMap** | Non-secret config data (key-value) | Your `.env` (non-sensitive vars) |
| **Secret** | Sensitive config data (base64-encoded, not encrypted by default) | DB passwords, JWT secrets |
| **Namespace** | Virtual cluster partition | `dev`, `staging`, `prod` separation |
| **Volume / PersistentVolume (PV) / PersistentVolumeClaim (PVC)** | Storage that survives pod restarts | Where MongoDB data actually lives |
| **StatefulSet** | Like Deployment but for stateful apps needing stable identity/storage | Used for MongoDB if self-hosting |
| **kubectl** | CLI to talk to the cluster | Your main daily tool |
| **kubeconfig** | File with cluster connection/auth info | Like AWS credentials file |

---

## 3. The Mental Flow (how it all connects)

```
Image (Docker) 
   → Pod (runs the container)
       → Deployment (manages multiple Pods, handles updates)
           → Service (gives Pods a stable internal address)
               → Ingress (exposes Service to the internet, with routing)
```

Config & secrets are injected into Pods via ConfigMaps/Secrets.
Data persists via Volumes/PVCs, independent of Pod lifecycle.

---

## 4. YAML — the language of K8s
Everything is declared in YAML manifests. You describe the **desired state**; K8s makes it happen (reconciliation loop).

### Example: Deployment for your Express API
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mern-api
  template:
    metadata:
      labels:
        app: mern-api
    spec:
      containers:
        - name: mern-api
          image: yourdockerhub/mern-api:latest
          ports:
            - containerPort: 5000
          envFrom:
            - configMapRef:
                name: mern-api-config
            - secretRef:
                name: mern-api-secrets
```

### Example: Service exposing it internally
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mern-api-service
spec:
  selector:
    app: mern-api   # must match Deployment's pod labels
  ports:
    - port: 80
      targetPort: 5000
  type: ClusterIP   # internal only (default)
```

### Service types — important distinction
| Type | Use case |
|---|---|
| `ClusterIP` | Default; internal-only access (e.g., API talking to itself) |
| `NodePort` | Exposes on a static port on each node (dev/testing) |
| `LoadBalancer` | Cloud provider spins up a real LB (prod, e.g. on AWS/GCP) |

### Example: Ingress (routing `/api` to backend, `/` to frontend)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mern-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: myapp.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: mern-api-service
                port: { number: 80 }
          - path: /
            pathType: Prefix
            backend:
              service:
                name: mern-frontend-service
                port: { number: 80 }
```

### Example: ConfigMap & Secret
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mern-api-config
data:
  NODE_ENV: production
  PORT: "5000"
---
apiVersion: v1
kind: Secret
metadata:
  name: mern-api-secrets
type: Opaque
data:
  MONGO_URI: <base64-encoded-value>
  JWT_SECRET: <base64-encoded-value>
```
> Generate base64: `echo -n "yourvalue" | base64`
> Note: Secrets are base64-**encoded**, not encrypted — don't commit them to git as-is. Use sealed-secrets or external secret managers in real prod.

---

## 5. MongoDB on K8s — two real options
1. **Use MongoDB Atlas (managed, external)** — recommended for most teams. K8s pods just connect via `MONGO_URI` secret. No StatefulSet needed. Simpler, less ops burden.
2. **Self-host with StatefulSet + PVC** — only if you need full control:
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
spec:
  serviceName: mongo
  replicas: 1
  selector:
    matchLabels: { app: mongo }
  template:
    metadata:
      labels: { app: mongo }
    spec:
      containers:
        - name: mongo
          image: mongo:7
          ports: [{ containerPort: 27017 }]
          volumeMounts:
            - name: mongo-data
              mountPath: /data/db
  volumeClaimTemplates:
    - metadata: { name: mongo-data }
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests: { storage: 5Gi }
```

---

## 6. Daily-use `kubectl` Commands (cheat sheet)
```bash
# Cluster/context
kubectl cluster-info
kubectl config get-contexts
kubectl config use-context <name>

# Apply / view resources
kubectl apply -f deployment.yaml      # create/update from file
kubectl get pods                      # list pods
kubectl get deployments
kubectl get services
kubectl get all                       # everything in current namespace

# Debugging
kubectl describe pod <pod-name>       # detailed info / events
kubectl logs <pod-name>               # view logs
kubectl logs -f <pod-name>            # follow/stream logs
kubectl exec -it <pod-name> -- sh     # shell into a container

# Scaling
kubectl scale deployment mern-api --replicas=5

# Rollouts
kubectl rollout status deployment mern-api
kubectl rollout undo deployment mern-api   # rollback

# Cleanup
kubectl delete -f deployment.yaml
kubectl delete pod <pod-name>         # K8s auto-recreates it (if managed by Deployment)

# Namespaces
kubectl get pods -n staging
kubectl create namespace staging
```

---

## 7. Local Dev Tools (so you don't need a cloud cluster to learn)
- **Minikube** — single-node local cluster, good for learning.
- **kind** (Kubernetes in Docker) — lightweight, fast, great for CI.
- **Docker Desktop's built-in K8s** — easiest if you already use Docker Desktop.
- **k9s** — terminal UI for navigating cluster resources visually (huge time-saver).

---

## 8. Typical MERN Deployment Architecture on K8s
```
Internet
   │
Ingress (myapp.com)
   ├── /api/*  → mern-api-service → mern-api Deployment (Node/Express pods)
   └── /*      → mern-frontend-service → mern-frontend Deployment (Nginx serving React build)

mern-api pods → connect via Secret (MONGO_URI) → MongoDB Atlas (external) 
                                                  OR mongo-service → MongoDB StatefulSet (internal)
```

---

## 9. Health Checks (K8s needs to know if your app is alive)
```yaml
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```
- **Liveness**: "Is the container alive? If not, restart it."
- **Readiness**: "Is it ready to receive traffic? If not, remove from Service temporarily."
- You need a simple `/health` route in your Express app returning `200 OK`.

---

## 10. Resource Limits (avoid one pod hogging the node)
```yaml
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
```

---

## 11. CI/CD Flow (how code reaches K8s)
1. Push code → CI builds Docker image → pushes to registry (Docker Hub/ECR/GCR)
2. CI updates the Deployment's image tag (`kubectl set image` or GitOps tool)
3. K8s does a **rolling update**: spins up new pods, waits for readiness, then kills old pods → zero downtime
4. Tools that help: GitHub Actions, ArgoCD (GitOps), Helm (templating manifests)

---

## 12. Helm (package manager for K8s) — just know it exists
- Lets you template YAML with variables (like `values.yaml`) instead of hand-editing every manifest per environment.
- `helm install myapp ./mychart` deploys a whole templated set of resources.
- Worth learning once comfortable with raw YAML — don't start here.

---

## 13. Common Beginner Pitfalls
- Forgetting `selector` in Service must match Pod `labels` exactly → "service has no endpoints" error.
- Using `latest` image tag in prod → K8s may not pull new image; always use specific tags (`v1.2.3`).
- Storing secrets in plain ConfigMaps instead of Secrets.
- Not setting resource limits → one pod can crash the whole node.
- Confusing `Deployment` (stateless apps) with `StatefulSet` (stateful apps like databases).
- Expecting `kubectl delete pod` to "delete the app" — Deployment just recreates it immediately.

---

## 14. Quick Glossary Recap (for 30-second refresh)
- **Pod** = smallest unit, holds container(s)
- **Deployment** = keeps desired number of Pods running, handles updates
- **Service** = stable address to reach Pods
- **Ingress** = external traffic router (like Nginx for the whole cluster)
- **ConfigMap/Secret** = env vars / sensitive env vars
- **PVC** = persistent storage for stateful pods (e.g., DB)
- **Namespace** = environment separation (dev/staging/prod)
- **kubectl** = your CLI remote control for everything above

---

## 15. Suggested Learning Path (if revisiting deeply later)
1. Install Docker Desktop K8s or Minikube → install `k9s`
2. Containerize your MERN app (Dockerfiles for client + server) if not done already
3. Write Deployment + Service for the API → `kubectl apply` → verify with `k9s`
4. Add ConfigMap/Secret for env vars
5. Add frontend Deployment + Service (Nginx serving React build)
6. Add Ingress to route both under one domain
7. Connect to MongoDB Atlas via Secret (skip self-hosting Mongo initially)
8. Add liveness/readiness probes
9. Try scaling (`kubectl scale`) and a rolling update (change image tag, `kubectl apply`)
10. Once comfortable, explore Helm and a managed cluster (EKS/GKE/AKS) or DigitalOcean Kubernetes (cheapest to experiment with)
