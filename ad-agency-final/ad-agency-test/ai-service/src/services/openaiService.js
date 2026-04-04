// =============================================================
// File: ai-service/src/services/openaiService.js
// Purpose: OpenAI API wrapper — all LLM calls live here
// =============================================================

const OpenAI = require('openai');
const logger = require('../config/logger');

// Initialise client once (reads key from env — never hardcoded)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ------------------------------------------------------------------
// Helper: call OpenAI chat completion and return parsed JSON
// Throws on API error so controllers can handle via try/catch
// ------------------------------------------------------------------
const callOpenAI = async ({ systemPrompt, userPrompt, requestId, stream = false }) => {
  logger.debug({ requestId, model: MODEL, action: 'openai_call' });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt   },
  ];

  if (stream) {
    // Return the raw stream — controller handles SSE forwarding
    return openai.chat.completions.create({ model: MODEL, messages, stream: true });
  }

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: 'json_object' }, // force JSON output
    temperature: 0.8,
  });

  const raw = response.choices[0]?.message?.content || '{}';

  try {
    return JSON.parse(raw);
  } catch {
    logger.warn({ requestId, raw, msg: 'Failed to parse JSON from OpenAI' });
    throw new Error('AI returned malformed JSON.');
  }
};

// ------------------------------------------------------------------
// generateAdCopy — POST /generate/copy
// ------------------------------------------------------------------
const generateAdCopy = async ({ product, tone, platform, word_limit, requestId }) => {
  const systemPrompt = `You are an expert advertising copywriter. 
Always respond with valid JSON only — no markdown, no explanation.
JSON shape: { "headline": string, "body": string, "cta": string }`;

  const userPrompt = `Write ad copy for:
Product/Service: ${product}
Tone: ${tone || 'professional'}
Platform: ${platform || 'general'}
Word limit for body: ${word_limit || 50} words

Return JSON with headline, body, and CTA.`;

  return callOpenAI({ systemPrompt, userPrompt, requestId });
};

// ------------------------------------------------------------------
// generateAdCopyStream — SSE version of generateAdCopy
// ------------------------------------------------------------------
const generateAdCopyStream = ({ product, tone, platform, word_limit, requestId }) => {
  const systemPrompt = `You are an expert advertising copywriter. Write compelling ad copy.`;

  const userPrompt = `Write ad copy for:
Product/Service: ${product}
Tone: ${tone || 'professional'}
Platform: ${platform || 'general'}
Word limit: ${word_limit || 50} words

Format: Headline: ... | Body: ... | CTA: ...`;

  return callOpenAI({ systemPrompt, userPrompt, requestId, stream: true });
};

// ------------------------------------------------------------------
// generateSocialCaptions — POST /generate/social
// ------------------------------------------------------------------
const generateSocialCaptions = async ({ platform, campaign_goal, brand_voice, requestId }) => {
  const systemPrompt = `You are a social media content strategist.
Always respond with valid JSON only.
JSON shape: { "captions": [string, string, string, string, string] }`;

  const userPrompt = `Generate 5 unique social media captions for:
Platform: ${platform || 'Instagram'}
Campaign Goal: ${campaign_goal || 'brand awareness'}
Brand Voice: ${brand_voice || 'friendly and engaging'}

Return JSON with exactly 5 captions in an array.`;

  return callOpenAI({ systemPrompt, userPrompt, requestId });
};

// ------------------------------------------------------------------
// generateHashtags — POST /generate/hashtags
// ------------------------------------------------------------------
const generateHashtags = async ({ content, industry, requestId }) => {
  const systemPrompt = `You are a social media hashtag expert.
Always respond with valid JSON only.
JSON shape: { "hashtags": [string x10] }`;

  const userPrompt = `Generate exactly 10 relevant hashtags for:
Content: ${content}
Industry: ${industry || 'general'}

Rules: Include mix of popular and niche tags. Include the # symbol. Return JSON with "hashtags" array of 10 strings.`;

  return callOpenAI({ systemPrompt, userPrompt, requestId });
};

module.exports = {
  generateAdCopy,
  generateAdCopyStream,
  generateSocialCaptions,
  generateHashtags,
};
