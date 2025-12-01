'use client'

import { useState } from 'react'
import { Writing } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TopicBadge } from '@/components/topic-selector'
import { deleteWriting, updateWriting } from '@/lib/actions/writings'
import { Trash2, Pencil, X, Check, FileText, Calendar } from 'lucide-react'

interface WritingCardProps {
  writing: Writing
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function WritingCard({ writing }: WritingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(writing.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return
    setIsDeleting(true)
    await deleteWriting(writing.id)
    setIsDeleting(false)
  }

  const handleSave = async () => {
    if (!editContent.trim()) return
    setIsSaving(true)
    await updateWriting(writing.id, { content: editContent.trim() })
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(writing.content)
    setIsEditing(false)
  }

  // Truncate content for preview - show more for larger cards
  const previewLength = 500
  const needsTruncation = writing.content.length > previewLength
  const displayContent = isExpanded || !needsTruncation
    ? writing.content
    : writing.content.slice(0, previewLength) + '...'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            {writing.title ? (
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{writing.title}</h3>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 italic">Không có tiêu đề</span>
            )}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(writing.written_date)}
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500">{writing.word_count} từ</span>
              {writing.topic && <TopicBadge topic={writing.topic} />}
            </div>
          </div>
        </div>

        {/* Actions - always visible */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-blue-500"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="text-sm min-h-[200px]"
            rows={10}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1">
              <Check className="w-3 h-3 mr-1" />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 pl-13">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{displayContent}</p>

          {/* Expand/collapse */}
          {needsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mt-3 font-medium"
            >
              {isExpanded ? '← Thu gọn' : 'Xem thêm →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
