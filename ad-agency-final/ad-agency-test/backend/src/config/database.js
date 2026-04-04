// =============================================================
// File: backend/src/config/database.js
// Purpose: Sequelize connection to PostgreSQL
// =============================================================

const { Sequelize } = require('sequelize');

// Build connection from individual env vars (more explicit & secure)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => require('./logger').debug(msg)
      : false,
    pool: {
      max: 10,        // max connections in pool
      min: 0,
      acquire: 30000, // ms before throwing error
      idle: 10000,    // ms before releasing idle connection
    },
    define: {
      underscored: true,       // use snake_case columns
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

/**
 * Test the database connection.
 * Called on server start to fail fast if DB is unreachable.
 */
const connectDB = async () => {
  await sequelize.authenticate();
  console.log('✅ PostgreSQL connected successfully');
};

module.exports = { sequelize, connectDB };
