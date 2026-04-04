// =============================================================
// File: backend/src/models/Campaign.js
// Purpose: Sequelize Campaign model with computed fields
// =============================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Campaign = sequelize.define(
  'Campaign',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Campaign name cannot be empty' },
        len: { args: [2, 255], msg: 'Name must be 2–255 characters' },
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
      defaultValue: 'draft',
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM('Google Ads', 'Meta', 'LinkedIn', 'TikTok'),
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },
    spent: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },
    impressions: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      validate: { min: 0 },
    },
    clicks: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      validate: { min: 0 },
    },
    conversions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Computed in JS so we don't rely on the GENERATED ALWAYS column for writes
    ctr: {
      type: DataTypes.VIRTUAL,
      get() {
        const imp = parseFloat(this.getDataValue('impressions')) || 0;
        const clk = parseFloat(this.getDataValue('clicks')) || 0;
        if (imp === 0) return 0;
        return parseFloat(((clk / imp) * 100).toFixed(4));
      },
    },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date:   { type: DataTypes.DATEONLY, allowNull: true },
    deleted_at: { type: DataTypes.DATE,     allowNull: true, defaultValue: null },
  },
  {
    tableName: 'campaigns',
    paranoid: false,  // We manage soft-delete manually via deleted_at
    defaultScope: {
      where: { deleted_at: null }, // always exclude soft-deleted records
    },
    scopes: {
      withDeleted: { where: {} },
    },
  }
);

module.exports = Campaign;
