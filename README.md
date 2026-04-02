# SpendQuest

SpendQuest is a gamified personal finance tracker designed for Indian users. It combines spending data, plain-language transaction summaries, and game mechanics like XP, quests, badges, streaks, and social leaderboards.

## Quick start (non-technical)

### 1) Install these apps first
- Docker Desktop
- Node.js (LTS)
- Git

### 2) Download project
```bash
git clone <YOUR_REPO_URL>
cd Spend-Quest
```

### 3) Start database services
```bash
docker-compose up -d
```

### 4) Setup backend
```bash
cd server
npm install
cp .env.example .env
cd ..
```

### 5) Setup frontend
```bash
cd client
npm install
cp .env.example .env
cd ..
```

### 6) Create DB tables + seed badges/quests
```bash
node server/src/db/migrate.js
node server/src/db/seed.js
```

### 7) Run backend (Terminal 1)
```bash
cd server
npm run dev
```

### 8) Run frontend (Terminal 2)
```bash
cd client
npm run dev
```

### 9) Open app
Go to: http://localhost:5173

---

## Project structure

```
client/  -> React + Vite frontend
server/  -> Node + Express backend
docker-compose.yml -> PostgreSQL + Redis
```

---

## API response format
All APIs return:

```json
{ "success": true, "data": {}, "error": "optional" }
```

---

## Implemented modules in this scaffold
- Auth (register/login/refresh/logout/me)
- Transaction CRUD + SMS import + CSV import + summary/category analytics
- Budgets CRUD + budget usage status
- XP engine + level progression + socket event emit
- Quest join/list + quest evaluation service
- Streak service
- Social basics (leaderboard, squads, arena)
- SpendWrapped generation endpoint
- Frontend routes/pages for dashboard, transactions, quests, budgets, leaderboard, arena, profile, wrapped, onboarding

---

## Stop app
```bash
docker-compose down
```

If frontend/backend terminals are open, press `Ctrl + C` in each one.
