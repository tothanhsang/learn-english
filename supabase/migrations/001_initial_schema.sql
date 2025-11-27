-- Create enum for word status
CREATE TYPE word_status AS ENUM ('new', 'learning', 'reviewing', 'mastered');

-- Create words table
CREATE TABLE words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_vi TEXT,
  phonetic TEXT,
  status word_status DEFAULT 'new' NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, word)
);

-- Create index on user_id for faster queries
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_status ON words(status);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own words
CREATE POLICY "Users can view own words"
  ON words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own words"
  ON words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own words"
  ON words FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own words"
  ON words FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
