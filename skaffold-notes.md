# Skaffold — Quick Recall Notes (for MERN stack devs)

## 1. What is Skaffold & Why it exists
Skaffold is a **CLI tool by Google** that automates the workflow for building, pushing, and deploying applications on **Kubernetes**. It removes the manual cycle of: code change → build image → push to registry → update k8s manifest → redeploy.

**For a MERN stack dev**, think of it as the "nodemon / hot-reload" experience, but for a multi-container app (React frontend, Node/Express backend, MongoDB) running inside Kubernetes (Minikube, Kind, Docker Desktop k8s, or a cloud cluster).

**Core problem it solves:** Without Skaffold, every code change means: rebuild Docker image → tag it → push → `kubectl apply` / `kubectl rollout restart`. Skaffold automates this whole loop with one command: `skaffold dev`.

---

## 2. Core Concepts (Mental Model)

| Concept | What it means |
|---|---|
| **Build** | Skaffold builds your Docker images (frontend, backend) using Docker, Buildpacks, Jib, or Kaniko |
| **Tag** | Auto-tags images (git commit, timestamp, etc.) so k8s knows which version to pull |
| **Push** | Pushes images to a registry (or skips this for local clusters like Minikube) |
| **Deploy** | Applies your Kubernetes manifests (or Helm charts / Kustomize) to the cluster |
| **Watch/Sync** | Watches your source files; on change, rebuilds + redeploys (or **file-syncs** changed files directly into running pods without rebuild) |
| **Port-forward** | Auto forwards cluster ports to localhost so you can hit `localhost:3000`, `localhost:5000` etc. |

**The loop:** `Watch file changes → Build → Tag → Push (if needed) → Deploy → Port-forward → Stream logs` — repeats automatically in dev mode.

---

## 3. Installation
```bash
# macOS
brew install skaffold

# Linux
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
sudo install skaffold /usr/local/bin/

# Windows (choco)
choco install skaffold
```
Prerequisites: Docker installed, a running Kubernetes cluster (Minikube/Kind/Docker Desktop), `kubectl` configured and pointing to that cluster.

---

## 4. The `skaffold.yaml` File (Heart of Skaffold)

Lives at project root. Defines build + deploy config.

### Minimal MERN example structure
```yaml
apiVersion: skaffold/v4beta6
kind: Config
metadata:
  name: mern-app

build:
  artifacts:
    - image: mern-backend
      context: server          # folder containing backend Dockerfile
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.js'
            dest: .

    - image: mern-frontend
      context: client          # folder containing frontend Dockerfile
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{js,jsx,css}'
            dest: .

deploy:
  kubectl:
    manifests:
      - k8s/*.yaml             # backend.yaml, frontend.yaml, mongo.yaml, services etc.

portForward:
  - resourceType: service
    resourceName: backend-service
    port: 5000
    localPort: 5000
  - resourceType: service
    resourceName: frontend-service
    port: 3000
    localPort: 3000
```

### Key fields explained
- **`build.artifacts`**: list of images to build — for MERN, typically 2 (frontend + backend); MongoDB usually uses an existing public image (no build needed, just deploy).
- **`context`**: folder where the Dockerfile + source for that artifact lives.
- **`sync`**: enables **file sync** — copies changed files straight into the running container, skipping a full rebuild (huge speed boost for dev, especially for frontend static files).
- **`deploy.kubectl.manifests`**: path(s) to your raw k8s YAML files (Deployment, Service, etc.).
- **`portForward`**: auto port-forwarding, so you don't manually run `kubectl port-forward`.

---

## 5. Folder Structure (Typical MERN + Skaffold setup)
```
mern-app/
├── client/                # React app
│   ├── Dockerfile
│   └── src/
├── server/                # Node/Express app
│   ├── Dockerfile
│   └── src/
├── k8s/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── mongo-deployment.yaml
│   └── mongo-service.yaml
└── skaffold.yaml
```

---

## 6. Essential Commands

| Command | What it does |
|---|---|
| `skaffold dev` | **Dev mode** — watches files, auto build+deploy+sync, streams logs, port-forwards. Ctrl+C cleans up resources. |
| `skaffold run` | One-time build + deploy (no watching). Good for CI or "deploy once" scenarios. |
| `skaffold build` | Only builds & tags images (no deploy). |
| `skaffold deploy` | Only deploys (assumes images already built/pushed). |
| `skaffold delete` | Removes everything Skaffold deployed (cleanup). |
| `skaffold debug` | Like `dev` but configures containers for debugging (attaches debuggers, e.g. Node `--inspect`). |
| `skaffold render` | Outputs final rendered k8s manifests (with image tags substituted) without deploying — useful for GitOps. |
| `skaffold init` | Auto-generates a starter `skaffold.yaml` by scanning Dockerfiles in your repo. |

**Most used in daily MERN dev workflow:** `skaffold dev` — that's basically 90% of usage.

---

## 7. Dev Workflow in Practice (MERN)

1. Write Dockerfiles for `client/` and `server/`.
2. Write k8s manifests for frontend, backend, and MongoDB (Deployments + Services). Mongo can use a `PersistentVolumeClaim` for data persistence.
3. Write `skaffold.yaml` tying them together.
4. Run:
   ```bash
   skaffold dev --port-forward
   ```
5. Skaffold builds both images, deploys all manifests, forwards ports.
6. Edit a React component or an Express route → save → Skaffold detects change:
   - If `sync` rule matches → **file synced directly into pod** (instant, no rebuild).
   - If not (e.g. you changed `package.json` or Dockerfile) → **full rebuild + redeploy**.
7. Logs from all pods stream into your terminal in real time (color-coded per pod).
8. `Ctrl+C` → Skaffold tears down the deployed resources automatically (unless `--cleanup=false`).

---

## 8. Useful Flags
```bash
skaffold dev --port-forward          # ensure port forwarding always on
skaffold dev --no-prune=false        # control cleanup of dangling images
skaffold dev -p dev                  # use a named "profile" (e.g. dev vs prod config)
skaffold run -p prod                 # deploy using prod profile
skaffold dev --default-repo=<repo>   # set image registry prefix (e.g. for pushing to Docker Hub/GCR)
```

---

## 9. Profiles (Dev vs Prod configs in one file)
```yaml
profiles:
  - name: prod
    build:
      artifacts:
        - image: mern-backend
          docker:
            dockerfile: Dockerfile.prod
    deploy:
      kubectl:
        manifests:
          - k8s/prod/*.yaml
```
Run with: `skaffold run -p prod`
→ Lets you keep one repo with different build/deploy configs for local dev vs staging/prod, instead of duplicating everything.

---

## 10. Local Cluster Notes (Important for MERN local dev)
- **Minikube**: Skaffold can build images directly into Minikube's Docker daemon (no registry push needed) — set `eval $(minikube docker-env)` or Skaffold detects this automatically in many setups.
- **Kind**: similar — Skaffold can load images into the Kind cluster directly.
- **Docker Desktop Kubernetes**: shares the same Docker daemon, so builds are immediately available to the cluster — no push step needed.
- For **cloud clusters** (GKE, EKS, AKS): you DO need a real registry — set `build.local.push: true` or use `--default-repo` to push images to Docker Hub/ECR/GCR/ACR.

---

## 11. MongoDB in this setup
- Usually **not built** by Skaffold (just deployed) — use the official `mongo` image directly in a Deployment manifest.
- Use a `Service` (ClusterIP) named e.g. `mongo-service` so backend can connect via `mongodb://mongo-service:27017/dbname`.
- Use a `PersistentVolumeClaim` so data isn't lost on pod restarts.
- For pure local dev simplicity, some devs skip Mongo-in-k8s and just point backend to MongoDB Atlas (cloud) via env var/secret — also valid, simplifies the manifest set.

---

## 12. Common Gotchas
- **Image pull errors locally** → forgot to build into the cluster's Docker context (Minikube/Kind) or forgot `imagePullPolicy: Never`/`IfNotPresent` in manifests for local images.
- **Sync not triggering, full rebuild every time** → sync glob pattern in `skaffold.yaml` doesn't match changed file paths; double-check `src` patterns.
- **Port-forward conflicts** → another local process already using that port (e.g. local Mongo also on 27017).
- **Env vars / secrets** (DB URI, JWT secret) → handle via k8s `ConfigMap`/`Secret`, referenced in Deployment YAML — Skaffold doesn't manage secrets itself.
- **CORS issues** between forwarded frontend/backend ports → same as normal MERN dev, configure CORS in Express as usual.

---

## 13. Skaffold vs Alternatives (Quick Comparison)
| Tool | Purpose |
|---|---|
| **Docker Compose** | Simpler, container-only (no k8s); good for pure local dev without k8s |
| **Skaffold** | k8s-native dev loop automation; bridges local dev → k8s production parity |
| **Tilt** | Similar goal to Skaffold, different config style (Tiltfile, Python-like) |
| **Helm** | Package manager for k8s manifests — Skaffold can deploy via Helm charts instead of raw kubectl manifests (`deploy.helm` instead of `deploy.kubectl`) |

**Why use Skaffold over Docker Compose for MERN?** If your production target is Kubernetes, Skaffold gives you dev/prod parity (same manifests, same orchestration model) instead of maintaining separate Compose files and k8s files.

---

## 14. One-Line Summary to Remember
> **Skaffold = "nodemon for your whole Kubernetes-deployed MERN stack"** — it watches your client/server code, rebuilds/syncs the right Docker images, redeploys to your cluster, and forwards ports — all triggered by one command: `skaffold dev`.

---

## 15. Quick Cheat Sheet
```bash
skaffold init                 # generate starter config
skaffold dev --port-forward   # daily dev loop
skaffold run                  # one-shot deploy
skaffold build                # build only
skaffold delete                # teardown
skaffold render                # output final manifests (GitOps)
```
