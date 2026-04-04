// =============================================================
// File: backend/src/middleware/rateLimiter.js
// Purpose: Rate limiting — 100 requests/min per IP
// =============================================================

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,             // 100 req/min
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:   false,  // Disable the X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in a minute.',
  },
  // Custom key: use IP address (default)
  keyGenerator: (req) => req.ip,
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health',
});

module.exports = rateLimiter;
