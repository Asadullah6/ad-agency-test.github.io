// =============================================================
// File: ai-service/src/routes/generateRoutes.js
// Purpose: AI generation endpoint routes
// =============================================================

const express = require('express');
const router  = express.Router();

const {
  generateCopy,
  generateSocial,
  generateHashtagsCtrl,
} = require('../controllers/generateController');

// POST /generate/copy      — ad headline, body, CTA (+ SSE streaming)
// POST /generate/social    — 5 social media captions
// POST /generate/hashtags  — 10 relevant hashtags
router.post('/copy',      generateCopy);
router.post('/social',    generateSocial);
router.post('/hashtags',  generateHashtagsCtrl);

module.exports = router;
