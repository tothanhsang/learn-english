'use client'

import { useState } from 'react'
import { Word } from '@/types/database'
import { Calendar, List, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DaySidebarProps {
  words: Word[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

// Group words by date (YYYY-MM-DD)
function groupWordsByDate(words: Word[]): Map<string, Word[]> {
  const groups = new Map<string, Word[]>()

  words.forEach(word => {
    const date = new Date(word.created_at).toISOString().split('T')[0]
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date)!.push(word)
  })

  return groups
}

// Format date for display
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return 'Hôm nay'
  if (isYesterday) return 'Hôm qua'

  // Format: "25 Th11" (25 Nov)
  const day = date.getDate()
  const month = date.toLocaleDateString('vi-VN', { month: 'short' })
  return `${day} ${month}`
}

export function DaySidebar({ words, selectedDate, onSelectDate }: DaySidebarProps) {
  const groupedWords = groupWordsByDate(words)

  // Sort dates descending (newest first)
  const sortedDates = Array.from(groupedWords.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4 dark:glass-card dark:border-white/15">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10">
        <h3 className="font-medium text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Theo ngày
        </h3>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {/* All words option */}
        <button
          onClick={() => onSelectDate(null)}
          className={cn(
            'w-full px-3 py-2 flex items-center justify-between text-left text-xs transition hover:bg-gray-50 dark:hover:bg-white/5',
            selectedDate === null && 'bg-primary-50 dark:bg-accent-pink/10 text-primary-700 dark:text-accent-pink font-medium'
          )}
        >
          <span className="flex items-center gap-1.5">
            <List className="w-3.5 h-3.5" />
            Tất cả
          </span>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            selectedDate === null ? 'bg-primary-100 dark:bg-accent-pink/20 text-primary-700 dark:text-accent-pink' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
          )}>
            {words.length}
          </span>
        </button>

        {/* Date groups */}
        {sortedDates.map(date => {
          const dateWords = groupedWords.get(date)!
          const isSelected = selectedDate === date

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                'w-full px-3 py-2 flex items-center justify-between text-left text-xs transition hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/5',
                isSelected && 'bg-primary-50 dark:bg-accent-pink/10 text-primary-700 dark:text-accent-pink font-medium'
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                <ChevronRight className={cn('w-3 h-3 flex-shrink-0 transition', isSelected && 'rotate-90')} />
                <span className="truncate">{formatDateLabel(date)}</span>
              </span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0',
                isSelected ? 'bg-primary-100 dark:bg-accent-pink/20 text-primary-700 dark:text-accent-pink' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
              )}>
                {dateWords.length}
              </span>
            </button>
          )
        })}

        {sortedDates.length === 0 && (
          <p className="p-3 text-xs text-gray-500 dark:text-white/50 text-center">
            Chưa có từ vựng
          </p>
        )}
      </div>
    </div>
  )
}
