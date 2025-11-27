import { createClient } from '@/lib/supabase/server'
import { VocabularyList } from '@/components/vocabulary-list'
import { AddWordForm } from '@/components/add-word-form'
import { StatsOverview } from '@/components/stats-overview'

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Từ vựng của tôi</h1>
            <p className="text-gray-600">Quản lý và học từ vựng tiếng Anh</p>
          </div>
          <AddWordForm />
        </div>

        <VocabularyList words={words ?? []} />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <StatsOverview stats={stats} />
      </div>
    </div>
  )
}
