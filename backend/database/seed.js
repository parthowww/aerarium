const db = require('./db');

function seedAerarium() {
  // Ensure default demo user exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('cfo@aerarium.io');
  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (email, password_hash, name, company, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('cfo@aerarium.io', 'aerarium123', 'Elena Rostova', 'Helios Robotics & AI', 'Chief Financial Operator');
    console.log('Seeded Aerarium demo user: cfo@aerarium.io');
  }

  // Ensure treasury reserves setting
  const reserves = db.prepare('SELECT COUNT(*) as count FROM treasury_reserves').get().count;
  if (reserves === 0) {
    db.prepare(`
      INSERT INTO treasury_reserves (cash_in_bank, monthly_inflow, non_saas_burn)
      VALUES (185000.00, 32000.00, 14500.00)
    `).run();
  }

  // Ensure subscriptions
  const subCount = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get().count;
  if (subCount === 0) {
    console.log('Seeding Aerarium realistic SaaS subscription portfolio...');
    const insertSub = db.prepare(`
      INSERT INTO subscriptions (name, vendor, category, cost, billing_cycle, next_billing_date, status, usage_pct, seats_purchased, seats_active)
      VALUES (?, ?, ?, ?, ?, date('now', ?), ?, ?, ?, ?)
    `);

    insertSub.run('AWS Production Cloud Infrastructure', 'Amazon Web Services', 'cloud', 1650.00, 'monthly', '+14 days', 'active', 94, 1, 1);
    insertSub.run('GitHub Enterprise & Copilot', 'GitHub Inc.', 'dev_tools', 420.00, 'monthly', '+4 days', 'active', 90, 20, 18);
    insertSub.run('OpenAI API & Model Fine-Tuning', 'OpenAI Inc.', 'ai', 890.00, 'monthly', '+18 days', 'active', 86, 1, 1);
    insertSub.run('Figma Organization (15 Seats)', 'Figma Inc.', 'design', 675.00, 'monthly', '+3 days', 'active', 40, 15, 6); // 9 dormant seats!
    insertSub.run('Datadog APM & Logs Ingestion', 'Datadog', 'cloud', 1150.00, 'monthly', '+9 days', 'active', 48, 1, 1); // 40% spike!
    insertSub.run('Slack Business+ Collaboration', 'Salesforce / Slack', 'productivity', 340.00, 'monthly', '+22 days', 'active', 95, 24, 23);
    insertSub.run('Notion Enterprise Workspace', 'Notion Labs', 'productivity', 280.00, 'monthly', '+11 days', 'active', 75, 20, 15);
    insertSub.run('Tableau Creator License (Dormant)', 'Salesforce', 'productivity', 250.00, 'monthly', '+6 days', 'active', 0, 1, 0); // Completely dormant!

    // Seed spending leaks
    const insertLeak = db.prepare(`
      INSERT INTO spending_leaks (subscription_id, leak_type, potential_savings, reason, severity, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `);

    insertLeak.run(
      4,
      'dormant_license',
      405.00,
      '9 out of 15 Figma editor seats have registered zero activity in 45 days. Reclaiming seats recovers $405.00/mo immediately.',
      'critical'
    );

    insertLeak.run(
      5,
      'price_spike',
      460.00,
      'Datadog custom metrics bill jumped 42% month-over-month due to un-indexed span tags. Setting tag filters saves $460.00/mo.',
      'high'
    );

    insertLeak.run(
      8,
      'dormant_license',
      250.00,
      'Tableau Creator seat has had zero active sessions for 60+ days. Direct unutilized waste.',
      'high'
    );

    console.log('Aerarium subscriptions & leak diagnostics seeded.');
  }
}

if (require.main === module) {
  seedAerarium();
}

module.exports = seedAerarium;
