const express = require('express');
const path = require('node:path');
const cors = require('cors');

const subscriptionsRouter = require('./routes/subscriptions');
const leaksRouter = require('./routes/leaks');
const cashflowRouter = require('./routes/cashflow');
const seedAuraFlow = require('./database/seed');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Endpoints
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/leaks', leaksRouter);
app.use('/api/cashflow', cashflowRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AuraFlow Ledger API', timestamp: new Date().toISOString() });
});

// Seed data
seedAuraFlow();

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` AuraFlow Cashflow & Spending Platform`);
  console.log(` Running at http://localhost:${PORT}`);
  console.log(`===============================================`);
});
