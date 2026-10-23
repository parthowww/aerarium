-- AuraFlow Cashflow & Spending Intelligence Schema
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'cloud', -- cloud, ai, dev_tools, design, productivity
    cost REAL NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, annual
    next_billing_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, cancelled
    usage_score INTEGER NOT NULL DEFAULT 85, -- 0 to 100 percentage
    auto_renew INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spending_leaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    leak_type TEXT NOT NULL, -- price_hike, dormant_license, duplicate_tier, unapproved_renewal
    potential_savings REAL NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
    status TEXT NOT NULL DEFAULT 'active', -- active, resolved, dismissed
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cashflow_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    cash_inflow REAL NOT NULL DEFAULT 0,
    cash_outflow REAL NOT NULL DEFAULT 0,
    net_burn REAL NOT NULL DEFAULT 0,
    total_reserves REAL NOT NULL DEFAULT 142000,
    runway_months REAL NOT NULL DEFAULT 14.5
);
