'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { addWord, type WordFormState } from '@/lib/actions/vocabulary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Đang thêm...' : 'Thêm từ'}
    </Button>
  )
}

export function AddWordForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction] = useFormState<WordFormState, FormData>(addWord, {})

  useEffect(() => {
    if (state.success) {
      setIsOpen(false)
    }
  }, [state.success])

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Thêm Từ Mới
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Thêm từ vựng mới</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="word" className="text-sm font-medium text-gray-700">
              Từ vựng <span className="text-red-500">*</span>
            </label>
            <Input id="word" name="word" placeholder="ví dụ: hello" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="definition" className="text-sm font-medium text-gray-700">
              Nghĩa <span className="text-red-500">*</span>
            </label>
            <Input id="definition" name="definition" placeholder="ví dụ: xin chào" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="phonetic" className="text-sm font-medium text-gray-700">
              Phiên âm (IPA)
            </label>
            <Input id="phonetic" name="phonetic" placeholder="ví dụ: /həˈloʊ/" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Hủy
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
