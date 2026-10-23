const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT id, email, name, company, role, password_hash FROM users WHERE email = ?').get(email);
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/demo', (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, company, role FROM users WHERE email = ?').get('cfo@aerarium.io');
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
