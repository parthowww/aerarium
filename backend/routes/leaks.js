const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET active leaks
router.get('/', (req, res) => {
  try {
    const leaks = db.prepare(`
      SELECT l.*, s.name as subscription_name, s.cost as current_cost, s.vendor
      FROM spending_leaks l
      JOIN subscriptions s ON l.subscription_id = s.id
      WHERE l.status = 'active'
      ORDER BY l.potential_savings DESC
    `).all();
    res.json({ success: true, count: leaks.length, data: leaks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH resolve or dismiss leak
router.patch('/:id/resolve', (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE spending_leaks
      SET status = 'resolved'
      WHERE id = ?
    `).run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Spending leak not found' });
    }
    res.json({ success: true, message: 'Spending leak resolved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
