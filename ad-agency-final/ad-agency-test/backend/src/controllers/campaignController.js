// =============================================================
// File: backend/src/controllers/campaignController.js
// Purpose: Full CRUD for campaigns with pagination / filtering
// =============================================================

const { Op } = require('sequelize');
const { Campaign, AlertRule } = require('../models');
const logger = require('../config/logger');

// ------------------------------------------------------------------
// Helper: build Sequelize WHERE clause from query params
// ------------------------------------------------------------------
const buildWhereClause = (query, userId) => {
  const where = {
    deleted_at: null,   // always exclude soft-deleted
    user_id: userId,    // scope to current user
  };

  if (query.status)   where.status   = query.status;
  if (query.platform) where.platform = query.platform;

  // Free-text search on name
  if (query.search) {
    where.name = { [Op.iLike]: `%${query.search}%` };
  }

  // Budget range filter
  if (query.minBudget) where.budget = { [Op.gte]: parseFloat(query.minBudget) };
  if (query.maxBudget) where.budget = { ...where.budget, [Op.lte]: parseFloat(query.maxBudget) };

  return where;
};

// ------------------------------------------------------------------
// GET /campaigns
// Query: page, limit, status, platform, search, sortBy, sortOrder
// ------------------------------------------------------------------
const getCampaigns = async (req, res, next) => {
  try {
    const page      = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit     = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset    = (page - 1) * limit;
    const sortBy    = req.query.sortBy    || 'created_at';
    const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase();

    const where = buildWhereClause(req.query, req.user.id);

    const { count, rows } = await Campaign.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      attributes: { exclude: [] },
    });

    res.status(200).json({
      success: true,
      data: {
        campaigns: rows,
        pagination: {
          total:       count,
          page,
          limit,
          totalPages:  Math.ceil(count / limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// GET /campaigns/:id
// ------------------------------------------------------------------
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id, deleted_at: null },
      include: [{ model: AlertRule, as: 'alertRules' }],
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    res.status(200).json({ success: true, data: { campaign } });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /campaigns
// ------------------------------------------------------------------
const createCampaign = async (req, res, next) => {
  try {
    const {
      name, status, platform, budget, spent,
      impressions, clicks, conversions, start_date, end_date,
    } = req.body;

    const campaign = await Campaign.create({
      user_id: req.user.id,
      name,
      status,
      platform,
      budget:      budget      ?? 0,
      spent:       spent       ?? 0,
      impressions: impressions ?? 0,
      clicks:      clicks      ?? 0,
      conversions: conversions ?? 0,
      start_date:  start_date  ?? null,
      end_date:    end_date    ?? null,
    });

    logger.info(`Campaign created: ${campaign.id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully.',
      data: { campaign },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// PUT /campaigns/:id
// ------------------------------------------------------------------
const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id, deleted_at: null },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    // Only update fields that were sent in the request body
    const allowedFields = [
      'name', 'status', 'platform', 'budget', 'spent',
      'impressions', 'clicks', 'conversions', 'start_date', 'end_date',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });

    await campaign.save();

    logger.info(`Campaign updated: ${campaign.id}`);

    // Check alert rules after update (trigger socket events if needed)
    // This hook lives in the WebSocket service — see app.js
    req.app.get('checkAlerts')?.(campaign);

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully.',
      data: { campaign },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// DELETE /campaigns/:id  — Soft delete (sets deleted_at)
// ------------------------------------------------------------------
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id, deleted_at: null },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    // Soft delete — set deleted_at timestamp instead of destroying row
    campaign.deleted_at = new Date();
    await campaign.save();

    logger.info(`Campaign soft-deleted: ${campaign.id}`);

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};
