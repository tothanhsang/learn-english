export type WordStatus = 'new' | 'learning' | 'reviewing' | 'mastered'

export interface Word {
  id: string
  user_id: string
  word: string
  definition: string
  definition_vi: string | null
  phonetic: string | null
  status: WordStatus
  audio_url: string | null
  created_at: string
  updated_at: string
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

export interface Database {
  public: {
    Tables: {
      words: {
        Row: Word
        Insert: Omit<Word, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Word, 'id' | 'created_at' | 'updated_at'>>
      }
      learning_progress: {
        Row: LearningProgress
        Insert: Omit<LearningProgress, 'id' | 'created_at'>
        Update: Partial<Omit<LearningProgress, 'id' | 'created_at'>>
      }
    }
  }
}
