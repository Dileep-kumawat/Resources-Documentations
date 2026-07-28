# Docker Notes for Full Stack MERN Developers

---

# 1. What is Docker?

Docker is a **containerization platform**.

It packages:

* Application code
* Dependencies
* Runtime
* Configurations

into a single isolated environment called a **container**.

## Main Purpose

Eliminate:

> “Works on my machine” problems.

---

# 2. Why MERN Developers Need Docker

Without Docker:

* Different Node versions
* MongoDB setup issues
* Environment mismatch
* Team conflicts
* Deployment headaches

With Docker:

* Same environment everywhere
* Easy backend/frontend/database setup
* Faster onboarding
* Easy deployment
* Clean development workflow

---

# 3. Core Docker Concepts

## Docker Engine

Main runtime that manages containers.

## Image

Blueprint/template for containers.

Example:

```bash
node:20
mongo:7
nginx:latest
```

## Container

Running instance of an image.

## Dockerfile

Instruction file to build custom images.

## Docker Compose

Tool to manage multiple containers together.

## Volume

Persistent storage.

## Network

Allows containers to communicate.

## Registry

Image storage platform.

Example:

* Docker Hub

---

# 4. Docker Architecture

```text
Docker CLI  ---> Docker Daemon ---> Containers
                     |
                     ---> Docker Hub
```

---

# 5. Essential Docker Commands

## Check Installation

```bash
docker --version
```

---

## View Images

```bash
docker images
```

---

## Running Containers

```bash
docker ps
```

All containers:

```bash
docker ps -a
```

---

## Pull Image

```bash
docker pull node
```

---

## Run Container

```bash
docker run node
```

Interactive:

```bash
docker run -it node bash
```

Detached mode:

```bash
docker run -d nginx
```

Port mapping:

```bash
docker run -p 3000:3000 node
```

---

## Stop Container

```bash
docker stop container_id
```

---

## Remove Container

```bash
docker rm container_id
```

---

## Remove Image

```bash
docker rmi image_id
```

---

## Enter Running Container

```bash
docker exec -it container_id bash
```

---

# 6. Docker Images

## Image Layers

Images use layered filesystem.

Benefits:

* Faster builds
* Caching
* Smaller updates

---

## Build Image

```bash
docker build -t myapp .
```

Explanation:

* `-t` → tag/name
* `.` → current directory

---

# 7. Dockerfile Complete Notes

## Basic Structure

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

---

## Important Instructions

## FROM

Base image.

```dockerfile
FROM node:20
```

---

## WORKDIR

Sets working directory.

```dockerfile
WORKDIR /app
```

---

## COPY

Copies files.

```dockerfile
COPY . .
```

---

## RUN

Executes commands while building image.

```dockerfile
RUN npm install
```

---

## EXPOSE

Documents container port.

```dockerfile
EXPOSE 5000
```

---

## CMD

Default startup command.

```dockerfile
CMD ["npm", "start"]
```

---

# 8. MERN Backend Docker Setup

## Express Backend Dockerfile

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

---

## Build Backend Image

```bash
docker build -t mern-backend .
```

---

## Run Backend

```bash
docker run -p 5000:5000 mern-backend
```

---

# 9. React Frontend Docker Setup

## React Dockerfile

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Run Frontend

```bash
docker run -p 3000:3000 react-app
```

---

# 10. MongoDB with Docker

## Pull MongoDB

```bash
docker pull mongo
```

---

## Run MongoDB

```bash
docker run -d -p 27017:27017 mongo
```

---

## MongoDB with Username & Password

```bash
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=password \
mongo
```

---

# 11. Docker Volumes

Without volume:

* Data deleted when container removed.

With volume:

* Data persists.

---

## Create Volume

```bash
docker volume create mongo-data
```

---

## Use Volume

```bash
docker run -d \
-v mongo-data:/data/db \
mongo
```

---

# 12. Docker Networks

Containers communicate using networks.

---

## Create Network

```bash
docker network create mern-network
```

---

## Attach Container

```bash
docker run --network mern-network mongo
```

---

# 13. Docker Compose (MOST IMPORTANT)

Real MERN apps need:

* Frontend
* Backend
* Database

Docker Compose manages all together.

---

# 14. docker-compose.yml Complete Example

```yaml
version: '3'

services:

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongo:27017/mern
    depends_on:
      - mongo

  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

# 15. Docker Compose Commands

## Start Services

```bash
docker compose up
```

Detached:

```bash
docker compose up -d
```

---

## Stop Services

```bash
docker compose down
```

---

## Rebuild

```bash
docker compose up --build
```

---

# 16. Environment Variables

## .env Example

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/mern
JWT_SECRET=mysecret
```

---

## Access in Node.js

```javascript
process.env.PORT
```

---

# 17. .dockerignore

Avoid unnecessary files.

## Example

```text
node_modules
.git
.env
```

---

# 18. Docker Development Workflow

## Typical MERN Setup

```text
Frontend Container
Backend Container
MongoDB Container
```

All connected via:

* Docker network
* Docker Compose

---

# 19. Bind Mounts

Live code updates inside container.

## Example

```bash
-v .:/app
```

Useful for development.

---

# 20. Production Docker Tips

## Use Multi-stage Builds

Reduces image size.

---

## React Production Build

```dockerfile
FROM node:20 as build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
```

---

# 21. Docker Layers Optimization

Bad:

```dockerfile
COPY . .
RUN npm install
```

Good:

```dockerfile
COPY package*.json ./
RUN npm install

COPY . .
```

Why?

* Better caching
* Faster rebuilds

---

# 22. Common Docker Problems

## Port Already Used

Error:

```text
Bind for 3000 failed
```

Fix:

* Change port
* Stop existing app

---

## Container Exits Immediately

Reason:

* Main process stopped

Fix:

* Ensure CMD runs properly

---

## Mongo Connection Issues

Wrong:

```text
localhost
```

Correct inside Docker:

```text
mongo
```

Use service name.

---

# 23. Docker vs Virtual Machine

## Docker

* Lightweight
* Fast
* Shares host OS kernel

## VM

* Heavy
* Full OS required

---

# 24. Important MERN Docker Architecture

```text
React ---> Express ---> MongoDB
```

Inside Docker:

```text
Frontend Container
        |
Backend Container
        |
Mongo Container
```

---

# 25. Deployment Workflow

## Build Images

```bash
docker build -t app .
```

---

## Push to Docker Hub

```bash
docker login
docker push username/app
```

---

## Pull on Server

```bash
docker pull username/app
```

---

## Run on VPS

```bash
docker compose up -d
```

---

# 26. Docker Hub

Public image registry.

Useful for:

* Sharing images
* Deployment
* CI/CD

---

# 27. CI/CD + Docker

Pipeline:

```text
GitHub Push
   ↓
Build Docker Image
   ↓
Run Tests
   ↓
Push to Docker Hub
   ↓
Deploy Server
```

---

# 28. Kubernetes Relation

Docker:

* Creates containers

Kubernetes:

* Manages containers at scale

Learn Docker first.

---

# 29. Security Best Practices

## Never:

* Store secrets in Dockerfile
* Push `.env`

---

## Use:

* Environment variables
* Docker secrets
* Minimal images

---

# 30. Most Important Interview Questions

## Difference between Image & Container?

Image = blueprint
Container = running instance

---

## Why Docker Compose?

Manage multi-container apps.

---

## What is Volume?

Persistent storage.

---

## Why use .dockerignore?

Reduce build size and improve speed.

---

## Difference between CMD and RUN?

RUN:

* Executes during build

CMD:

* Executes when container starts

---

# 31. Complete MERN Docker Folder Structure

```text
project/
│
├── frontend/
│   ├── Dockerfile
│   └── ...
│
├── backend/
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
│
└── .env
```

---

# 32. Ultimate Quick Revision

## Commands

```bash
docker build -t app .
docker run -p 3000:3000 app
docker ps
docker stop id
docker rm id
docker compose up
docker compose down
```

---

## Core Concepts

```text
Image → Blueprint
Container → Running app
Dockerfile → Build instructions
Compose → Multi-container manager
Volume → Persistent storage
Network → Communication
```

---

# 33. What You ACTUALLY Need to Master as MERN Developer

Most people waste time learning every Docker feature.

For MERN development, focus on:

* Dockerfile
* Docker Compose
* Volumes
* Networks
* Environment variables
* Production builds
* Mongo persistence

Ignore advanced orchestration initially.

---

# 34. Real-World MERN Docker Stack

Typical production setup:

```text
React → Nginx
Node API → Express Container
Database → MongoDB
Reverse Proxy → Nginx
SSL → Certbot
Deployment → VPS/Cloud
```

---

# 35. Fast Recall Summary

```text
Docker = Packaging apps in containers

Image = Template
Container = Running image

Dockerfile = Build instructions

Compose = Run multiple services

Volume = Save data

Network = Connect containers

Frontend + Backend + Mongo = Standard MERN Docker setup
```
