const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all subscriptions
router.get('/', (req, res) => {
  try {
    const subs = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM spending_leaks l WHERE l.subscription_id = s.id AND l.status = 'active') as active_leaks_count,
        (SELECT potential_savings FROM spending_leaks l WHERE l.subscription_id = s.id AND l.status = 'active' LIMIT 1) as potential_savings,
        (SELECT reason FROM spending_leaks l WHERE l.subscription_id = s.id AND l.status = 'active' LIMIT 1) as leak_reason
      FROM subscriptions s
      ORDER BY s.cost DESC
    `).all();

    res.json({ success: true, count: subs.length, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST add subscription
router.post('/', (req, res) => {
  try {
    const { name, vendor, category = 'cloud', cost, seats_purchased = 1, seats_active = 1 } = req.body;
    if (!name || isNaN(cost)) {
      return res.status(400).json({ success: false, message: 'Name and cost are required' });
    }

    const numCost = parseFloat(cost);
    const purchased = parseInt(seats_purchased) || 1;
    const active = Math.min(purchased, parseInt(seats_active) || 1);
    const usagePct = Math.round((active / purchased) * 100);

    const stmt = db.prepare(`
      INSERT INTO subscriptions (name, vendor, category, cost, billing_cycle, next_billing_date, status, usage_pct, seats_purchased, seats_active)
      VALUES (?, ?, ?, ?, 'monthly', date('now', '+30 days'), 'active', ?, ?, ?)
    `);

    const result = stmt.run(name, vendor || name, category, numCost, usagePct, purchased, active);
    const subId = result.lastInsertRowid;

    // Automatic diagnostic heuristic: if active seats < 60% of purchased, flag leak!
    if (purchased > 1 && (active / purchased) < 0.6) {
      const dormantSeats = purchased - active;
      const seatCost = numCost / purchased;
      const savings = Math.round(dormantSeats * seatCost * 100) / 100;

      db.prepare(`
        INSERT INTO spending_leaks (subscription_id, leak_type, potential_savings, reason, severity)
        VALUES (?, 'dormant_license', ?, ?, 'high')
      `).run(
        subId,
        savings,
        `${dormantSeats} out of ${purchased} seats are unassigned/dormant. Immediate reclaim opportunity.`
      );
    }

    const created = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH toggle active/paused
router.patch('/:id/toggle', (req, res) => {
  try {
    const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    db.prepare('UPDATE subscriptions SET status = ? WHERE id = ?').run(newStatus, sub.id);

    // If paused, resolve associated leak
    if (newStatus === 'paused') {
      db.prepare("UPDATE spending_leaks SET status = 'resolved' WHERE subscription_id = ?").run(sub.id);
    }

    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(sub.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE subscription
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
