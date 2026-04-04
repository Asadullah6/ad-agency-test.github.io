// =============================================================
// File: backend/src/models/AlertHistory.js
// Purpose: Persisted notification/alert history
// =============================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertHistory = sequelize.define(
  'AlertHistory',
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
    rule_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metric:    { type: DataTypes.STRING(100), allowNull: true },
    value:     { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    threshold: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    triggered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'alert_history',
    timestamps: false,
  }
);

module.exports = AlertHistory;
