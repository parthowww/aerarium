const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET full treasury summary & runway mathematics
router.get('/summary', (req, res) => {
  try {
    const reserves = db.prepare('SELECT * FROM treasury_reserves LIMIT 1').get() || {
      cash_in_bank: 185000.00,
      monthly_inflow: 32000.00,
      non_saas_burn: 14500.00
    };

    // Calculate active SaaS burn
    const saasBurn = db.prepare("SELECT ROUND(SUM(cost), 2) as total FROM subscriptions WHERE status = 'active'").get().total || 0;
    const totalSubs = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get().count;
    const activeSubs = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get().count;

    // Potential savings
    const leaksSummary = db.prepare(`
      SELECT COUNT(*) as count, ROUND(COALESCE(SUM(potential_savings), 0), 2) as total_savings
      FROM spending_leaks
      WHERE status = 'active'
    `).get();

    // Financial formulas
    const grossMonthlyBurn = reserves.non_saas_burn + saasBurn;
    const netMonthlyBurn = Math.max(0, grossMonthlyBurn - reserves.monthly_inflow);
    const effectiveBurnForRunway = netMonthlyBurn > 0 ? netMonthlyBurn : grossMonthlyBurn;
    const runwayMonths = parseFloat((reserves.cash_in_bank / effectiveBurnForRunway).toFixed(1));
    const runwayDays = Math.round(runwayMonths * 30.4);

    // Categories
    const categoryBreakdown = db.prepare(`
      SELECT category, ROUND(SUM(cost), 2) as spend, COUNT(*) as count
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY category
      ORDER BY spend DESC
    `).all();

    res.json({
      success: true,
      data: {
        cash_in_bank: reserves.cash_in_bank,
        monthly_inflow: reserves.monthly_inflow,
        non_saas_burn: reserves.non_saas_burn,
        saas_monthly_burn: saasBurn,
        gross_monthly_burn: grossMonthlyBurn,
        net_monthly_burn: netMonthlyBurn,
        annualized_saas_burn: Math.round(saasBurn * 12),
        runway_months: runwayMonths,
        runway_days: runwayDays,
        total_subscriptions: totalSubs,
        active_subscriptions: activeSubs,
        identified_savings: leaksSummary.total_savings,
        active_leaks_count: leaksSummary.count,
        categories: categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH update bank cash reserve balance (for live simulation!)
router.patch('/reserves', (req, res) => {
  try {
    const { cash_in_bank } = req.body;
    if (cash_in_bank !== undefined) {
      db.prepare('UPDATE treasury_reserves SET cash_in_bank = ?, updated_at = datetime("now")').run(parseFloat(cash_in_bank));
    }
    res.json({ success: true, message: 'Reserves updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
