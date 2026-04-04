// =============================================================
// File: backend/server.js
// Purpose: HTTP + WebSocket server entry point
// =============================================================

require('dotenv').config();

const http     = require('http');
const { Server } = require('socket.io');

const app              = require('./src/app');
const { connectDB, sequelize } = require('./src/config/database');
const logger           = require('./src/config/logger');
const { AlertRule, AlertHistory, Campaign } = require('./src/models');

const PORT = process.env.PORT || 5000;

// ------------------------------------------------------------------
// Create HTTP server (so Socket.io can share the same port)
// ------------------------------------------------------------------
const server = http.createServer(app);

// ------------------------------------------------------------------
// Socket.io — Real-Time Notification System (Task 2.3)
// ------------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Map: userId → Set of socket IDs (supports multiple tabs)
const userSockets = new Map();

io.on('connection', (socket) => {
  logger.info(`WS connected: ${socket.id}`);

  // Client sends { userId } after connecting
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);
    logger.info(`Socket ${socket.id} joined room user:${userId}`);
  });

  socket.on('disconnect', () => {
    userSockets.forEach((sockets, userId) => {
      sockets.delete(socket.id);
      if (sockets.size === 0) userSockets.delete(userId);
    });
    logger.info(`WS disconnected: ${socket.id}`);
  });
});

// ------------------------------------------------------------------
// Alert engine — called after every campaign update
// Checks configurable threshold rules and fires socket events
// ------------------------------------------------------------------
const checkAlerts = async (campaign) => {
  try {
    const rules = await AlertRule.findAll({
      where: { campaign_id: campaign.id, is_active: true },
    });

    for (const rule of rules) {
      let currentValue;

      if (rule.metric === 'ctr') {
        const imp = parseFloat(campaign.impressions) || 0;
        const clk = parseFloat(campaign.clicks) || 0;
        currentValue = imp > 0 ? (clk / imp) * 100 : 0;
      } else if (rule.metric === 'budget_spent_pct') {
        const budget = parseFloat(campaign.budget) || 0;
        const spent  = parseFloat(campaign.spent)  || 0;
        currentValue = budget > 0 ? (spent / budget) * 100 : 0;
      } else {
        continue;
      }

      const triggered =
        (rule.condition === 'below' && currentValue < parseFloat(rule.threshold)) ||
        (rule.condition === 'above' && currentValue > parseFloat(rule.threshold));

      if (triggered) {
        const message = `⚠️ Alert: "${campaign.name}" — ${rule.metric} is ${currentValue.toFixed(2)} (${rule.condition} threshold ${rule.threshold})`;

        // Persist to DB
        const alert = await AlertHistory.create({
          campaign_id: campaign.id,
          rule_id:     rule.id,
          message,
          metric:    rule.metric,
          value:     currentValue,
          threshold: rule.threshold,
        });

        // Emit to user's room via WebSocket
        io.to(`user:${campaign.user_id}`).emit('alert', {
          id:          alert.id,
          campaign_id: campaign.id,
          message,
          metric:    rule.metric,
          value:     currentValue,
          threshold: rule.threshold,
          triggered_at: alert.triggered_at,
        });

        logger.info(`Alert fired for campaign ${campaign.id}: ${message}`);
      }
    }
  } catch (err) {
    logger.error(`Alert engine error: ${err.message}`);
  }
};

// Expose checkAlerts so campaignController can call it via req.app.get()
app.set('checkAlerts', checkAlerts);
app.set('io', io);

// ------------------------------------------------------------------
// Bootstrap: connect DB → sync models → start server
// ------------------------------------------------------------------
const bootstrap = async () => {
  try {
    await connectDB();

    // Sync models (alter: true updates schema without dropping data)
    // In production, use migrations instead of sync
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    logger.info('✅ Database models synced');

    server.listen(PORT, () => {
      logger.info(`🚀 Backend API running on http://localhost:${PORT}`);
      logger.info(`🔌 WebSocket server ready`);
    });
  } catch (err) {
    logger.error(`❌ Server failed to start: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => {
    sequelize.close();
    process.exit(0);
  });
});

bootstrap();
