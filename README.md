# AuraFlow 💫

> **Minimalist Zero-Noise Subscription & Cashflow Runway Intelligence Ledger**

AuraFlow is a modern financial operations ledger built for founders and teams. Designed with the clean, elevated aesthetic of Xenodochy, it cuts through accounting noise with floating frosted-glass cards, automated spending leak detection, and zero intrusive popup dialogs.

---

## ✨ Features

- **Xenodochy Aesthetic:** Off-white canvas (`#F8F9FA`), subtle radial matrix dot grid, floating rounded frosted islands (`rounded-[32px]`), and Bricolage Grotesque typography.
- **Automated Spend Leak Detection:** Proactively flags unutilized seats, price spikes, and dormant licenses with one-click savings realization.
- **Zero-Modal Workflow:** Adding subscriptions, toggling active states, and resolving leak alerts happen completely in-line.
- **Cash Runway Buffer:** Real-time visibility into monthly recurring burn, annualized run-rates, and runway projections.
- **Native Embedded Database:** Zero-configuration SQLite storage via Node.js native `node:sqlite`.
- **RESTful API:** Structured endpoints for subscription lifecycle, cashflow summaries, and waste audits.

---

## 🏗️ Architecture

```
aura-flow/
├── backend/
│   ├── database/
│   │   ├── schema.sql           # SQLite tables (subscriptions, leaks, snapshots)
│   │   ├── db.js                # Database connection using node:sqlite
│   │   └── seed.js              # Rich SaaS telemetry seed script
│   ├── routes/
│   │   ├── subscriptions.js     # Subscription CRUD & status toggles
│   │   ├── leaks.js             # Spending leak intelligence & resolution
│   │   └── cashflow.js          # Runway calculations & category breakdowns
│   ├── server.js                # Express API & static server
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css            # Xenodochy-style radial grid & glass layout
│   ├── js/
│   │   └── app.js               # Reactive spend controller
│   └── index.html               # Floating ledger dashboard
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
The server will seed the database automatically and start on:
👉 **`http://localhost:4001`**

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/subscriptions` | List subscriptions with category & leak flags |
| `POST` | `/api/subscriptions` | Register a new subscription |
| `PATCH` | `/api/subscriptions/:id/toggle` | Toggle subscription status (active/paused) |
| `DELETE` | `/api/subscriptions/:id` | Delete a subscription |
| `GET` | `/api/leaks` | Fetch active spending leaks & savings |
| `PATCH` | `/api/leaks/:id/resolve` | Claim savings and resolve a leak |
| `GET` | `/api/cashflow/summary` | Global monthly spend, reserves & runway |
| `GET` | `/api/health` | AuraFlow Core health check |

---

## 🛠️ Tech Stack
- **Frontend:** Vanilla ES6+, CSS3, Lucide Icons, Google Bricolage Grotesque & Inter
- **Backend:** Node.js, Express.js
- **Database:** SQLite (`node:sqlite`)
