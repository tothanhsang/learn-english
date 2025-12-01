'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { addWriting, type WritingFormState } from '@/lib/actions/writings'
import { addTopic } from '@/lib/actions/topics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TopicSelector } from '@/components/topic-selector'
import { Topic } from '@/types/database'
import { Plus, X, Calendar, Check } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="flex-1">
      {pending ? 'Đang lưu...' : 'Lưu bài viết'}
    </Button>
  )
}

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

interface AddWritingFormProps {
  topics: Topic[]
  onTopicsChange?: () => void
}

export function AddWritingForm({ topics, onTopicsChange }: AddWritingFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction] = useFormState<WritingFormState, FormData>(addWriting, {})
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [writtenDate, setWrittenDate] = useState(getToday())
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [lastSuccessTime, setLastSuccessTime] = useState<number>(0)

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  useEffect(() => {
    if (state.success && Date.now() - lastSuccessTime > 1000) {
      setLastSuccessTime(Date.now())
      setIsOpen(false)
      setTitle('')
      setContent('')
      setWrittenDate(getToday())
      setSelectedTopicId(null)
      // Show toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }, [state.success, lastSuccessTime])

  const handleOpen = () => {
    setTitle('')
    setContent('')
    setWrittenDate(getToday())
    setSelectedTopicId(null)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleCreateTopic = async (name: string, icon: string, color: string) => {
    const formData = new FormData()
    formData.set('name', name)
    formData.set('icon', icon)
    formData.set('color', color)
    await addTopic({}, formData)
    onTopicsChange?.()
  }

  if (!isOpen) {
    return (
      <>
        <Button onClick={handleOpen} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Viết bài
        </Button>

        {/* Success toast */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
            <Check className="w-5 h-5" />
            <span>Đã lưu bài viết!</span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Viết đoạn văn</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}

          {/* Date picker with quick buttons */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ngày viết
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWrittenDate(getToday())}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  writtenDate === getToday()
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setWrittenDate(getYesterday())}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  writtenDate === getYesterday()
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Hôm qua
              </button>
              <input
                type="date"
                name="written_date"
                value={writtenDate}
                onChange={(e) => setWrittenDate(e.target.value)}
                max={getToday()}
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(writtenDate)}</p>
          </div>

          {/* Topic selector */}
          <TopicSelector
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSelect={setSelectedTopicId}
            onCreateTopic={handleCreateTopic}
          />

          {/* Title (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tiêu đề <span className="text-gray-400 dark:text-gray-500 font-normal">(tùy chọn)</span>
            </label>
            <Input
              id="title"
              name="title"
              placeholder="My daily journal..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400 dark:text-gray-500">{wordCount} từ</span>
            </div>
            <Textarea
              id="content"
              name="content"
              placeholder="Today I learned about..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Hủy
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
