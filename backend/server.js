const express = require('express');
const path = require('node:path');
const cors = require('cors');

const authRouter = require('./routes/auth');
const treasuryRouter = require('./routes/treasury');
const subscriptionsRouter = require('./routes/subscriptions');
const leaksRouter = require('./routes/leaks');
const seedAerarium = require('./database/seed');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/app.html'));
});

// Static assets
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/treasury', treasuryRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/leaks', leaksRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'Aerarium Sovereign Treasury Platform',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

seedAerarium();

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Aerarium Treasury Engine Started`);
  console.log(` Landing:   http://localhost:${PORT}/`);
  console.log(` Login:     http://localhost:${PORT}/login`);
  console.log(` Console:   http://localhost:${PORT}/app`);
  console.log(`===============================================`);
});
