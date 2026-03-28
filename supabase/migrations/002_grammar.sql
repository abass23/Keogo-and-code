-- ============================================================
-- Keogo & Code — Grammar Dojo Schema (Phase 5)
-- ============================================================

-- ── Grammar Points ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grammar_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,              -- e.g., "～なければならない"
  meaning_en TEXT NOT NULL,           -- "must / have to"
  meaning_fr TEXT NOT NULL,           -- "devoir / il faut"
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2')),
  category TEXT NOT NULL,             -- "obligation", "conditional", "passive", etc.
  formation JSONB NOT NULL DEFAULT '[]',  -- conjugation rules
  explanation_en TEXT NOT NULL,
  explanation_fr TEXT NOT NULL,
  nuance TEXT,
  related_points TEXT[] NOT NULL DEFAULT '{}',
  common_mistakes JSONB NOT NULL DEFAULT '[]',
  audio_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grammar_jlpt ON grammar_points(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_grammar_category ON grammar_points(category);
CREATE INDEX IF NOT EXISTS idx_grammar_sort ON grammar_points(jlpt_level, sort_order);

-- ── Grammar Exercises ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grammar_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grammar_point_id UUID NOT NULL REFERENCES grammar_points(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'fill_blank', 'sentence_builder', 'error_spotter',
    'mcq', 'conjugation', 'context_match', 'transform'
  )),
  question JSONB NOT NULL,            -- sentence, blanks, context, tiles, etc.
  answers JSONB NOT NULL,             -- accepted answers array
  distractors JSONB,                  -- wrong options for MCQ / sentence_builder
  hints TEXT[] NOT NULL DEFAULT '{}',
  explanation JSONB NOT NULL,         -- correct + wrong explanations
  domain TEXT NOT NULL DEFAULT 'core' CHECK (domain IN ('core', 'embedded', 'automotive', 'business', 'daily')),
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_grammar ON grammar_exercises(grammar_point_id);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON grammar_exercises(type);
CREATE INDEX IF NOT EXISTS idx_exercises_domain ON grammar_exercises(domain);

-- ── User Grammar SRS (independent from vocab SRS) ─────────────
CREATE TABLE IF NOT EXISTS user_grammar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grammar_point_id UUID NOT NULL REFERENCES grammar_points(id) ON DELETE CASCADE,
  interval INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_review TIMESTAMPTZ,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  is_learned BOOLEAN NOT NULL DEFAULT false,   -- score >= 70% → learned
  is_ghost BOOLEAN NOT NULL DEFAULT false,      -- haunted grammar (persistent weakness)
  type_accuracy JSONB NOT NULL DEFAULT '{
    "fill_blank":       {"correct": 0, "total": 0},
    "sentence_builder": {"correct": 0, "total": 0},
    "error_spotter":    {"correct": 0, "total": 0},
    "mcq":              {"correct": 0, "total": 0},
    "conjugation":      {"correct": 0, "total": 0},
    "context_match":    {"correct": 0, "total": 0},
    "transform":        {"correct": 0, "total": 0}
  }',
  weakest_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, grammar_point_id)
);

CREATE INDEX IF NOT EXISTS idx_user_grammar_user ON user_grammar(user_id);
CREATE INDEX IF NOT EXISTS idx_user_grammar_review ON user_grammar(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_user_grammar_ghost ON user_grammar(user_id, is_ghost);

-- ── RLS Policies ──────────────────────────────────────────────
ALTER TABLE grammar_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grammar ENABLE ROW LEVEL SECURITY;

-- Grammar points and exercises are public-read
CREATE POLICY "Grammar points are publicly readable"
  ON grammar_points FOR SELECT USING (true);

CREATE POLICY "Grammar exercises are publicly readable"
  ON grammar_exercises FOR SELECT USING (true);

-- User grammar: each user owns their own rows
CREATE POLICY "Users can read own grammar progress"
  ON user_grammar FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grammar progress"
  ON user_grammar FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grammar progress"
  ON user_grammar FOR UPDATE USING (auth.uid() = user_id);
