'use client'

import { useState } from 'react'
import { Word, WordStatus } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteWord, updateWord } from '@/lib/actions/vocabulary'
import { AudioPlayer } from '@/components/audio-player'
import { Trash2, Pencil, X, Check } from 'lucide-react'

const statusLabels: Record<WordStatus, string> = {
  new: 'Mới',
  learning: 'Đang học',
  reviewing: 'Ôn tập',
  mastered: 'Đã thuộc',
}

interface VocabularyCardProps {
  word: Word
}

export function VocabularyCard({ word }: VocabularyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editDefinition, setEditDefinition] = useState(word.definition)
  const [isSaving, setIsSaving] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa từ này?')) return
    setIsDeleting(true)
    await deleteWord(word.id)
    setIsDeleting(false)
  }

  const handleSave = async () => {
    if (!editDefinition.trim()) return
    setIsSaving(true)
    await updateWord(word.id, { definition: editDefinition.trim() })
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditDefinition(word.definition)
    setIsEditing(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition group">
      {/* Header: Word + Badge */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">{word.word}</h3>
        <Badge variant={word.status}>{statusLabels[word.status]}</Badge>
      </div>

      {/* Phonetic + Audio */}
      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <AudioPlayer text={word.word} />
        {word.phonetic && <span>{word.phonetic}</span>}
      </div>

      {/* Definition (editable) */}
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editDefinition}
            onChange={(e) => setEditDefinition(e.target.value)}
            className="text-sm"
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
        <>
          {/* English definition */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{word.definition}</p>

          {/* Vietnamese definition */}
          {word.definition_vi && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 italic line-clamp-2">
              {word.definition_vi}
            </p>
          )}

          {/* Actions (show on hover) */}
          <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-blue-500"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
