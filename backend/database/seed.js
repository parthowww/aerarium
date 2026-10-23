const db = require('./db');

function seedAuraFlow() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get();
  if (existing.count > 0) {
    console.log('AuraFlow database already seeded.');
    return;
  }

  console.log('Seeding AuraFlow database...');

  const insertSub = db.prepare(`
    INSERT INTO subscriptions (name, vendor, category, cost, billing_cycle, next_billing_date, status, usage_score, auto_renew)
    VALUES (?, ?, ?, ?, ?, date('now', ?), ?, ?, ?)
  `);

  const subscriptions = [
    ['AWS Compute & S3 Storage', 'Amazon Web Services', 'cloud', 1420.50, 'monthly', '+12 days', 'active', 94, 1],
    ['GitHub Enterprise & Copilot Seats', 'GitHub Inc.', 'dev_tools', 380.00, 'monthly', '+5 days', 'active', 91, 1],
    ['OpenAI Platform & Codex API', 'OpenAI', 'ai', 645.20, 'monthly', '+18 days', 'active', 88, 1],
    ['Figma Organization (12 Editors)', 'Figma', 'design', 540.00, 'monthly', '+2 days', 'active', 52, 1], // Dormant seats leak!
    ['Datadog APM & Log Management', 'Datadog', 'cloud', 890.00, 'monthly', '+9 days', 'active', 44, 1], // Overprovisioned leak!
    ['Slack Business+ Workspace', 'Slack Technologies', 'productivity', 320.00, 'monthly', '+24 days', 'active', 96, 1],
    ['Vercel Pro Enterprise Team', 'Vercel Inc.', 'cloud', 150.00, 'monthly', '+15 days', 'active', 85, 1],
    ['Tableau Online Seats (Unused)', 'Salesforce', 'productivity', 280.00, 'monthly', '+7 days', 'active', 12, 1] // Idle license!
  ];

  for (const s of subscriptions) {
    insertSub.run(...s);
  }

  const insertLeak = db.prepare(`
    INSERT INTO spending_leaks (subscription_id, leak_type, potential_savings, reason, severity, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);

  insertLeak.run(
    4,
    'dormant_license',
    270.00,
    '5 out of 12 Figma editor seats have had 0 edit events in the last 45 days. Recommend downgrading to viewer seats.',
    'high'
  );

  insertLeak.run(
    5,
    'price_hike',
    340.00,
    'Datadog custom metrics bill jumped 38% month-over-month due to high-cardinality indexing tags.',
    'high'
  );

  insertLeak.run(
    8,
    'dormant_license',
    280.00,
    'Tableau seat has had no active sessions for 60+ days. Fully reclaimable license.',
    'medium'
  );

  const insertSnapshot = db.prepare(`
    INSERT INTO cashflow_snapshots (snapshot_date, cash_inflow, cash_outflow, net_burn, total_reserves, runway_months)
    VALUES (date('now'), ?, ?, ?, ?, ?)
  `);

  insertSnapshot.run(32500.00, 41250.00, 8750.00, 165000.00, 18.8);

  console.log('AuraFlow seeding complete.');
}

if (require.main === module) {
  seedAuraFlow();
}

module.exports = seedAuraFlow;
