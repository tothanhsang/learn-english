import { createClient } from '@/lib/supabase/server'
import { VocabularyTabs } from '@/components/vocabulary-tabs'
import { AddWordForm } from '@/components/add-word-form'
import { StatsOverview } from '@/components/stats-overview'
import { PracticePanel } from '@/components/practice-panel'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const stats = {
    total: words?.length ?? 0,
    new: words?.filter(w => w.status === 'new').length ?? 0,
    learning: words?.filter(w => w.status === 'learning').length ?? 0,
    reviewing: words?.filter(w => w.status === 'reviewing').length ?? 0,
    mastered: words?.filter(w => w.status === 'mastered').length ?? 0,
  }

  // Split words by status for tabs
  const learningWords = words?.filter(w => w.status === 'new' || w.status === 'learning') ?? []
  const reviewWords = words?.filter(w => w.status === 'reviewing' || w.status === 'mastered') ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main content */}
      <div className="lg:col-span-3 space-y-4">
        <VocabularyTabs
          learningWords={learningWords}
          reviewWords={reviewWords}
          addWordButton={<AddWordForm />}
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <PracticePanel wordCount={stats.total} />
        <StatsOverview stats={stats} />
      </div>
    </div>
  )
}
