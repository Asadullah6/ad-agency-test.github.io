# 🎯 AdMetrics Dashboard — Full Stack Ad Campaign Platform

A production-ready full-stack advertising campaign management system built for a job assessment. Features a React dashboard, Node.js REST API, AI content generation microservice, real-time WebSocket notifications, and Docker containerisation.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple?logo=openai)

---

## 📌 Project Overview

AdMetrics is a full-stack platform for managing advertising campaigns across multiple platforms (Google Ads, Meta, LinkedIn, TikTok). It includes:

- ✅ Campaign CRUD with filtering, sorting, and pagination
- ✅ JWT Authentication with role-based access control
- ✅ AI-powered ad copy, social captions, and hashtag generation
- ✅ Real-time WebSocket alerts when campaign metrics cross thresholds
- ✅ Rate limiting, input validation, and global error handling
- ✅ Fully containerised with Docker Compose

---

## 🛠️ Tech Stack

| Layer            | Technology                                         |
|------------------|----------------------------------------------------|
| **Frontend**     | React 18, Vite, Tailwind CSS, Recharts, Socket.io-client |
| **Backend API**  | Node.js, Express.js, Sequelize ORM                 |
| **Database**     | PostgreSQL 16                                      |
| **Auth**         | JWT (jsonwebtoken), bcryptjs                       |
| **AI Service**   | Node.js, Express.js, OpenAI API (gpt-4o-mini)      |
| **Real-Time**    | Socket.io (WebSockets)                             |
| **Validation**   | express-validator                                  |
| **Logging**      | Winston, Morgan                                    |
| **Rate Limiting**| express-rate-limit (100 req/min per IP)            |
| **Container**    | Docker, Docker Compose                             |
| **API Docs**     | OpenAPI 3.0 (YAML)                                 |

---

## 📁 Folder Structure

```
ad-agency-test/
├── frontend/                        # React App (Vite + Tailwind)
│
├── backend/                         # REST API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, get profile
│   │   │   ├── campaignController.js# Full CRUD logic
│   │   │   └── alertController.js   # Alert rules & history
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── campaignRoutes.js
│   │   │   └── alertRoutes.js
│   │   ├── models/
│   │   │   ├── index.js             # Sequelize associations
│   │   │   ├── User.js
│   │   │   ├── Campaign.js
│   │   │   ├── AlertRule.js
│   │   │   └── AlertHistory.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT protect middleware
│   │   │   ├── validate.js          # Input validation chains
│   │   │   ├── rateLimiter.js       # 100 req/min per IP
│   │   │   └── errorHandler.js      # Global error handler
│   │   ├── config/
│   │   │   ├── database.js          # Sequelize + PostgreSQL
│   │   │   └── logger.js            # Winston logger
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # HTTP + WebSocket server
│   ├── schema.sql                   # Database schema + seed
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── ai-service/                      # AI Microservice (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── generateController.js
│   │   ├── routes/
│   │   │   └── generateRoutes.js
│   │   ├── services/
│   │   │   └── openaiService.js     # All OpenAI API calls
│   │   ├── config/
│   │   │   └── logger.js
│   │   └── app.js
│   ├── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── openapi.yaml                 # Full OpenAPI 3.0 spec
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=admetrics_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

CORS_ORIGIN=http://localhost:3000
AI_SERVICE_URL=http://localhost:4000
```

### `ai-service/.env`

```env
PORT=4000
NODE_ENV=development
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=http://localhost:5000,http://localhost:3000
```

> ⚠️ Never commit real `.env` files to GitHub. They are already in `.gitignore`.

---

## 🚀 How to Run

### Option A — Docker Compose (Recommended — One Command)

**Requirements:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ad-agency-test.git
cd ad-agency-test

# 2. Open docker-compose.yml and add your OpenAI key:
#    OPENAI_API_KEY: sk-your-actual-key-here

# 3. Start all services
docker compose up --build
```

Services will start at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Microservice | http://localhost:4000 |
| PostgreSQL | localhost:5432 |

---

### Option B — Manual Setup (Without Docker)

**Requirements:**
- [Node.js LTS](https://nodejs.org) (v18 or higher)
- [PostgreSQL 16](https://www.postgresql.org/download/)

#### 1. Clone the repo
```bash
git clone https://github.com/your-username/ad-agency-test.git
cd ad-agency-test
```

#### 2. Setup PostgreSQL Database
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE admetrics_db;"

# Run the schema (creates all tables + seeds admin user)
psql -U postgres -d admetrics_db -f backend/schema.sql
```

#### 3. Setup Backend
```bash
cd backend

# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env

# Fill in your DB password and JWT secret in .env, then:
npm install
node server.js
```
✅ Backend running at: `http://localhost:5000`

#### 4. Setup AI Service
```bash
cd ../ai-service

# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env

# Add your OPENAI_API_KEY in .env, then:
npm install
node server.js
```
✅ AI Service running at: `http://localhost:4000`

#### 5. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
✅ Frontend running at: `http://localhost:3000`

---

## 🔐 Default Login Credentials

```
Email:    admin@admetrics.com
Password: Admin@1234
```

---

## 📡 API Endpoints

### Backend API — `http://localhost:5000`

#### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login, returns JWT token |
| GET | `/auth/me` | ✅ | Get current user profile |

#### Campaigns
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/campaigns` | ✅ | List all campaigns (paginated) |
| POST | `/campaigns` | ✅ | Create new campaign |
| GET | `/campaigns/:id` | ✅ | Get single campaign with metrics |
| PUT | `/campaigns/:id` | ✅ | Update campaign |
| DELETE | `/campaigns/:id` | ✅ | Soft delete (sets deleted_at) |

**GET /campaigns — Available Query Params:**
```
?page=1
?limit=10
?status=active
?platform=Meta
?search=summer
?sortBy=created_at
?sortOrder=DESC
```

#### Alerts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/campaigns/:id/alert-rules` | ✅ | Create alert rule for campaign |
| GET | `/alerts/history` | ✅ | Get notification history |
| PATCH | `/alerts/history/:id/read` | ✅ | Mark alert as read |

#### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |

---

### AI Microservice — `http://localhost:4000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate/copy` | Generate headline, body, CTA |
| POST | `/generate/social` | Generate 5 social media captions |
| POST | `/generate/hashtags` | Generate 10 relevant hashtags |
| GET | `/health` | Health check + model info |

#### Example Request Bodies

**POST /generate/copy**
```json
{
  "product": "Running Shoes",
  "tone": "energetic",
  "platform": "Instagram",
  "word_limit": 50
}
```

**POST /generate/social**
```json
{
  "platform": "Instagram",
  "campaign_goal": "drive website traffic",
  "brand_voice": "witty and bold"
}
```

**POST /generate/hashtags**
```json
{
  "content": "Summer fitness campaign for athletes",
  "industry": "fitness"
}
```

> 💡 `/generate/copy` supports **SSE Streaming** — set header `Accept: text/event-stream`

---

## 🔌 Real-Time WebSocket Notifications

The backend exposes a Socket.io server on port **5000**.

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join your private notification room
socket.emit('join', userId);

// Listen for threshold alerts
socket.on('alert', (payload) => {
  console.log(payload.message);
  // Returns: { id, campaign_id, message, metric, value, threshold, triggered_at }
});
```

Alerts fire automatically when a campaign update crosses a rule. Example rules:
- CTR drops **below 1%**
- Budget spent exceeds **90%**

---

## 📋 Quick Test Commands (Terminal)

```bash
# Backend health check
curl http://localhost:5000/health

# AI service health check
curl http://localhost:4000/health

# Login and get JWT token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@admetrics.com\",\"password\":\"Admin@1234\"}"

# Get all campaigns (replace YOUR_TOKEN with token from login)
curl http://localhost:5000/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a campaign
curl -X POST http://localhost:5000/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Campaign\",\"platform\":\"Meta\",\"budget\":5000}"

# Generate AI ad copy
curl -X POST http://localhost:4000/generate/copy \
  -H "Content-Type: application/json" \
  -d "{\"product\":\"Running Shoes\",\"tone\":\"energetic\",\"platform\":\"Instagram\"}"
```

---

## 🐳 Useful Docker Commands

```bash
# Start all services
docker compose up --build

# Start in background (detached mode)
docker compose up -d --build

# View live logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f ai-service

# Stop all services
docker compose down

# Full reset — deletes database volume too
docker compose down -v

# Rebuild a single service only
docker compose up --build backend

# Open a shell inside the backend container
docker exec -it admetrics_backend sh

# Open PostgreSQL shell inside the DB container
docker exec -it admetrics_db psql -U postgres -d admetrics_db
```

---

## 🗄️ Useful Database Commands

```bash
# Connect to PostgreSQL (Docker)
docker exec -it admetrics_db psql -U postgres -d admetrics_db

# Once inside psql:
\dt                          # List all tables
SELECT * FROM campaigns;     # View all campaigns
SELECT * FROM users;         # View all users
SELECT * FROM alert_history; # View all alerts
\q                           # Exit psql
```

---

## 📖 API Documentation

Full OpenAPI 3.0 spec is in `docs/openapi.yaml`.

**View it online (Swagger UI):**
1. Go to 👉 https://editor.swagger.io
2. Paste contents of `docs/openapi.yaml`

**View locally:**
```bash
npx @redocly/cli preview-docs docs/openapi.yaml
```

---

## 📦 Required Software

| Software | Purpose | Download Link |
|----------|---------|---------------|
| **Docker Desktop** | Run everything with one command | https://www.docker.com/products/docker-desktop |
| **Node.js LTS** | Run services without Docker | https://nodejs.org |
| **PostgreSQL 16** | Database (without Docker) | https://www.postgresql.org/download |
| **VS Code** | Code editor | https://code.visualstudio.com |
| **Postman** | API testing (standalone) | https://www.postman.com/downloads |
| **Git** | Version control / GitHub upload | https://git-scm.com |

### Recommended VS Code Extensions
```
Name: Docker          → Publisher: Microsoft
Name: ESLint          → Publisher: Microsoft
Name: Prettier        → Publisher: Prettier
Name: Thunder Client  → Publisher: Thunder Client (API testing inside VS Code)
Name: DotENV          → Publisher: mikestead
Name: GitLens         → Publisher: GitKraken
```

---

## 🔒 Security Features

- ✅ JWT Authentication — all campaign endpoints protected
- ✅ Passwords hashed with bcryptjs (12 salt rounds)
- ✅ Rate limiting — 100 requests/minute per IP
- ✅ HTTP security headers via Helmet.js
- ✅ Input validation with descriptive error messages
- ✅ Soft delete — data is never permanently lost
- ✅ Environment variables — no secrets hardcoded anywhere

---

## 🚀 How to Push to GitHub

```bash
# 1. Initialize git in project folder
cd C:\projects\ad-agency-test
git init

# 2. Create a .gitignore file to protect secrets
echo node_modules/ >> .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore

# 3. Stage all files
git add .

# 4. First commit
git commit -m "Initial commit - AdMetrics full stack project"

# 5. Create a new repo on GitHub at https://github.com/new
#    Then connect and push:
git remote add origin https://github.com/your-username/ad-agency-test.git
git branch -M main
git push -u origin main
```

---

## 👤 Author

Built as a job assessment project demonstrating full-stack development skills including REST API design, microservice architecture, real-time systems, and containerisation.
