// =============================================================
// File: backend/src/routes/alertRoutes.js
// Purpose: Alert history & notification routes
// =============================================================

const express = require('express');
const router  = express.Router();

const { getAlertHistory, markAlertRead } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET   /alerts/history          — get notification history
// PATCH /alerts/history/:id/read — mark one alert as read
router.get('/history', getAlertHistory);
router.patch('/history/:id/read', markAlertRead);

module.exports = router;
