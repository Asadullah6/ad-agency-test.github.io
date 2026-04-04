// =============================================================
// File: ai-service/src/config/logger.js
// Purpose: Winston logger for AI service
// =============================================================

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? format.json()
      : format.combine(
          format.colorize(),
          format.printf(({ level, message, timestamp, requestId }) =>
            `${timestamp} [${level}]${requestId ? ` [${requestId}]` : ''}: ${
              typeof message === 'object' ? JSON.stringify(message) : message
            }`
          )
        )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
