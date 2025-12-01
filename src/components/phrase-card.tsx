'use client'

import { useState } from 'react'
import { Phrase, WordStatus } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TopicBadge } from '@/components/topic-selector'
import { deletePhrase, updatePhrase } from '@/lib/actions/phrases'
import { AudioPlayer } from '@/components/audio-player'
import { Trash2, Pencil, X, Check, MessageSquareQuote } from 'lucide-react'

const statusLabels: Record<WordStatus, string> = {
  new: 'Mới',
  learning: 'Đang học',
  reviewing: 'Ôn tập',
  mastered: 'Đã thuộc',
}

interface PhraseCardProps {
  phrase: Phrase
}

export function PhraseCard({ phrase }: PhraseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editMeaning, setEditMeaning] = useState(phrase.meaning)
  const [editExample, setEditExample] = useState(phrase.example_sentence || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa cụm từ này?')) return
    setIsDeleting(true)
    await deletePhrase(phrase.id)
    setIsDeleting(false)
  }

  const handleSave = async () => {
    if (!editMeaning.trim()) return
    setIsSaving(true)
    await updatePhrase(phrase.id, {
      meaning: editMeaning.trim(),
      example_sentence: editExample.trim() || undefined,
    })
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditMeaning(phrase.meaning)
    setEditExample(phrase.example_sentence || '')
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group dark:glass-card dark:border-white/15 dark:hover:border-white/25 dark:hover:shadow-lg dark:hover:shadow-accent-pink/5">
      {/* Header: Phrase + Badge */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-gray-400 dark:text-white/50" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{phrase.phrase}</h3>
        </div>
        <Badge variant={phrase.status}>{statusLabels[phrase.status]}</Badge>
      </div>

      {/* Topic badge + Audio */}
      <div className="flex items-center gap-2 mb-2">
        <AudioPlayer text={phrase.phrase} />
        {phrase.topic && <TopicBadge topic={phrase.topic} />}
      </div>

      {/* Content (editable) */}
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Nghĩa</label>
            <Textarea
              value={editMeaning}
              onChange={(e) => setEditMeaning(e.target.value)}
              className="text-sm"
              rows={2}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Ví dụ</label>
            <Textarea
              value={editExample}
              onChange={(e) => setEditExample(e.target.value)}
              className="text-sm"
              rows={2}
              placeholder="Thêm câu ví dụ..."
            />
          </div>
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
        <>
          {/* English meaning */}
          <p className="text-gray-600 dark:text-white/80 text-sm line-clamp-2">{phrase.meaning}</p>

          {/* Vietnamese meaning */}
          {phrase.meaning_vi && (
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1 italic line-clamp-2">
              {phrase.meaning_vi}
            </p>
          )}

          {/* Example sentence */}
          {phrase.example_sentence && (
            <p className="text-gray-400 dark:text-white/40 text-xs mt-2 border-l-2 border-gray-200 dark:border-white/20 pl-2 italic">
              &ldquo;{phrase.example_sentence}&rdquo;
            </p>
          )}

          {/* Actions (show on hover) */}
          <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 text-gray-400 dark:text-white/50 hover:text-blue-500 dark:hover:text-accent-blue"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-gray-400 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
