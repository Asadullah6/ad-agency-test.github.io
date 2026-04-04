// =============================================================
// File: backend/src/controllers/authController.js
// Purpose: Handle POST /auth/login
// =============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger   = require('../config/logger');

/**
 * Generate a signed JWT token for a user.
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Issue token
    const token = signToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user.toSafeObject ? req.user.toSafeObject() : req.user },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
