'use client'

import { useState } from 'react'
import { Word, Phrase, Topic, UserStats, PhraseStats } from '@/types/database'
import { DaySidebar } from '@/components/day-sidebar'
import { VocabularyTabs } from '@/components/vocabulary-tabs'
import { AddWordForm } from '@/components/add-word-form'
import { AddPhraseForm } from '@/components/add-phrase-form'
import { PhraseCard } from '@/components/phrase-card'
import { StatsOverview } from '@/components/stats-overview'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BookOpen, MessageSquareQuote } from 'lucide-react'

interface DashboardContentProps {
  words: Word[]
  phrases: Phrase[]
  topics: Topic[]
  stats: UserStats
  phraseStats: PhraseStats
}

export function DashboardContent({ words, phrases, topics, stats, phraseStats }: DashboardContentProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<'words' | 'phrases'>('words')
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  // Filter words by selected date
  const filteredWords = selectedDate
    ? words.filter(w => new Date(w.created_at).toISOString().split('T')[0] === selectedDate)
    : words

  // Filter phrases by topic and date
  const filteredPhrases = phrases.filter(p => {
    if (selectedTopicId && p.topic_id !== selectedTopicId) return false
    if (selectedDate && new Date(p.created_at).toISOString().split('T')[0] !== selectedDate) return false
    return true
  })

  // Split filtered words by status for tabs
  const learningWords = filteredWords.filter(w => w.status === 'new' || w.status === 'learning')
  const reviewWords = filteredWords.filter(w => w.status === 'reviewing' || w.status === 'mastered')

  // Split phrases by status
  const learningPhrases = filteredPhrases.filter(p => p.status === 'new' || p.status === 'learning')
  const reviewPhrases = filteredPhrases.filter(p => p.status === 'reviewing' || p.status === 'mastered')

  const handleTopicsChange = () => {
    router.refresh()
  }

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
        {/* Main tab switcher: Words vs Phrases */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setMainTab('words')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
              mainTab === 'words'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <BookOpen className="w-4 h-4" />
            Từ vựng
            <span className="text-xs text-gray-400">({words.length})</span>
          </button>
          <button
            onClick={() => setMainTab('phrases')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
              mainTab === 'phrases'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <MessageSquareQuote className="w-4 h-4" />
            Cụm từ
            <span className="text-xs text-gray-400">({phrases.length})</span>
          </button>
        </div>

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

        {/* Content based on main tab */}
        {mainTab === 'words' ? (
          <VocabularyTabs
            learningWords={learningWords}
            reviewWords={reviewWords}
            addWordButton={<AddWordForm />}
          />
        ) : (
          <PhrasesContent
            learningPhrases={learningPhrases}
            reviewPhrases={reviewPhrases}
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            onTopicsChange={handleTopicsChange}
          />
        )}
      </div>

      {/* Right Sidebar - Stats & Practice */}
      <div className="hidden lg:block w-48 flex-shrink-0">
        <StatsOverview
          stats={mainTab === 'words' ? stats : phraseStats}
          label={mainTab === 'words' ? 'Từ vựng' : 'Cụm từ'}
        />
      </div>
    </div>
  )
}

// Phrases content component
interface PhrasesContentProps {
  learningPhrases: Phrase[]
  reviewPhrases: Phrase[]
  topics: Topic[]
  selectedTopicId: string | null
  onSelectTopic: (id: string | null) => void
  onTopicsChange: () => void
}

function PhrasesContent({
  learningPhrases,
  reviewPhrases,
  topics,
  selectedTopicId,
  onSelectTopic,
  onTopicsChange,
}: PhrasesContentProps) {
  const [activeTab, setActiveTab] = useState<'learning' | 'review'>('learning')
  const phrases = activeTab === 'learning' ? learningPhrases : reviewPhrases

  return (
    <div className="space-y-4">
      {/* Topic filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectTopic(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition',
            selectedTopicId === null
              ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Tất cả
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5',
              selectedTopicId === topic.id
                ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <span>{topic.icon}</span>
            <span>{topic.name}</span>
          </button>
        ))}
      </div>

      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('learning')}
            className={cn(
              'text-lg font-semibold transition',
              activeTab === 'learning' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Đang học
            <span className="ml-1 text-sm">({learningPhrases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={cn(
              'text-lg font-semibold transition',
              activeTab === 'review' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Ôn tập
            <span className="ml-1 text-sm">({reviewPhrases.length})</span>
          </button>
        </div>

        <AddPhraseForm topics={topics} onTopicsChange={onTopicsChange} />
      </div>

      {/* Phrase grid */}
      {phrases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">
            {activeTab === 'learning' ? 'Chưa có cụm từ nào đang học.' : 'Chưa có cụm từ nào cần ôn tập.'}
          </p>
          <p className="text-gray-400 text-sm mt-1">Bấm "Thêm Cụm Từ" để bắt đầu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {phrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      )}
    </div>
  )
}
