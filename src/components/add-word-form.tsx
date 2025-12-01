'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { addWord, type WordFormState } from '@/lib/actions/vocabulary'
import { translateToVietnamese } from '@/lib/actions/translate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2, Check, AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="flex-1">
      {pending ? 'Đang thêm...' : 'Thêm từ'}
    </Button>
  )
}

interface WordData {
  definition: string
  phonetic: string
}

type FieldStatus = 'idle' | 'loading' | 'success' | 'error'

function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

// Extract phonetic from multiple sources in the API response
function extractPhonetic(entry: Record<string, unknown>): string {
  // Try main phonetic field first
  if (entry.phonetic && typeof entry.phonetic === 'string') {
    return entry.phonetic
  }

  // Try phonetics array - look for one with text
  const phonetics = entry.phonetics as Array<{ text?: string; audio?: string }> | undefined
  if (phonetics && Array.isArray(phonetics)) {
    // Prefer US pronunciation (usually has audio from us.mp3)
    const usPhonetic = phonetics.find(p => p.audio?.includes('us') && p.text)
    if (usPhonetic?.text) return usPhonetic.text

    // Then try any with text
    const withText = phonetics.find(p => p.text)
    if (withText?.text) return withText.text
  }

  return ''
}

async function fetchWordData(word: string): Promise<WordData | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim().toLowerCase()}`)
    if (!res.ok) return null

    const data = await res.json()
    const entry = data[0]

    const phonetic = extractPhonetic(entry)
    const meaning = entry.meanings?.[0]
    const rawDefinition = meaning?.definitions?.[0]?.definition || ''

    // Truncate long definitions
    const definition = truncateText(rawDefinition, 150)

    return { definition, phonetic }
  } catch {
    return null
  }
}

export function AddWordForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction] = useFormState<WordFormState, FormData>(addWord, {})
  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState('')
  const [definitionVi, setDefinitionVi] = useState('')
  const [phonetic, setPhonetic] = useState('')

  // Status tracking for better UX
  const [lookupStatus, setLookupStatus] = useState<FieldStatus>('idle')
  const [translateStatus, setTranslateStatus] = useState<FieldStatus>('idle')

  // Track success to handle modal close properly
  const [showToast, setShowToast] = useState(false)
  const lastTimestampRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Only trigger when timestamp changes (new success)
    if (state.timestamp && state.timestamp !== lastTimestampRef.current) {
      lastTimestampRef.current = state.timestamp
      setIsOpen(false)
      setWord('')
      setDefinition('')
      setDefinitionVi('')
      setPhonetic('')
      setLookupStatus('idle')
      setTranslateStatus('idle')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }, [state.timestamp])

  // Auto-lookup when word changes (with debounce)
  useEffect(() => {
    if (!word.trim() || word.length < 2) {
      setLookupStatus('idle')
      setTranslateStatus('idle')
      return
    }

    const timer = setTimeout(async () => {
      setLookupStatus('loading')
      setTranslateStatus('idle')
      setDefinitionVi('')

      const data = await fetchWordData(word)

      if (data) {
        setLookupStatus('success')
        if (data.phonetic) setPhonetic(data.phonetic)
        if (data.definition) {
          setDefinition(data.definition)
          // Translate using Gemini server action
          setTranslateStatus('loading')
          const viTranslation = await translateToVietnamese(data.definition)
          if (viTranslation) {
            setDefinitionVi(viTranslation)
            setTranslateStatus('success')
          } else {
            setTranslateStatus('error')
          }
        }
      } else {
        setLookupStatus('error')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [word])

  const handleOpen = () => {
    // Reset all fields when opening modal
    setWord('')
    setDefinition('')
    setDefinitionVi('')
    setPhonetic('')
    setLookupStatus('idle')
    setTranslateStatus('idle')
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Status indicator component
  const StatusIcon = ({ status }: { status: FieldStatus }) => {
    if (status === 'loading') return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
    if (status === 'success') return <Check className="w-3.5 h-3.5 text-green-500" />
    if (status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
    return null
  }

  if (!isOpen) {
    return (
      <>
        <Button onClick={handleOpen} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm Từ Mới
        </Button>

        {/* Success toast */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" />
            Đã thêm từ vựng thành công!
          </div>
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto dark:glass dark:bg-white/10 dark:border-white/20">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-transparent dark:backdrop-blur-xl z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thêm từ vựng mới</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:text-white/60 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}

          {/* Word input */}
          <div className="space-y-1.5">
            <label htmlFor="word" className="text-sm font-medium text-gray-700 dark:text-white/80">
              Từ vựng <span className="text-red-500 dark:text-accent-pink">*</span>
            </label>
            <div className="relative">
              <Input
                id="word"
                name="word"
                placeholder="hello, world, ..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="pr-10"
                autoFocus
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <StatusIcon status={lookupStatus} />
              </div>
            </div>
            {lookupStatus === 'error' && word.length >= 2 && (
              <p className="text-xs text-amber-600">Không tìm thấy, bạn có thể nhập thủ công</p>
            )}
          </div>

          {/* English definition */}
          <div className="space-y-1.5">
            <label htmlFor="definition" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-2">
              Nghĩa tiếng Việt
              {lookupStatus === 'loading' && <Loader2 className="w-3 h-3 animate-spin text-gray-400 dark:text-white/50" />}
            </label>
            <Textarea
              id="definition"
              name="definition"
              placeholder={lookupStatus === 'loading' ? 'Đang tra cứu...' : 'Nhập nghĩa tiếng Anh'}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={2}
            />
          </div>

          {/* Vietnamese definition - Auto-generated */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-2">
              Nghĩa tiếng Việt (Auto)
              <StatusIcon status={translateStatus} />
            </label>
            <input type="hidden" name="definition_vi" value={definitionVi} />
            <div className={`p-2.5 border rounded-xl text-sm min-h-[42px] ${
              translateStatus === 'loading'
                ? 'bg-blue-50 border-blue-200 dark:bg-accent-blue/10 dark:border-accent-blue/30'
                : 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10'
            }`}>
              {translateStatus === 'loading' ? (
                <span className="text-blue-500 dark:text-accent-blue flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang dịch...
                </span>
              ) : definitionVi ? (
                <span className="text-gray-700 dark:text-white/80">{definitionVi}</span>
              ) : (
                <span className="text-gray-400 dark:text-white/40 italic">—</span>
              )}
            </div>
          </div>

          {/* Phonetic */}
          <div className="space-y-1.5">
            <label htmlFor="phonetic" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-2">
              IPA
              {!phonetic && lookupStatus === 'success' && (
                <span className="text-xs text-amber-500 dark:text-amber-400">không có sẵn</span>
              )}
            </label>
            <Input
              id="phonetic"
              name="phonetic"
              placeholder="Auto-filled"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
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
