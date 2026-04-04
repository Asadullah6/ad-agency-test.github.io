// =============================================================
// File: backend/src/middleware/validate.js
// Purpose: express-validator input validation middleware
// =============================================================

const { validationResult, body, query, param } = require('express-validator');

/**
 * runValidation — Collect validation errors and return 422 if any.
 * Always add this AFTER your validation chain.
 */
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ------------------------------------------------------------------
// Auth Validators
// ------------------------------------------------------------------
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  runValidation,
];

// ------------------------------------------------------------------
// Campaign Validators
// ------------------------------------------------------------------
const PLATFORMS = ['Google Ads', 'Meta', 'LinkedIn', 'TikTok'];
const STATUSES  = ['draft', 'active', 'paused', 'completed'];

const validateCreateCampaign = [
  body('name')
    .trim()
    .notEmpty().withMessage('Campaign name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be 2–255 characters'),

  body('platform')
    .notEmpty().withMessage('Platform is required')
    .isIn(PLATFORMS).withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),

  body('status')
    .optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),

  body('spent')
    .optional()
    .isFloat({ min: 0 }).withMessage('Spent must be a non-negative number'),

  body('impressions')
    .optional()
    .isInt({ min: 0 }).withMessage('Impressions must be a non-negative integer'),

  body('clicks')
    .optional()
    .isInt({ min: 0 }).withMessage('Clicks must be a non-negative integer'),

  body('conversions')
    .optional()
    .isInt({ min: 0 }).withMessage('Conversions must be a non-negative integer'),

  body('start_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('start_date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('end_date must be a valid date (YYYY-MM-DD)'),

  runValidation,
];

const validateUpdateCampaign = [
  param('id').isUUID().withMessage('Campaign ID must be a valid UUID'),
  // All fields optional on update
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Name must be 2–255 characters'),
  body('platform').optional().isIn(PLATFORMS).withMessage(`Invalid platform`),
  body('status').optional().isIn(STATUSES).withMessage(`Invalid status`),
  body('budget').optional().isFloat({ min: 0 }),
  body('spent').optional().isFloat({ min: 0 }),
  body('impressions').optional().isInt({ min: 0 }),
  body('clicks').optional().isInt({ min: 0 }),
  body('conversions').optional().isInt({ min: 0 }),
  body('start_date').optional({ nullable: true }).isISO8601(),
  body('end_date').optional({ nullable: true }).isISO8601(),
  runValidation,
];

const validateCampaignId = [
  param('id').isUUID().withMessage('Campaign ID must be a valid UUID'),
  runValidation,
];

// ------------------------------------------------------------------
// Query param validators (pagination / filtering)
// ------------------------------------------------------------------
const validateListQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('status').optional().isIn(STATUSES),
  query('platform').optional().isIn(PLATFORMS),
  query('sortBy').optional().isIn(['name', 'budget', 'spent', 'created_at', 'status']),
  query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
  runValidation,
];

module.exports = {
  validateLogin,
  validateCreateCampaign,
  validateUpdateCampaign,
  validateCampaignId,
  validateListQuery,
};
