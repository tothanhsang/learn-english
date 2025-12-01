'use client'

import { useFormState } from 'react-dom'
import { useEffect, useRef } from 'react'
import { createPlan, type IELTSFormState } from '@/lib/actions/ielts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface CreatePlanModalProps {
  open: boolean
  onClose: () => void
}

export function CreatePlanModal({ open, onClose }: CreatePlanModalProps) {
  const [state, formAction] = useFormState<IELTSFormState, FormData>(createPlan, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onClose()
    }
  }, [state.success, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white dark:glass-card dark:bg-white/10 dark:border dark:border-white/15 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-transparent dark:backdrop-blur-xl p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tạo kế hoạch IELTS</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="p-4 space-y-4">
          {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Tên kế hoạch
            </label>
            <Input name="name" placeholder="VD: IELTS 7.0 - Tháng 6/2025" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Ngày thi dự kiến
            </label>
            <Input name="exam_date" type="date" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Số giờ học mỗi ngày
            </label>
            <Input name="study_hours_per_day" type="number" min="1" max="12" defaultValue="2" />
          </div>

          {/* Target Scores */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Điểm mục tiêu</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Listening</label>
                <Input name="target_listening" type="number" step="0.5" min="0" max="9" placeholder="7.0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Reading</label>
                <Input name="target_reading" type="number" step="0.5" min="0" max="9" placeholder="7.0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Writing</label>
                <Input name="target_writing" type="number" step="0.5" min="0" max="9" placeholder="6.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Speaking</label>
                <Input name="target_speaking" type="number" step="0.5" min="0" max="9" placeholder="6.5" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50">Overall</label>
              <Input name="target_overall" type="number" step="0.5" min="0" max="9" placeholder="7.0" />
            </div>
          </div>

          {/* Current Scores */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Điểm hiện tại (nếu có)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Listening</label>
                <Input name="current_listening" type="number" step="0.5" min="0" max="9" placeholder="5.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Reading</label>
                <Input name="current_reading" type="number" step="0.5" min="0" max="9" placeholder="5.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Writing</label>
                <Input name="current_writing" type="number" step="0.5" min="0" max="9" placeholder="5.0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Speaking</label>
                <Input name="current_speaking" type="number" step="0.5" min="0" max="9" placeholder="5.0" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50">Overall</label>
              <Input name="current_overall" type="number" step="0.5" min="0" max="9" placeholder="5.5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Ghi chú
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-pink/50"
              placeholder="Mục tiêu, chiến lược học tập..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              Tạo kế hoạch
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
