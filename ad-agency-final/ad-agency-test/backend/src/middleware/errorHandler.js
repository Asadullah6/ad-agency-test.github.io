// =============================================================
// File: backend/src/middleware/errorHandler.js
// Purpose: Global error handling middleware
// =============================================================

const logger = require('../config/logger');

/**
 * notFound — 404 handler for unknown routes.
 * Mount BEFORE errorHandler.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * errorHandler — Global error handler.
 * Must be the LAST middleware registered (4 params).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 422;
    message    = err.errors?.map((e) => e.message).join(', ') || message;
  }

  // Sequelize FK constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message    = 'Referenced record does not exist.';
  }

  // JWT errors (shouldn't reach here, but safety net)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token.';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error({ message: err.message, stack: err.stack, url: req.originalUrl });
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
