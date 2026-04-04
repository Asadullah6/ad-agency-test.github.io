// =============================================================
// File: backend/src/controllers/alertController.js
// Purpose: CRUD for alert rules + notification history
// =============================================================

const { AlertRule, AlertHistory, Campaign } = require('../models');

// GET /alerts/history — fetch all notification history for user's campaigns
const getAlertHistory = async (req, res, next) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    // Get user's campaign IDs first
    const userCampaigns = await Campaign.findAll({
      where: { user_id: req.user.id, deleted_at: null },
      attributes: ['id'],
    });
    const campaignIds = userCampaigns.map((c) => c.id);

    const { count, rows } = await AlertHistory.findAndCountAll({
      where: { campaign_id: campaignIds },
      order: [['triggered_at', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        alerts: rows,
        unreadCount: rows.filter((a) => !a.is_read).length,
        pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /alerts/history/:id/read — mark alert as read
const markAlertRead = async (req, res, next) => {
  try {
    await AlertHistory.update(
      { is_read: true },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ success: true, message: 'Alert marked as read.' });
  } catch (err) {
    next(err);
  }
};

// POST /campaigns/:id/alert-rules — create alert rule for a campaign
const createAlertRule = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id, deleted_at: null },
    });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const rule = await AlertRule.create({
      campaign_id: campaign.id,
      metric:    req.body.metric,
      condition: req.body.condition,
      threshold: req.body.threshold,
    });

    res.status(201).json({ success: true, data: { rule } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlertHistory, markAlertRead, createAlertRule };
