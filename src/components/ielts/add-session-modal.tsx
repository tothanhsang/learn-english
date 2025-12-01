'use client'

import { useFormState } from 'react-dom'
import { useEffect, useRef } from 'react'
import { addSession, type IELTSFormState } from '@/lib/actions/ielts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Headphones, BookOpen, PenTool, MessageCircle } from 'lucide-react'

interface AddSessionModalProps {
  open: boolean
  onClose: () => void
  planId: string
}

const skills = [
  { value: 'listening', label: 'Listening', icon: Headphones, color: 'text-blue-500' },
  { value: 'reading', label: 'Reading', icon: BookOpen, color: 'text-green-500' },
  { value: 'writing', label: 'Writing', icon: PenTool, color: 'text-purple-500' },
  { value: 'speaking', label: 'Speaking', icon: MessageCircle, color: 'text-orange-500' },
]

export function AddSessionModal({ open, onClose, planId }: AddSessionModalProps) {
  const [state, formAction] = useFormState<IELTSFormState, FormData>(addSession, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onClose()
    }
  }, [state.success, onClose])

  if (!open) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white dark:glass-card dark:bg-white/10 dark:border dark:border-white/15 rounded-2xl shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm phiên học</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="plan_id" value={planId} />

          {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">Kỹ năng</label>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => {
                const Icon = skill.icon
                return (
                  <label key={skill.value} className="relative">
                    <input
                      type="radio"
                      name="skill"
                      value={skill.value}
                      className="peer sr-only"
                      required
                    />
                    <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-white/20 rounded-lg cursor-pointer transition peer-checked:border-accent-pink peer-checked:bg-accent-pink/10 hover:bg-gray-50 dark:hover:bg-white/5">
                      <Icon className={`w-5 h-5 ${skill.color}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Thời gian (phút)
            </label>
            <Input name="duration_minutes" type="number" min="1" placeholder="30" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Hoạt động
            </label>
            <Input name="activity" placeholder="VD: Làm Cambridge 18 Test 1" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Ngày
            </label>
            <Input name="session_date" type="date" defaultValue={today} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Ghi chú
            </label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-pink/50"
              placeholder="Điều đã học được, khó khăn gặp phải..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              Thêm phiên học
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
