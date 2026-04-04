// =============================================================
// File: backend/src/middleware/auth.js
// Purpose: JWT authentication middleware
// =============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * protect — Verify JWT token from Authorization header.
 * Attaches decoded user to req.user.
 * Usage: router.get('/path', protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm user still exists in DB
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name', 'role'],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid — user no longer exists.',
      });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * restrictTo — Role-based access control.
 * Usage: router.delete('/path', protect, restrictTo('admin'), controller)
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action.',
    });
  }
  next();
};

module.exports = { protect, restrictTo };
