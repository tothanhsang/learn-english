import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard-content'
import { Word } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const typedWords = (words ?? []) as Word[]

  const stats = {
    total: typedWords.length,
    new: typedWords.filter(w => w.status === 'new').length,
    learning: typedWords.filter(w => w.status === 'learning').length,
    reviewing: typedWords.filter(w => w.status === 'reviewing').length,
    mastered: typedWords.filter(w => w.status === 'mastered').length,
  }

  return <DashboardContent words={typedWords} stats={stats} />
}
