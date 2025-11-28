# Phase 2: Topics & Phrases Implementation

**Date**: 2025-11-28
**Status**: Completed

## Overview

Extended the vocabulary app with topic-based learning and phrase tracking.

## Changes Made

### Database
- `003_add_topics_phrases.sql` - New migration with:
  - `topics` table (name, icon, color)
  - `phrases` table (phrase, meaning, meaning_vi, example_sentence)
  - `topic_id` column added to `words` table
  - RLS policies for all new tables

### Types
- `src/types/database.ts` - Added Topic, Phrase, PhraseStats interfaces

### Server Actions
- `src/lib/actions/topics.ts` - CRUD for topics
- `src/lib/actions/phrases.ts` - CRUD for phrases with stats

### Components
- `topic-selector.tsx` - Topic pills with inline create (icon + color picker)
- `add-phrase-form.tsx` - Modal form with auto-translation
- `phrase-card.tsx` - Display card with topic badge, example sentence

### Dashboard Updates
- `dashboard-content.tsx` - Tab switcher (Từ vựng / Cụm từ)
- `dashboard/page.tsx` - Fetches phrases and topics in parallel
- `stats-overview.tsx` - Added label prop for context

## Usage

1. Run migration: `npx supabase db push`
2. Switch to "Cụm từ" tab on dashboard
3. Click "Thêm Cụm Từ" to add phrases
4. Create topics inline with icon/color selection
5. Filter phrases by topic using pills

## Schema

```sql
-- Topics
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '📚',
  color VARCHAR(20) DEFAULT 'gray',
  UNIQUE(user_id, name)
);

-- Phrases
CREATE TABLE phrases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  topic_id BIGINT REFERENCES topics(id),
  phrase TEXT NOT NULL,
  meaning TEXT NOT NULL,
  meaning_vi TEXT,
  example_sentence TEXT,
  status VARCHAR(20) DEFAULT 'new',
  UNIQUE(user_id, phrase)
);
```
