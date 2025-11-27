# Phase 3: Database Schema

**Date**: 2025-11-27
**Priority**: Critical
**Status**: Pending
**Estimated Time**: 1-2 hours

---

## Overview

Design and implement PostgreSQL database schema with Row Level Security (RLS) policies. Tables: `words`, `learning_progress`. User-owned data pattern.

---

## Requirements

1. `words` table with vocabulary data
2. `learning_progress` table with review tracking
3. RLS policies for user data isolation
4. Indexes on frequently queried columns
5. Foreign key constraints
6. Timestamps for audit trail

---

## Architecture

**Pattern**: User-owned data with RLS
- Each user sees only their own words
- Database-level security (not app-level)
- Use `auth.uid()` in RLS policies
- Index `user_id` columns for performance

**Schema Design**:
- Normalized structure (3NF)
- Foreign keys for referential integrity
- Enums for status values
- Timestamps with timezone

---

## Database Schema

### Table: `words`

Stores vocabulary entries created by users.

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  phonetic TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_status ON words(status);
CREATE INDEX idx_words_created_at ON words(created_at DESC);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Columns**:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users (cascade delete)
- `word`: English word (required)
- `definition`: Vietnamese translation (required)
- `phonetic`: IPA transcription (optional)
- `status`: Learning status (new, learning, review, mastered)
- `audio_url`: Supabase Storage URL (optional, Phase 7)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Table: `learning_progress`

Tracks review history and next review dates for spaced repetition.

```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_count INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(word_id, user_id)
);

-- Indexes
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_word_id ON learning_progress(word_id);
CREATE INDEX idx_learning_progress_next_review ON learning_progress(next_review);

-- Updated timestamp trigger
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Columns**:
- `id`: UUID primary key
- `word_id`: Foreign key to words
- `user_id`: Foreign key to auth.users
- `review_count`: Number of times reviewed
- `next_review`: Next scheduled review date (for spaced repetition)
- `last_reviewed`: Last review timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Unique Constraint**: One progress record per word per user.

---

## Row Level Security (RLS) Policies

### Enable RLS

```sql
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
```

### `words` Table Policies

```sql
-- Users can view only their own words
CREATE POLICY "Users view own words"
  ON words
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own words
CREATE POLICY "Users insert own words"
  ON words
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own words
CREATE POLICY "Users update own words"
  ON words
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own words
CREATE POLICY "Users delete own words"
  ON words
  FOR DELETE
  USING (auth.uid() = user_id);
```

### `learning_progress` Table Policies

```sql
-- Users can view only their own progress
CREATE POLICY "Users view own progress"
  ON learning_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users insert own progress"
  ON learning_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users update own progress"
  ON learning_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users delete own progress"
  ON learning_progress
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Implementation Steps

### 1. Create Migration File

In Supabase Dashboard:
1. Go to SQL Editor
2. Create new query
3. Paste schema SQL
4. Run migration

Or use Supabase CLI:

```bash
npx supabase migration new create_vocabulary_schema
```

Create `supabase/migrations/YYYYMMDDHHMMSS_create_vocabulary_schema.sql`:

```sql
-- Create words table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  phonetic TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create learning_progress table
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_count INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(word_id, user_id)
);

-- Create indexes
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_status ON words(status);
CREATE INDEX idx_words_created_at ON words(created_at DESC);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_word_id ON learning_progress(word_id);
CREATE INDEX idx_learning_progress_next_review ON learning_progress(next_review);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for words
CREATE POLICY "Users view own words"
  ON words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own words"
  ON words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own words"
  ON words FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own words"
  ON words FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for learning_progress
CREATE POLICY "Users view own progress"
  ON learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own progress"
  ON learning_progress FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. Run Migration

In Supabase Dashboard SQL Editor, run the migration SQL.

Or with Supabase CLI:
```bash
npx supabase db push
```

### 3. Create TypeScript Types

Create `types/database.ts`:

```typescript
export type WordStatus = "new" | "learning" | "review" | "mastered";

export interface Word {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  phonetic: string | null;
  status: WordStatus;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: string;
  word_id: string;
  user_id: string;
  review_count: number;
  next_review: string | null;
  last_reviewed: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      words: {
        Row: Word;
        Insert: Omit<Word, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Word, "id" | "created_at" | "updated_at">>;
      };
      learning_progress: {
        Row: LearningProgress;
        Insert: Omit<LearningProgress, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<LearningProgress, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
```

### 4. Generate Supabase Types (Alternative)

Using Supabase CLI to auto-generate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

### 5. Test RLS Policies

Create test script `scripts/test-rls.sql`:

```sql
-- Test RLS as user 1
SET request.jwt.claims TO '{"sub": "user-1-uuid"}';

-- Should see only user 1's words
SELECT * FROM words;

-- Switch to user 2
SET request.jwt.claims TO '{"sub": "user-2-uuid"}';

-- Should see only user 2's words (empty if no data)
SELECT * FROM words;

-- Test insert
INSERT INTO words (user_id, word, definition)
VALUES ('user-2-uuid', 'test', 'định nghĩa');

-- Should succeed (own data)
SELECT * FROM words WHERE word = 'test';

-- Try to insert with wrong user_id (should fail)
INSERT INTO words (user_id, word, definition)
VALUES ('user-1-uuid', 'hack', 'định nghĩa');
-- Error: new row violates row-level security policy
```

### 6. Seed Test Data (Optional)

Create `scripts/seed.sql`:

```sql
-- Insert test words for authenticated user
-- Replace with actual user UUID from auth.users
INSERT INTO words (user_id, word, definition, phonetic, status) VALUES
  ('YOUR_USER_UUID', 'hello', 'xin chào', '/həˈloʊ/', 'new'),
  ('YOUR_USER_UUID', 'goodbye', 'tạm biệt', '/ɡʊdˈbaɪ/', 'learning'),
  ('YOUR_USER_UUID', 'thank you', 'cảm ơn', '/θæŋk juː/', 'review'),
  ('YOUR_USER_UUID', 'please', 'làm ơn', '/pliːz/', 'mastered');
```

---

## Success Criteria

- [ ] Tables created successfully in Supabase
- [ ] RLS enabled on both tables
- [ ] Policies allow users to see only their own data
- [ ] Indexes created for performance
- [ ] Foreign keys enforce referential integrity
- [ ] Triggers update `updated_at` automatically
- [ ] TypeScript types match database schema
- [ ] Test queries validate RLS isolation

---

## Testing Checklist

1. Create two test users via signup
2. Add words for User A
3. Login as User A → see only User A's words
4. Login as User B → see no words
5. Add words for User B
6. Login as User B → see only User B's words
7. Try direct database query without user context → no rows returned
8. Verify CASCADE DELETE: delete user → words deleted

---

## Related Files

**Created**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_vocabulary_schema.sql` - Database migration
- `types/database.ts` - TypeScript types

---

## Security Notes

- RLS enforces data isolation at database level
- `auth.uid()` returns current authenticated user's UUID
- Policies use `USING` (read check) and `WITH CHECK` (write check)
- CASCADE DELETE ensures orphaned data cleanup
- Indexes on `user_id` optimize RLS policy checks

---

## Performance Considerations

- Index on `user_id` for fast RLS checks
- Index on `status` for filtering by learning state
- Index on `created_at DESC` for recent words queries
- Index on `next_review` for spaced repetition algorithm

---

## Future Enhancements (Phase 2)

- Full-text search on `word` and `definition` columns
- Tags/categories for vocabulary organization
- Example sentences table
- Audio storage metadata table
- User preferences table

---

## Next Phase

[Phase 4: Vocabulary CRUD](./phase-04-vocabulary-crud.md)
