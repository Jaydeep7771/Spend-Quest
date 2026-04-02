CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(15),
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  type VARCHAR(30),
  source VARCHAR(30),
  masked_number VARCHAR(20),
  balance NUMERIC(12,2),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  amount NUMERIC(10,2) NOT NULL,
  type VARCHAR(10) NOT NULL,
  merchant_raw TEXT,
  merchant_clean VARCHAR(200),
  merchant_hash VARCHAR(64),
  category VARCHAR(50),
  subcategory VARCHAR(50),
  plain_label TEXT,
  note TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval VARCHAR(20),
  tags TEXT[],
  source VARCHAR(20),
  raw_sms TEXT,
  tx_date DATE NOT NULL,
  tx_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_category_cache (
  merchant_hash VARCHAR(64) PRIMARY KEY,
  merchant_raw TEXT,
  merchant_clean VARCHAR(200),
  category VARCHAR(50),
  subcategory VARCHAR(50),
  plain_label TEXT,
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  period VARCHAR(10) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_at_percent INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  level_name VARCHAR(50) DEFAULT 'Rookie Saver',
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  xp_reset_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50),
  xp_awarded INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  icon VARCHAR(10),
  xp_reward INTEGER DEFAULT 50,
  condition_type VARCHAR(50),
  condition_value JSONB
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_type VARCHAR(30) DEFAULT 'daily_review'
);

CREATE TABLE IF NOT EXISTS quests (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  type VARCHAR(30),
  difficulty VARCHAR(10),
  xp_reward INTEGER,
  badge_reward VARCHAR(50),
  duration_days INTEGER,
  condition JSONB,
  is_recurring BOOLEAN DEFAULT true,
  recurrence VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id VARCHAR(50) REFERENCES quests(id),
  status VARCHAR(20) DEFAULT 'active',
  progress JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  invite_code VARCHAR(12) UNIQUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS squad_members (
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (squad_id, user_id)
);

CREATE TABLE IF NOT EXISTS arena_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES users(id),
  opponent_id UUID REFERENCES users(id),
  category VARCHAR(50),
  period_start DATE,
  period_end DATE,
  status VARCHAR(20) DEFAULT 'pending',
  winner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spend_wrapped (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER,
  year INTEGER,
  data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
