'use client'

import { Word } from '@/types/database'
import { VocabularyCard } from '@/components/vocabulary-card'

interface VocabularyListProps {
  words: Word[]
}

export function VocabularyList({ words }: VocabularyListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Chưa có từ vựng nào.</p>
        <p className="text-gray-400 text-sm mt-1">Bấm "Thêm Từ Mới" để bắt đầu học!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {words.map((word) => (
        <VocabularyCard key={word.id} word={word} />
      ))}
    </div>
  )
}
