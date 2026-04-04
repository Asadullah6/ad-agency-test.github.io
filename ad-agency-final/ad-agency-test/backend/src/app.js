// =============================================================
// File: backend/src/app.js
// Purpose: Express app configuration (no server listen here)
// =============================================================

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const rateLimiter              = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger                   = require('./config/logger');

// Route imports
const authRoutes     = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const alertRoutes    = require('./routes/alertRoutes');

const app = express();

// ------------------------------------------------------------------
// Security & parsing middleware
// ------------------------------------------------------------------
app.use(helmet());                               // Set secure HTTP headers
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));        // Parse JSON body (limit size)
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------------
// Request logging (Morgan → Winston)
// ------------------------------------------------------------------
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.path === '/health',       // skip health check logs
  })
);

// ------------------------------------------------------------------
// Rate limiting — 100 req/min per IP
// ------------------------------------------------------------------
app.use(rateLimiter);

// ------------------------------------------------------------------
// Health check (unauthenticated)
// ------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'AdMetrics Backend API',
    status:  'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------
app.use('/auth',      authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/alerts',    alertRoutes);

// ------------------------------------------------------------------
// 404 + Global Error Handler (must be last)
// ------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
