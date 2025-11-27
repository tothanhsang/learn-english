import { createClient } from '@/lib/supabase/server'
import { FlashcardPractice } from '@/components/flashcard-practice'
import Link from 'next/link'

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get words that need practice (not mastered)
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', user!.id)
    .neq('status', 'mastered')
    .order('created_at', { ascending: true })
    .limit(20)

  if (!words || words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tập luyện FlashCard</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-gray-500 mb-4">Chưa có từ vựng nào để luyện tập.</p>
          <Link
            href="/dashboard"
            className="inline-flex px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Thêm từ mới
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tập luyện FlashCard</h1>
        <p className="text-gray-600">{words.length} từ cần ôn tập</p>
      </div>

      <FlashcardPractice words={words} />
    </div>
  )
}
