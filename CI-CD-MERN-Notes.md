# CI/CD Pipelines — MERN Stack Developer Notes

## 1. Core Concept (Quick Recall)
- **CI (Continuous Integration)**: Every code push → automatically build + test + lint. Goal: catch bugs early, keep `main` always deployable.
- **CD (Continuous Delivery/Deployment)**: 
  - **Delivery** = auto-build & test, but deploy needs manual approval.
  - **Deployment** = fully automatic, merge → live in production.
- **Pipeline** = sequence of automated stages (e.g., Install → Lint → Test → Build → Deploy).

---

## 2. Why CI/CD for MERN
- MongoDB, Express, React, Node = separate concerns but one repo (or monorepo) → need automated checks across frontend + backend.
- Prevents "works on my machine" issues.
- Enables fast, safe, frequent deployments (e.g., to Vercel/Netlify for React, Render/Railway/EC2 for Node API).

---

## 3. Typical MERN Pipeline Stages

```
Push/PR → Install deps → Lint (ESLint) → Test (Jest/Mocha) → Build (React build / TS compile) → Dockerize (optional) → Deploy
```

| Stage | Frontend (React) | Backend (Node/Express) |
|---|---|---|
| Install | `npm ci` | `npm ci` |
| Lint | ESLint, Prettier | ESLint |
| Test | Jest + React Testing Library | Jest/Mocha + Supertest |
| Build | `npm run build` (static files) | `tsc` if TypeScript |
| Deploy | Vercel/Netlify/S3+CloudFront | Render/Railway/Heroku/EC2/Docker |

> Use `npm ci` (not `npm install`) in pipelines — it's faster & uses `package-lock.json` exactly (reproducible builds).

---

## 4. Common Tools

| Category | Tools |
|---|---|
| CI/CD Platforms | **GitHub Actions** (most common for MERN), GitLab CI, CircleCI, Jenkins, Travis CI |
| Containerization | Docker, Docker Compose |
| Hosting (Frontend) | Vercel, Netlify, GitHub Pages, AWS S3+CloudFront |
| Hosting (Backend) | Render, Railway, Heroku, AWS EC2/Elastic Beanstalk, DigitalOcean |
| Database | MongoDB Atlas (cloud-managed, no manual pipeline needed) |
| Secrets Mgmt | GitHub Secrets, `.env` files (never commit!), AWS Secrets Manager |
| Testing | Jest, Mocha/Chai, Supertest, React Testing Library, Cypress (E2E) |

---

## 5. GitHub Actions — The Standard Choice
- Config lives in `.github/workflows/*.yml`
- Triggered by events: `push`, `pull_request`, `workflow_dispatch` (manual)

### Basic Example (Node/Express backend)
```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Lint
        run: npm run lint

      - name: Run Tests
        run: npm test
        env:
          MONGO_URI: ${{ secrets.MONGO_URI_TEST }}

      - name: Build
        run: npm run build
```

### Deploy Job (added after test passes)
```yaml
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```
> `needs:` ensures deploy only runs if tests pass. `if:` restricts to `main` branch only.

---

## 6. Monorepo Setup (client + server in one repo)
- Use **path filters** so frontend changes don't trigger backend pipeline & vice versa:
```yaml
on:
  push:
    paths:
      - 'client/**'
```
- Or use separate workflow files: `client-ci.yml` and `server-ci.yml`.
- Tools like **Turborepo** or **Nx** help manage build caching in monorepos.

---

## 7. Environment Variables & Secrets
- Never commit `.env` to Git → add to `.gitignore`.
- Store secrets in: GitHub repo → Settings → Secrets and variables → Actions.
- Access in workflow: `${{ secrets.SECRET_NAME }}`
- Common MERN secrets: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLOUDINARY_API_KEY`, deploy hooks/tokens.
- Use **separate test DB** (e.g., MongoDB Memory Server or a dedicated Atlas test cluster) — never run tests against production DB.

---

## 8. Docker in MERN CI/CD (optional but common in interviews)
- `Dockerfile` for backend:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```
- Pipeline builds image → pushes to Docker Hub/AWS ECR → deploy pulls latest image.
- `docker-compose.yml` useful locally to spin up Mongo + Node + React together.

---

## 9. Branching Strategy (ties into CI/CD)
- **Git Flow**: `main` (prod) ← `develop` ← `feature/*` branches.
- **Trunk-based**: everyone merges small changes directly into `main` frequently (common with strong CI).
- PRs trigger CI checks before merge is allowed (branch protection rules in GitHub).

---

## 10. Deployment Strategies (good to mention in interviews)
| Strategy | Description |
|---|---|
| Rolling | Replace instances gradually |
| Blue-Green | Two environments; switch traffic instantly after new one is verified |
| Canary | Release to small % of users first, then full rollout |
| Rollback | Keep previous build/image to revert quickly if deploy fails |

---

## 11. Quick Checklist for a Real MERN Project
- [ ] `package-lock.json` committed (for `npm ci`)
- [ ] Separate test/dev/prod env variables
- [ ] Lint + test run on every PR
- [ ] Branch protection on `main` (require CI pass before merge)
- [ ] Auto-deploy frontend (Vercel/Netlify) on merge to `main`
- [ ] Auto-deploy backend (Render/Railway) on merge to `main`
- [ ] MongoDB Atlas connection string in secrets, not code
- [ ] Build artifacts (React `dist`/`build`) not committed to Git
- [ ] Health-check endpoint (`/health`) for backend post-deploy verification

---

## 12. One-Line Interview Answer
> "I set up GitHub Actions workflows that install dependencies, lint, and run Jest tests on every PR to `main`. Once tests pass, the backend Express app deploys to Render via a deploy hook, and the React frontend auto-builds and deploys via Vercel. Secrets like `MONGO_URI` and `JWT_SECRET` are stored in GitHub Secrets, and branch protection rules ensure nothing merges without passing CI."

---

## 13. Common Pitfalls to Remember
- Forgetting `npm ci` vs `npm install` (cache issues, non-reproducible builds).
- Running tests against production DB by mistake.
- Not setting `NODE_ENV=production` for backend builds.
- CORS issues after deploy (frontend URL not whitelisted in Express CORS config).
- Forgetting to set environment variables on the **hosting platform** itself (Render/Vercel), not just in GitHub Secrets.
