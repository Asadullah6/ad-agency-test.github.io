// =============================================================
// File: backend/src/routes/campaignRoutes.js
// Purpose: Campaign CRUD routes — all protected by JWT
// =============================================================

const express = require('express');
const router  = express.Router();

const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require('../controllers/campaignController');

const { createAlertRule } = require('../controllers/alertController');

const { protect } = require('../middleware/auth');
const {
  validateCreateCampaign,
  validateUpdateCampaign,
  validateCampaignId,
  validateListQuery,
} = require('../middleware/validate');

// All campaign routes require authentication
router.use(protect);

// GET  /campaigns        — list with pagination, filtering, sorting
// POST /campaigns        — create new campaign
router
  .route('/')
  .get(validateListQuery, getCampaigns)
  .post(validateCreateCampaign, createCampaign);

// GET    /campaigns/:id  — get single campaign with full metrics
// PUT    /campaigns/:id  — update campaign
// DELETE /campaigns/:id  — soft delete
router
  .route('/:id')
  .get(validateCampaignId, getCampaignById)
  .put(validateUpdateCampaign, updateCampaign)
  .delete(validateCampaignId, deleteCampaign);

// POST /campaigns/:id/alert-rules — create alert rule for a campaign
router.post('/:id/alert-rules', createAlertRule);

module.exports = router;
