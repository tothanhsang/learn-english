'use client'

import { useState, useEffect } from 'react'
import { Topic } from '@/types/database'
import { Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TOPIC_COLORS = [
  { name: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  { name: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
]

const TOPIC_ICONS = ['📚', '💼', '✈️', '🎓', '💬', '🖥️', '🎯', '📝', '🌍', '🎨']

interface TopicSelectorProps {
  topics: Topic[]
  selectedTopicId: string | null
  onSelect: (topicId: string | null) => void
  onCreateTopic?: (name: string, icon: string, color: string) => Promise<void>
  showCreateOption?: boolean
}

export function TopicSelector({
  topics,
  selectedTopicId,
  onSelect,
  onCreateTopic,
  showCreateOption = true,
}: TopicSelectorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📚')
  const [selectedColor, setSelectedColor] = useState('gray')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!newTopicName.trim() || !onCreateTopic) return
    setIsSubmitting(true)
    await onCreateTopic(newTopicName.trim(), selectedIcon, selectedColor)
    setNewTopicName('')
    setSelectedIcon('📚')
    setSelectedColor('gray')
    setIsCreating(false)
    setIsSubmitting(false)
  }

  const getColorClasses = (colorName: string) => {
    return TOPIC_COLORS.find(c => c.name === colorName) || TOPIC_COLORS[0]
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-white/80">Chủ đề</label>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2">
        {/* "All" option */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            selectedTopicId === null
              ? 'bg-primary-100 dark:bg-accent-pink/20 text-primary-700 dark:text-accent-pink ring-2 ring-primary-500 dark:ring-accent-pink'
              : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/15'
          }`}
        >
          Tất cả
        </button>

        {/* Existing topics */}
        {topics.map((topic) => {
          const colors = getColorClasses(topic.color)
          const isSelected = selectedTopicId === topic.id
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelect(topic.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                colors.bg
              } ${colors.text} ${isSelected ? `ring-2 ring-offset-1 ${colors.border} dark:ring-offset-transparent` : 'hover:opacity-80'}`}
            >
              <span>{topic.icon}</span>
              <span>{topic.name}</span>
            </button>
          )
        })}

        {/* Create new topic button */}
        {showCreateOption && !isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 border border-dashed border-gray-300 dark:border-white/20 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm
          </button>
        )}
      </div>

      {/* Create new topic form */}
      {isCreating && (
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Tên chủ đề..."
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreate}
              disabled={!newTopicName.trim() || isSubmitting}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Icon selector */}
          <div className="flex gap-1 flex-wrap">
            {TOPIC_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                  selectedIcon === icon ? 'bg-primary-100 dark:bg-accent-pink/20 ring-2 ring-primary-500 dark:ring-accent-pink' : 'hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Color selector */}
          <div className="flex gap-1">
            {TOPIC_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`w-6 h-6 rounded-full ${color.bg} ${
                  selectedColor === color.name ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-transparent' : ''
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="topic_id" value={selectedTopicId || ''} />
    </div>
  )
}

// Simple topic badge for display
export function TopicBadge({ topic }: { topic: Topic }) {
  const colors = TOPIC_COLORS.find(c => c.name === topic.color) || TOPIC_COLORS[0]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span>{topic.icon}</span>
      <span>{topic.name}</span>
    </span>
  )
}
