import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard-content'
import { Word, Phrase, Topic, Writing } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch words, phrases, topics, and writings in parallel
  const [wordsResult, phrasesResult, topicsResult, writingsResult] = await Promise.all([
    supabase
      .from('words')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('phrases')
      .select('*, topic:topics(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('topics')
      .select('*')
      .eq('user_id', user!.id)
      .order('name', { ascending: true }),
    supabase
      .from('writings')
      .select('*, topic:topics(*)')
      .eq('user_id', user!.id)
      .order('written_date', { ascending: false }),
  ])

  const typedWords = (wordsResult.data ?? []) as Word[]
  const typedPhrases = (phrasesResult.data ?? []) as Phrase[]
  const typedTopics = (topicsResult.data ?? []) as Topic[]
  const typedWritings = (writingsResult.data ?? []) as Writing[]

  const stats = {
    total: typedWords.length,
    new: typedWords.filter(w => w.status === 'new').length,
    learning: typedWords.filter(w => w.status === 'learning').length,
    reviewing: typedWords.filter(w => w.status === 'reviewing').length,
    mastered: typedWords.filter(w => w.status === 'mastered').length,
  }

  const phraseStats = {
    total: typedPhrases.length,
    new: typedPhrases.filter(p => p.status === 'new').length,
    learning: typedPhrases.filter(p => p.status === 'learning').length,
    reviewing: typedPhrases.filter(p => p.status === 'reviewing').length,
    mastered: typedPhrases.filter(p => p.status === 'mastered').length,
  }

  return (
    <DashboardContent
      words={typedWords}
      phrases={typedPhrases}
      writings={typedWritings}
      topics={typedTopics}
      stats={stats}
      phraseStats={phraseStats}
    />
  )
}
