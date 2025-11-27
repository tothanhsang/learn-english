'use client'

import { useState } from 'react'
import { Word } from '@/types/database'
import { UserStats } from '@/types/database'
import { DaySidebar } from '@/components/day-sidebar'
import { VocabularyTabs } from '@/components/vocabulary-tabs'
import { AddWordForm } from '@/components/add-word-form'
import { StatsOverview } from '@/components/stats-overview'

interface DashboardContentProps {
  words: Word[]
  stats: UserStats
}

export function DashboardContent({ words, stats }: DashboardContentProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Filter words by selected date
  const filteredWords = selectedDate
    ? words.filter(w => new Date(w.created_at).toISOString().split('T')[0] === selectedDate)
    : words

  // Split filtered words by status for tabs
  const learningWords = filteredWords.filter(w => w.status === 'new' || w.status === 'learning')
  const reviewWords = filteredWords.filter(w => w.status === 'reviewing' || w.status === 'mastered')

  return (
    <div className="flex gap-3">
      {/* Left Sidebar - Day filter (narrow) */}
      <div className="hidden lg:block w-36 flex-shrink-0">
        <DaySidebar
          words={words}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Main content (takes most space) */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Show selected date header */}
        {selectedDate && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs text-primary-700">
              Ngày: <strong>{new Date(selectedDate).toLocaleDateString('vi-VN')}</strong>
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-primary-600 hover:text-primary-800 underline"
            >
              Tất cả
            </button>
          </div>
        )}

        <VocabularyTabs
          learningWords={learningWords}
          reviewWords={reviewWords}
          addWordButton={<AddWordForm />}
        />
      </div>

      {/* Right Sidebar - Stats & Practice */}
      <div className="hidden lg:block w-48 flex-shrink-0">
        <StatsOverview stats={stats} />
      </div>
    </div>
  )
}
