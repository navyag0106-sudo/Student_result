const express = require('express');
const router = express.Router();

// Hardcoded admin credentials for demo
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const userData = {
      email: ADMIN_EMAIL,
      username: 'admin',
      role: 'admin',
      uid: 'admin-uid-demo'
    };
    return res.json({ success: true, message: 'Login successful', user: userData });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

// Register route (placeholder)
router.post('/register', (req, res) => {
  res.json({ success: true, message: 'Register endpoint' });
});

module.exports = router;
