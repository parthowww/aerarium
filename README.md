# Aerarium 🏛️

> **Sovereign Spend & Runway Treasury Ledger for Tech Startups**

Aerarium is an executive capital preservation engine that audits SaaS contracts, detects dormant seat licenses, and calculates mathematical cash runway extensions in real time.

---

## ✨ User Flow & Journey

1. **Intro / Marketing Landing (`/`)**: High-converting pitch outlining SaaS waste and silent runway depletion. Includes a live interactive Runway Extension Simulator.
2. **Executive Authentication (`/login`)**: Dedicated corporate sign-in with a pre-configured **1-Click Demo Login** for investor presentations and product walk-throughs.
3. **Live Treasury Console (`/app`)**: Mathematical runway buffer calculations, proactive license leak detection, one-click savings realization, and exportable board audit reports.

---

## 🏗️ Architecture

```
aerarium/
├── backend/
│   ├── database/
│   │   ├── schema.sql           # SQLite tables (users, subscriptions, spending_leaks, treasury_reserves)
│   │   ├── db.js                # Database connection using node:sqlite
│   │   └── seed.js              # Realistic SaaS audit portfolio seed script
│   ├── routes/
│   │   ├── auth.js              # Authentication & 1-click demo endpoints
│   │   ├── treasury.js          # Runway calculations & cash reserves
│   │   ├── subscriptions.js     # Subscription CRUD, seat audits & toggles
│   │   └── leaks.js             # Proactive spend leak diagnostics
│   ├── server.js                # Express API & UI static route server
│   └── package.json
├── frontend/
│   ├── css/
│   │   ├── landing.css          # Swiss editorial financial styling
│   │   └── app.css              # Treasury console styling
│   ├── js/
│   │   └── app.js               # Reactive spend controller & audit exporter
│   ├── index.html               # Marketing landing & runway simulator
│   ├── login.html               # Corporate auth with 1-click demo
│   └── app.html                 # Full working treasury console
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run the Application
```bash
npm start
```
* **Landing Page:** 👉 `http://localhost:4001/`
* **Demo Login:** 👉 `http://localhost:4001/login`
* **Treasury Console:** 👉 `http://localhost:4001/app`

---

## 🛠️ Tech Stack
- **Frontend:** Modular Vanilla ES6+, CSS3, Lucide Icons, Google Plus Jakarta Sans & JetBrains Mono
- **Backend:** Node.js, Express.js REST API
- **Database:** Native SQLite (`node:sqlite`)
