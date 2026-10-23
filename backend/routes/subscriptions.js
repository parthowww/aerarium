const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all subscriptions
router.get('/', (req, res) => {
  try {
    const { category, status } = req.query;
    let query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM spending_leaks l WHERE l.subscription_id = s.id AND l.status = 'active') as active_leaks_count
      FROM subscriptions s
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    query += ' ORDER BY s.cost DESC';

    const subscriptions = db.prepare(query).all(...params);
    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new subscription
router.post('/', (req, res) => {
  try {
    const { name, vendor, category = 'cloud', cost, billing_cycle = 'monthly', next_billing_date } = req.body;
    if (!name || !cost) {
      return res.status(400).json({ success: false, message: 'Name and cost are required' });
    }

    const billingDate = next_billing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stmt = db.prepare(`
      INSERT INTO subscriptions (name, vendor, category, cost, billing_cycle, next_billing_date, status, usage_score)
      VALUES (?, ?, ?, ?, ?, ?, 'active', 90)
    `);
    const result = stmt.run(name, vendor || name, category, parseFloat(cost), billing_cycle, billingDate);
    const created = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid);

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
    db.prepare('UPDATE subscriptions SET status = ? WHERE id = ?').run(newStatus, req.params.id);
    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);

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
