-- =============================================================
-- AdMetrics Dashboard — PostgreSQL Schema
-- File: backend/schema.sql
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- USERS TABLE (for JWT authentication)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,         -- bcrypt hashed
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(50) DEFAULT 'user',    -- 'admin' | 'user'
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------------------
-- CAMPAIGNS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  status        VARCHAR(50) NOT NULL DEFAULT 'draft',
                -- 'draft' | 'active' | 'paused' | 'completed'
  platform      VARCHAR(100) NOT NULL,
                -- 'Google Ads' | 'Meta' | 'LinkedIn' | 'TikTok'
  budget        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  spent         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  impressions   BIGINT NOT NULL DEFAULT 0,
  clicks        BIGINT NOT NULL DEFAULT 0,
  conversions   INT NOT NULL DEFAULT 0,
  ctr           NUMERIC(6, 4) GENERATED ALWAYS AS (
                  CASE WHEN impressions > 0
                    THEN ROUND((clicks::NUMERIC / impressions) * 100, 4)
                    ELSE 0
                  END
                ) STORED,
  start_date    DATE,
  end_date      DATE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE DEFAULT NULL  -- soft delete
);

-- -------------------------------------------------------------
-- ALERT RULES TABLE (Task 2.3 — Real-Time Notifications)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  metric        VARCHAR(100) NOT NULL,   -- 'ctr' | 'budget_spent_pct'
  condition     VARCHAR(20) NOT NULL,    -- 'below' | 'above'
  threshold     NUMERIC(10, 4) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------------------
-- ALERT HISTORY TABLE (persisted notifications)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  rule_id       UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  message       TEXT NOT NULL,
  metric        VARCHAR(100),
  value         NUMERIC(10, 4),
  threshold     NUMERIC(10, 4),
  is_read       BOOLEAN DEFAULT FALSE,
  triggered_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------------------
-- INDEXES for performance
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id    ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status     ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform   ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted_at ON campaigns(deleted_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_campaign ON alert_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_is_read  ON alert_history(is_read);

-- -------------------------------------------------------------
-- Seed: default admin user
-- password: Admin@1234  (bcrypt hash below)
-- -------------------------------------------------------------
INSERT INTO users (email, password, name, role) VALUES (
  'admin@admetrics.com',
  '$2b$12$lGCMHBNNHyI8zS7BVPf5uu4SOJSaFUKlQ3E.jQkzovfHSFNt9v5re',
  'Admin User',
  'admin'
) ON CONFLICT (email) DO NOTHING;
