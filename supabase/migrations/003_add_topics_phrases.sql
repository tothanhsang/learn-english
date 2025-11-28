-- Add topics and phrases tables for topic-based learning
-- Run this migration to extend vocabulary learning with phrases and topics

-- Topics table for organizing learning content
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '📚',
  color VARCHAR(20) DEFAULT 'gray',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Phrases table (idioms, collocations, expressions)
CREATE TABLE phrases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
  phrase TEXT NOT NULL,
  meaning TEXT NOT NULL,
  meaning_vi TEXT,
  example_sentence TEXT,
  phonetic VARCHAR(200),
  audio_url TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'reviewing', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phrase)
);

-- Add topic_id to words table (optional association)
ALTER TABLE words ADD COLUMN IF NOT EXISTS topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics
CREATE POLICY "Users can view own topics"
  ON topics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topics"
  ON topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics"
  ON topics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for phrases
CREATE POLICY "Users can view own phrases"
  ON phrases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phrases"
  ON phrases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phrases"
  ON phrases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own phrases"
  ON phrases FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_topics_user_id ON topics(user_id);
CREATE INDEX idx_phrases_user_id ON phrases(user_id);
CREATE INDEX idx_phrases_topic_id ON phrases(topic_id);
CREATE INDEX idx_phrases_status ON phrases(status);
CREATE INDEX idx_words_topic_id ON words(topic_id);
