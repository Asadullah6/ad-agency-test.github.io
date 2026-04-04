// =============================================================
// File: backend/src/models/index.js
// Purpose: Load all models and set up associations
// =============================================================

const User        = require('./User');
const Campaign    = require('./Campaign');
const AlertRule   = require('./AlertRule');
const AlertHistory = require('./AlertHistory');

// ---- Associations ----------------------------------------
// A user owns many campaigns
User.hasMany(Campaign, { foreignKey: 'user_id', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// A campaign has many alert rules
Campaign.hasMany(AlertRule, { foreignKey: 'campaign_id', as: 'alertRules' });
AlertRule.belongsTo(Campaign, { foreignKey: 'campaign_id' });

// A campaign has many alert history entries
Campaign.hasMany(AlertHistory, { foreignKey: 'campaign_id', as: 'alerts' });
AlertHistory.belongsTo(Campaign, { foreignKey: 'campaign_id' });

module.exports = { User, Campaign, AlertRule, AlertHistory };
