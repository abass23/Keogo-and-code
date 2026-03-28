-- ============================================================
-- Keogo & Code — Initial Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users / Profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  native_language TEXT NOT NULL DEFAULT 'fr' CHECK (native_language IN ('fr', 'en')),
  current_level TEXT NOT NULL DEFAULT 'N5' CHECK (current_level IN ('N5', 'N4', 'N3', 'N2')),
  daily_goal INTEGER NOT NULL DEFAULT 50,
  streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Vocabulary ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kanji TEXT NOT NULL,
  hiragana TEXT NOT NULL,
  romaji TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  meaning_fr TEXT NOT NULL,
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2')),
  domain TEXT NOT NULL CHECK (domain IN ('core', 'embedded', 'automotive', 'business')),
  subdomain TEXT,
  part_of_speech TEXT,
  audio_url TEXT,
  example_sentences JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_jlpt ON vocabulary(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_domain ON vocabulary(domain);

-- ── Kanji ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanji (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character TEXT UNIQUE NOT NULL,
  onyomi TEXT[] NOT NULL DEFAULT '{}',
  kunyomi TEXT[] NOT NULL DEFAULT '{}',
  meaning_en TEXT NOT NULL,
  meaning_fr TEXT NOT NULL,
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2')),
  stroke_count INTEGER,
  radicals TEXT[] NOT NULL DEFAULT '{}',
  mnemonic TEXT,
  svg_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt_level);

-- ── User SRS card state ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL DEFAULT 'vocab' CHECK (card_type IN ('vocab', 'reverse', 'listening', 'context', 'kanji')),
  interval INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_review TIMESTAMPTZ,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, vocabulary_id, card_type)
);

CREATE INDEX IF NOT EXISTS idx_user_cards_user_review ON user_cards(user_id, next_review);

-- ── Conversations (AI simulator) ──────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('jikoshoukai', 'interview', 'daily', 'technical')),
  messages JSONB NOT NULL DEFAULT '[]',
  feedback JSONB,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, created_at DESC);

-- ── Study sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('review', 'learn', 'listen', 'converse')),
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, created_at DESC);

-- ── Gamification ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- ── Review log (for heatmap) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cards_count INTEGER NOT NULL DEFAULT 1,
  xp_earned INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_review_log_user_date ON review_log(user_id, reviewed_at DESC);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_log ENABLE ROW LEVEL SECURITY;

-- vocabulary and kanji are public (read-only for authenticated users)
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanji ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vocab readable by authenticated" ON vocabulary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kanji readable by authenticated" ON kanji FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profile: own row only" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Cards: own rows only" ON user_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Conversations: own rows only" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Sessions: own rows only" ON study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "XP: own row only" ON user_xp FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Badges: own rows only" ON user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Review log: own rows only" ON review_log FOR ALL USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, native_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'native_language', 'fr')
  );
  INSERT INTO user_xp (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_cards_updated_at BEFORE UPDATE ON user_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
