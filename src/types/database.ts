export type WordStatus = 'new' | 'learning' | 'reviewing' | 'mastered'

export interface Topic {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string
  color: string
  created_at: string
  updated_at: string
}

export interface Phrase {
  id: string
  user_id: string
  topic_id: string | null
  phrase: string
  meaning: string
  meaning_vi: string | null
  example_sentence: string | null
  phonetic: string | null
  audio_url: string | null
  status: WordStatus
  created_at: string
  updated_at: string
  // Joined data
  topic?: Topic | null
}

export interface Word {
  id: string
  user_id: string
  topic_id: string | null
  word: string
  definition: string
  definition_vi: string | null
  phonetic: string | null
  status: WordStatus
  audio_url: string | null
  created_at: string
  updated_at: string
  // Joined data
  topic?: Topic | null
}

export interface LearningProgress {
  id: string
  word_id: string
  user_id: string
  next_review: string | null
  review_count: number
  last_reviewed: string | null
  created_at: string
}

export interface UserStats {
  total: number
  new: number
  learning: number
  reviewing: number
  mastered: number
}

export interface PhraseStats {
  total: number
  new: number
  learning: number
  reviewing: number
  mastered: number
}

export interface Writing {
  id: string
  user_id: string
  topic_id: string | null
  title: string | null
  content: string
  word_count: number
  written_date: string // YYYY-MM-DD format
  created_at: string
  updated_at: string
  // Joined data
  topic?: Topic | null
}

export interface Database {
  public: {
    Tables: {
      words: {
        Row: Word
        Insert: Omit<Word, 'id' | 'created_at' | 'updated_at' | 'topic'>
        Update: Partial<Omit<Word, 'id' | 'created_at' | 'updated_at' | 'topic'>>
      }
      topics: {
        Row: Topic
        Insert: Omit<Topic, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Topic, 'id' | 'created_at' | 'updated_at'>>
      }
      phrases: {
        Row: Phrase
        Insert: Omit<Phrase, 'id' | 'created_at' | 'updated_at' | 'topic'>
        Update: Partial<Omit<Phrase, 'id' | 'created_at' | 'updated_at' | 'topic'>>
      }
      learning_progress: {
        Row: LearningProgress
        Insert: Omit<LearningProgress, 'id' | 'created_at'>
        Update: Partial<Omit<LearningProgress, 'id' | 'created_at'>>
      }
      writings: {
        Row: Writing
        Insert: Omit<Writing, 'id' | 'created_at' | 'updated_at' | 'word_count' | 'topic'>
        Update: Partial<Omit<Writing, 'id' | 'created_at' | 'updated_at' | 'word_count' | 'topic'>>
      }
    }
  }
}
