-- Aerarium Sovereign Treasury Schema
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT DEFAULT 'Helios Ventures',
    role TEXT DEFAULT 'Chief Financial Officer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'cloud', -- cloud, ai, dev_tools, design, productivity
    cost REAL NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, annual
    next_billing_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, cancelled
    usage_pct INTEGER NOT NULL DEFAULT 85,
    auto_renew INTEGER NOT NULL DEFAULT 1,
    seats_purchased INTEGER DEFAULT 1,
    seats_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spending_leaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    leak_type TEXT NOT NULL, -- dormant_license, price_spike, duplicate_tier
    potential_savings REAL NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'high', -- critical, high, medium
    status TEXT NOT NULL DEFAULT 'active', -- active, resolved, dismissed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS treasury_reserves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cash_in_bank REAL NOT NULL DEFAULT 185000.00,
    monthly_inflow REAL NOT NULL DEFAULT 32000.00,
    non_saas_burn REAL NOT NULL DEFAULT 15000.00, -- payroll, legal, hosting
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
