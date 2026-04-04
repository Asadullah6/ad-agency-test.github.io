// =============================================================
// File: backend/src/routes/authRoutes.js
// Purpose: Authentication routes
// =============================================================

const express = require('express');
const router  = express.Router();

const { login, getMe }    = require('../controllers/authController');
const { protect }         = require('../middleware/auth');
const { validateLogin }   = require('../middleware/validate');

// POST /auth/login
router.post('/login', validateLogin, login);

// GET /auth/me  — requires token
router.get('/me', protect, getMe);

module.exports = router;
