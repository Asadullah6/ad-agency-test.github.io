// =============================================================
// File: backend/src/models/AlertRule.js
// Purpose: Alert rule model for real-time notification system
// =============================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertRule = sequelize.define(
  'AlertRule',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'campaigns', key: 'id' },
    },
    metric: {
      type: DataTypes.ENUM('ctr', 'budget_spent_pct'),
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('below', 'above'),
      allowNull: false,
    },
    threshold: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'alert_rules',
    updatedAt: false,
  }
);

module.exports = AlertRule;
