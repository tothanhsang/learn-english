'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { addPhrase, type PhraseFormState } from '@/lib/actions/phrases'
import { addTopic } from '@/lib/actions/topics'
import { translateToVietnamese } from '@/lib/actions/translate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TopicSelector } from '@/components/topic-selector'
import { Topic } from '@/types/database'
import { Plus, X, Loader2, Check } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="flex-1">
      {pending ? 'Đang thêm...' : 'Thêm cụm từ'}
    </Button>
  )
}

type TranslateStatus = 'idle' | 'loading' | 'success' | 'error'

interface AddPhraseFormProps {
  topics: Topic[]
  onTopicsChange?: () => void
}

export function AddPhraseForm({ topics, onTopicsChange }: AddPhraseFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction] = useFormState<PhraseFormState, FormData>(addPhrase, {})
  const [phrase, setPhrase] = useState('')
  const [meaning, setMeaning] = useState('')
  const [meaningVi, setMeaningVi] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [translateStatus, setTranslateStatus] = useState<TranslateStatus>('idle')

  useEffect(() => {
    if (state.success) {
      setIsOpen(false)
      setPhrase('')
      setMeaning('')
      setMeaningVi('')
      setExampleSentence('')
      setSelectedTopicId(null)
      setTranslateStatus('idle')
    }
  }, [state.success])

  // Auto-translate meaning when it changes
  useEffect(() => {
    if (!meaning.trim() || meaning.length < 5) {
      setTranslateStatus('idle')
      return
    }

    const timer = setTimeout(async () => {
      setTranslateStatus('loading')
      const viTranslation = await translateToVietnamese(meaning)
      if (viTranslation) {
        setMeaningVi(viTranslation)
        setTranslateStatus('success')
      } else {
        setTranslateStatus('error')
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [meaning])

  const handleOpen = () => {
    setPhrase('')
    setMeaning('')
    setMeaningVi('')
    setExampleSentence('')
    setSelectedTopicId(null)
    setTranslateStatus('idle')
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

  const StatusIcon = ({ status }: { status: TranslateStatus }) => {
    if (status === 'loading') return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
    if (status === 'success') return <Check className="w-3.5 h-3.5 text-green-500" />
    return null
  }

  if (!isOpen) {
    return (
      <Button onClick={handleOpen} variant="outline" className="gap-2">
        <Plus className="w-4 h-4" />
        Thêm Cụm Từ
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm cụm từ mới</h2>
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

          {/* Topic selector */}
          <TopicSelector
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSelect={setSelectedTopicId}
            onCreateTopic={handleCreateTopic}
          />

          {/* Phrase input */}
          <div className="space-y-1.5">
            <label htmlFor="phrase" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cụm từ <span className="text-red-500">*</span>
            </label>
            <Input
              id="phrase"
              name="phrase"
              placeholder="break the ice, on the fly, ..."
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* English meaning */}
          <div className="space-y-1.5">
            <label htmlFor="meaning" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nghĩa (EN) <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="meaning"
              name="meaning"
              placeholder="To start a conversation in an awkward situation"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              rows={2}
              required
            />
          </div>

          {/* Vietnamese meaning - Auto-generated */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              Nghĩa (VI)
              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">tự động</span>
              <StatusIcon status={translateStatus} />
            </label>
            <input type="hidden" name="meaning_vi" value={meaningVi} />
            <div className={`p-2.5 border rounded-lg text-sm min-h-[42px] ${
              translateStatus === 'loading' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}>
              {translateStatus === 'loading' ? (
                <span className="text-blue-500 dark:text-blue-400 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang dịch...
                </span>
              ) : meaningVi ? (
                <span className="text-gray-700 dark:text-gray-300">{meaningVi}</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500 italic">—</span>
              )}
            </div>
          </div>

          {/* Example sentence */}
          <div className="space-y-1.5">
            <label htmlFor="example_sentence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ví dụ
            </label>
            <Textarea
              id="example_sentence"
              name="example_sentence"
              placeholder="He told a joke to break the ice at the meeting."
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              rows={2}
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
