const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET cashflow metrics summary
router.get('/summary', (req, res) => {
  try {
    const totalSubs = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get().count;
    const activeSubs = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get().count;
    const monthlyBurn = db.prepare("SELECT ROUND(SUM(cost), 2) as total FROM subscriptions WHERE status = 'active'").get().total || 0;
    
    const leakStats = db.prepare(`
      SELECT COUNT(*) as leak_count, ROUND(COALESCE(SUM(potential_savings), 0), 2) as total_savings
      FROM spending_leaks
      WHERE status = 'active'
    `).get();

    const snapshot = db.prepare('SELECT * FROM cashflow_snapshots ORDER BY id DESC LIMIT 1').get() || {
      total_reserves: 165000,
      runway_months: 18.8
    };

    // Category breakdown
    const categories = db.prepare(`
      SELECT category, ROUND(SUM(cost), 2) as total_cost, COUNT(*) as tool_count
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY category
      ORDER BY total_cost DESC
    `).all();

    res.json({
      success: true,
      data: {
        active_subscriptions: activeSubs,
        total_subscriptions: totalSubs,
        monthly_recurring_spend: monthlyBurn,
        annualized_spend: Math.round(monthlyBurn * 12),
        total_savings_identified: leakStats.total_savings,
        active_leaks_count: leakStats.leak_count,
        cash_reserves: snapshot.total_reserves,
        runway_months: snapshot.runway_months,
        category_breakdown: categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
