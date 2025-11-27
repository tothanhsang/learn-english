'use client'

import { useState } from 'react'
import { Word, WordStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { AudioPlayer } from '@/components/audio-player'
import { updateWordStatus } from '@/lib/actions/vocabulary'
import { Check, X, RotateCcw } from 'lucide-react'

interface FlashcardPracticeProps {
  words: Word[]
}

export function FlashcardPractice({ words: initialWords }: FlashcardPracticeProps) {
  const [words, setWords] = useState(initialWords)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState({ correct: 0, incorrect: 0 })

  const currentWord = words[currentIndex]

  const handleFlip = () => setIsFlipped(!isFlipped)

  const handleResponse = async (known: boolean) => {
    // Update results
    setResults(prev => ({
      correct: prev.correct + (known ? 1 : 0),
      incorrect: prev.incorrect + (known ? 0 : 1),
    }))

    // Update word status
    const newStatus: WordStatus = known
      ? currentWord.status === 'new'
        ? 'learning'
        : currentWord.status === 'learning'
        ? 'reviewing'
        : currentWord.status === 'reviewing'
        ? 'mastered'
        : 'mastered'
      : 'learning'

    await updateWordStatus(currentWord.id, newStatus)

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      setIsComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsComplete(false)
    setResults({ correct: 0, incorrect: 0 })
  }

  if (isComplete) {
    const total = results.correct + results.incorrect
    const percentage = Math.round((results.correct / total) * 100)

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hoàn thành!</h2>
        <div className="mb-6">
          <p className="text-4xl font-bold text-primary-600 mb-2">{percentage}%</p>
          <p className="text-gray-600">
            {results.correct}/{total} từ đúng
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Luyện lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Từ {currentIndex + 1} / {words.length}</span>
        <span className="text-green-600">{results.correct} đúng</span>
      </div>

      {/* Flashcard */}
      <div
        onClick={handleFlip}
        className="bg-white rounded-xl border border-gray-200 p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition"
      >
        {!isFlipped ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>
            {currentWord.phonetic && (
              <p className="text-gray-500 mb-4">{currentWord.phonetic}</p>
            )}
            <AudioPlayer text={currentWord.word} />
            <p className="text-sm text-gray-400 mt-6">Bấm để xem nghĩa</p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">{currentWord.word}</p>
            <h2 className="text-2xl font-bold text-gray-900">{currentWord.definition}</h2>
          </>
        )}
      </div>

      {/* Actions */}
      {isFlipped && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => handleResponse(false)}
            className="flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
            Chưa nhớ
          </Button>
          <Button
            onClick={() => handleResponse(true)}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            Đã nhớ
          </Button>
        </div>
      )}
    </div>
  )
}
