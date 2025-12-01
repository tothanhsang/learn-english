-- Add IELTS study plans table
-- Allows users to create study plans with target scores and exam dates

CREATE TABLE ielts_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My IELTS Plan',
  exam_date DATE,
  target_listening DECIMAL(2,1) CHECK (target_listening >= 0 AND target_listening <= 9),
  target_reading DECIMAL(2,1) CHECK (target_reading >= 0 AND target_reading <= 9),
  target_writing DECIMAL(2,1) CHECK (target_writing >= 0 AND target_writing <= 9),
  target_speaking DECIMAL(2,1) CHECK (target_speaking >= 0 AND target_speaking <= 9),
  target_overall DECIMAL(2,1) CHECK (target_overall >= 0 AND target_overall <= 9),
  current_listening DECIMAL(2,1) CHECK (current_listening >= 0 AND current_listening <= 9),
  current_reading DECIMAL(2,1) CHECK (current_reading >= 0 AND current_reading <= 9),
  current_writing DECIMAL(2,1) CHECK (current_writing >= 0 AND current_writing <= 9),
  current_speaking DECIMAL(2,1) CHECK (current_speaking >= 0 AND current_speaking <= 9),
  current_overall DECIMAL(2,1) CHECK (current_overall >= 0 AND current_overall <= 9),
  study_hours_per_day INT DEFAULT 2,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add IELTS study sessions table
-- Track daily study sessions for each skill
CREATE TABLE ielts_sessions (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT REFERENCES ielts_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('listening', 'reading', 'writing', 'speaking')),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  activity TEXT,
  notes TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add IELTS milestones table
-- Track practice test scores and achievements
CREATE TABLE ielts_milestones (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT REFERENCES ielts_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('practice_test', 'mock_exam', 'achievement', 'note')),
  listening_score DECIMAL(2,1) CHECK (listening_score >= 0 AND listening_score <= 9),
  reading_score DECIMAL(2,1) CHECK (reading_score >= 0 AND reading_score <= 9),
  writing_score DECIMAL(2,1) CHECK (writing_score >= 0 AND writing_score <= 9),
  speaking_score DECIMAL(2,1) CHECK (speaking_score >= 0 AND speaking_score <= 9),
  overall_score DECIMAL(2,1) CHECK (overall_score >= 0 AND overall_score <= 9),
  title TEXT,
  notes TEXT,
  milestone_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ielts_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ielts_plans
CREATE POLICY "Users can view own ielts_plans"
  ON ielts_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ielts_plans"
  ON ielts_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ielts_plans"
  ON ielts_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ielts_plans"
  ON ielts_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ielts_sessions
CREATE POLICY "Users can view own ielts_sessions"
  ON ielts_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ielts_sessions"
  ON ielts_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ielts_sessions"
  ON ielts_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ielts_sessions"
  ON ielts_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ielts_milestones
CREATE POLICY "Users can view own ielts_milestones"
  ON ielts_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ielts_milestones"
  ON ielts_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ielts_milestones"
  ON ielts_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ielts_milestones"
  ON ielts_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ielts_plans_user_id ON ielts_plans(user_id);
CREATE INDEX idx_ielts_plans_active ON ielts_plans(user_id, is_active);
CREATE INDEX idx_ielts_sessions_plan_id ON ielts_sessions(plan_id);
CREATE INDEX idx_ielts_sessions_user_date ON ielts_sessions(user_id, session_date);
CREATE INDEX idx_ielts_milestones_plan_id ON ielts_milestones(plan_id);
CREATE INDEX idx_ielts_milestones_user_date ON ielts_milestones(user_id, milestone_date);
