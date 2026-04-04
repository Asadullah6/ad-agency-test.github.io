// =============================================================
// File: ai-service/src/app.js
// Purpose: Express app for AI microservice
// =============================================================

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const { v4: uuidv4 } = require('uuid');

const logger          = require('./config/logger');
const generateRoutes  = require('./routes/generateRoutes');

const app = express();

// ------------------------------------------------------------------
// Security & parsing
// ------------------------------------------------------------------
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '10kb' }));

// ------------------------------------------------------------------
// Request logging with unique request IDs
// ------------------------------------------------------------------
app.use((req, _res, next) => {
  req.requestId = uuidv4();          // attach unique ID to every request
  next();
});

app.use(
  morgan(':method :url :status :response-time ms', {
    stream: {
      write: (msg) => logger.http(msg.trim()),
    },
  })
);

// Log each request with its ID
app.use((req, res, next) => {
  logger.info({
    requestId: req.requestId,
    method:    req.method,
    path:      req.path,
    ip:        req.ip,
  });

  // Attach requestId to response header for tracing
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// ------------------------------------------------------------------
// Health check
// ------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    success:   true,
    service:   'AdMetrics AI Microservice',
    status:    'healthy',
    model:     process.env.OPENAI_MODEL || 'gpt-4o-mini',
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.use('/generate', generateRoutes);

// ------------------------------------------------------------------
// 404
// ------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ------------------------------------------------------------------
// Global error handler
// ------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error({ requestId: req.requestId, error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    requestId: req.requestId,
  });
});

module.exports = app;
