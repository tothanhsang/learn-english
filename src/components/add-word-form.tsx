'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { addWord, type WordFormState } from '@/lib/actions/vocabulary'
import { translateToVietnamese } from '@/lib/actions/translate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2, Sparkles } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Đang thêm...' : 'Thêm từ'}
    </Button>
  )
}

interface WordData {
  definition: string
  phonetic: string
}

function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

async function fetchWordData(word: string): Promise<WordData | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim().toLowerCase()}`)
    if (!res.ok) return null

    const data = await res.json()
    const entry = data[0]

    const phonetic = entry.phonetic || entry.phonetics?.find((p: { text?: string }) => p.text)?.text || ''
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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (state.success) {
      setIsOpen(false)
      setWord('')
      setDefinition('')
      setDefinitionVi('')
      setPhonetic('')
    }
  }, [state.success])

  // Auto-lookup when word changes (with debounce)
  useEffect(() => {
    if (!word.trim() || word.length < 2) return

    const timer = setTimeout(async () => {
      setIsLoading(true)
      const data = await fetchWordData(word)

      if (data) {
        if (data.phonetic) setPhonetic(data.phonetic)
        if (data.definition) {
          setDefinition(data.definition)
          // Translate using Gemini server action
          const viTranslation = await translateToVietnamese(data.definition)
          if (viTranslation) setDefinitionVi(viTranslation)
        }
      }
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [word])

  const handleOpen = () => {
    // Reset all fields when opening modal
    setWord('')
    setDefinition('')
    setDefinitionVi('')
    setPhonetic('')
    setIsLoading(false)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button onClick={handleOpen} className="gap-2">
        <Plus className="w-4 h-4" />
        Thêm Từ Mới
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Thêm từ vựng mới</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}

          {/* Word input */}
          <div className="space-y-2">
            <label htmlFor="word" className="text-sm font-medium text-gray-700">
              Từ vựng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="word"
                name="word"
                placeholder="ví dụ: hello"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Tự động tra nghĩa và phiên âm
            </p>
          </div>

          {/* English definition */}
          <div className="space-y-1.5">
            <label htmlFor="definition" className="text-sm font-medium text-gray-700">
              EN <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="definition"
              name="definition"
              placeholder="Auto-filled"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={2}
              required
            />
          </div>

          {/* Vietnamese definition - Auto-generated */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              VI <span className="text-xs text-gray-400 font-normal ml-1">{isLoading ? 'đang dịch...' : 'tự động'}</span>
            </label>
            <input type="hidden" name="definition_vi" value={definitionVi} />
            <div className="p-2.5 bg-gray-50 border rounded-lg text-gray-700 text-sm">
              {definitionVi || <span className="text-gray-400 italic">—</span>}
            </div>
          </div>

          {/* Phonetic */}
          <div className="space-y-2">
            <label htmlFor="phonetic" className="text-sm font-medium text-gray-700">
              Phiên âm (IPA)
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
