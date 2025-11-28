-- Add writings table for daily paragraph practice
-- Allows saving paragraphs with custom dates (for backfilling yesterday's entries)

CREATE TABLE writings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  word_count INT GENERATED ALWAYS AS (array_length(string_to_array(trim(content), ' '), 1)) STORED,
  written_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE writings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own writings"
  ON writings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writings"
  ON writings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writings"
  ON writings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own writings"
  ON writings FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_writings_user_id ON writings(user_id);
CREATE INDEX idx_writings_written_date ON writings(written_date);
CREATE INDEX idx_writings_topic_id ON writings(topic_id);
