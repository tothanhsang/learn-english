'use client'

import { useState } from 'react'
import { Word, WordStatus } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteWord } from '@/lib/actions/vocabulary'
import { AudioPlayer } from '@/components/audio-player'
import { Trash2, Volume2 } from 'lucide-react'

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

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa từ này?')) return
    setIsDeleting(true)
    await deleteWord(word.id)
    setIsDeleting(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{word.word}</h3>
          {word.phonetic && (
            <p className="text-sm text-gray-500">{word.phonetic}</p>
          )}
        </div>
        <Badge variant={word.status}>{statusLabels[word.status]}</Badge>
      </div>

      <p className="text-gray-600 text-sm mb-3">{word.definition}</p>

      <div className="flex items-center justify-between">
        <AudioPlayer text={word.word} />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
