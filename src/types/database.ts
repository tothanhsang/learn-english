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

// IELTS Types
export type IELTSSkill = 'listening' | 'reading' | 'writing' | 'speaking'
export type MilestoneType = 'practice_test' | 'mock_exam' | 'achievement' | 'note'

export interface IELTSPlan {
  id: string
  user_id: string
  name: string
  exam_date: string | null
  target_listening: number | null
  target_reading: number | null
  target_writing: number | null
  target_speaking: number | null
  target_overall: number | null
  current_listening: number | null
  current_reading: number | null
  current_writing: number | null
  current_speaking: number | null
  current_overall: number | null
  study_hours_per_day: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IELTSSession {
  id: string
  plan_id: string
  user_id: string
  skill: IELTSSkill
  duration_minutes: number
  activity: string | null
  notes: string | null
  session_date: string
  created_at: string
}

export interface IELTSMilestone {
  id: string
  plan_id: string
  user_id: string
  milestone_type: MilestoneType
  listening_score: number | null
  reading_score: number | null
  writing_score: number | null
  speaking_score: number | null
  overall_score: number | null
  title: string | null
  notes: string | null
  milestone_date: string
  created_at: string
}

export interface IELTSStats {
  totalStudyMinutes: number
  studyMinutesBySkill: Record<IELTSSkill, number>
  sessionsThisWeek: number
  currentStreak: number
  daysUntilExam: number | null
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
      ielts_plans: {
        Row: IELTSPlan
        Insert: Omit<IELTSPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<IELTSPlan, 'id' | 'created_at' | 'updated_at'>>
      }
      ielts_sessions: {
        Row: IELTSSession
        Insert: Omit<IELTSSession, 'id' | 'created_at'>
        Update: Partial<Omit<IELTSSession, 'id' | 'created_at'>>
      }
      ielts_milestones: {
        Row: IELTSMilestone
        Insert: Omit<IELTSMilestone, 'id' | 'created_at'>
        Update: Partial<Omit<IELTSMilestone, 'id' | 'created_at'>>
      }
    }
  }
}
