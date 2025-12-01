'use client'

import { useState } from 'react'
import { Word } from '@/types/database'
import { VocabularyCard } from '@/components/vocabulary-card'
import { cn } from '@/lib/utils'

interface VocabularyTabsProps {
  learningWords: Word[]
  reviewWords: Word[]
  addWordButton: React.ReactNode
}

export function VocabularyTabs({ learningWords, reviewWords, addWordButton }: VocabularyTabsProps) {
  const [activeTab, setActiveTab] = useState<'learning' | 'review'>('learning')

  const words = activeTab === 'learning' ? learningWords : reviewWords

  return (
    <div className="space-y-4">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('learning')}
            className={cn(
              'text-lg font-semibold transition',
              activeTab === 'learning' ? 'text-orange-500 dark:text-accent-pink' : 'text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white/80'
            )}
          >
            Đang học
            <span className="ml-1 text-sm">({learningWords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={cn(
              'text-lg font-semibold transition',
              activeTab === 'review' ? 'text-orange-500 dark:text-accent-pink' : 'text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white/80'
            )}
          >
            Ôn tập
            <span className="ml-1 text-sm">({reviewWords.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {addWordButton}
        </div>
      </div>

      {/* Word grid */}
      {words.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 dark:glass-card dark:border-white/10">
          <p className="text-gray-500 dark:text-white/60">
            {activeTab === 'learning' ? 'Chưa có từ nào đang học.' : 'Chưa có từ nào cần ôn tập.'}
          </p>
          <p className="text-gray-400 dark:text-white/40 text-sm mt-1">Bấm "Thêm Từ Mới" để bắt đầu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {words.map((word) => (
            <VocabularyCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  )
}
