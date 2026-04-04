// =============================================================
// File: ai-service/src/controllers/generateController.js
// Purpose: Handle all /generate/* endpoints
// =============================================================

const {
  generateAdCopy,
  generateAdCopyStream,
  generateSocialCaptions,
  generateHashtags,
} = require('../services/openaiService');
const logger = require('../config/logger');

// ------------------------------------------------------------------
// POST /generate/copy
// Body: { product, tone, platform, word_limit }
// Returns: { headline, body, cta }
// Also supports SSE streaming when Accept: text/event-stream
// ------------------------------------------------------------------
const generateCopy = async (req, res, next) => {
  try {
    const { product, tone, platform, word_limit } = req.body;

    if (!product) {
      return res.status(422).json({ success: false, message: '`product` is required.' });
    }

    const requestId = req.requestId;

    // ---- SSE Streaming path ----------------------------------------
    if (req.headers.accept === 'text/event-stream') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const stream = await generateAdCopyStream({ product, tone, platform, word_limit, requestId });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          res.write(`data: ${JSON.stringify({ chunk: delta })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // ---- Regular JSON path -----------------------------------------
    const result = await generateAdCopy({ product, tone, platform, word_limit, requestId });

    logger.info({ requestId, action: 'generate_copy', product });

    res.status(200).json({
      success: true,
      data: result,
      requestId,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /generate/social
// Body: { platform, campaign_goal, brand_voice }
// Returns: { captions: [5 strings] }
// ------------------------------------------------------------------
const generateSocial = async (req, res, next) => {
  try {
    const { platform, campaign_goal, brand_voice } = req.body;
    const requestId = req.requestId;

    const result = await generateSocialCaptions({
      platform,
      campaign_goal,
      brand_voice,
      requestId,
    });

    // Ensure we always return exactly 5 captions
    const captions = Array.isArray(result.captions)
      ? result.captions.slice(0, 5)
      : [];

    logger.info({ requestId, action: 'generate_social', platform });

    res.status(200).json({
      success: true,
      data: { captions },
      requestId,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /generate/hashtags
// Body: { content, industry }
// Returns: { hashtags: [10 strings] }
// ------------------------------------------------------------------
const generateHashtagsCtrl = async (req, res, next) => {
  try {
    const { content, industry } = req.body;
    const requestId = req.requestId;

    if (!content) {
      return res.status(422).json({ success: false, message: '`content` is required.' });
    }

    const result = await generateHashtags({ content, industry, requestId });

    // Ensure exactly 10 hashtags
    const hashtags = Array.isArray(result.hashtags)
      ? result.hashtags.slice(0, 10)
      : [];

    logger.info({ requestId, action: 'generate_hashtags', industry });

    res.status(200).json({
      success: true,
      data: { hashtags },
      requestId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateCopy, generateSocial, generateHashtagsCtrl };
