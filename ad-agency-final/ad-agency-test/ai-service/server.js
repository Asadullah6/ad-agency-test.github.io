// =============================================================
// File: ai-service/server.js
// Purpose: AI Microservice entry point
// =============================================================

require('dotenv').config();

const app    = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 4000;

// Validate required env vars at startup
if (!process.env.OPENAI_API_KEY) {
  logger.error('❌ OPENAI_API_KEY is not set. Exiting.');
  process.exit(1);
}

const server = app.listen(PORT, () => {
  logger.info(`🤖 AI Service running on http://localhost:${PORT}`);
  logger.info(`   Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — AI service shutting down');
  server.close(() => process.exit(0));
});
