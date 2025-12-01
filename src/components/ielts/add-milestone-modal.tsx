'use client'

import { useFormState } from 'react-dom'
import { useEffect, useRef } from 'react'
import { addMilestone, type IELTSFormState } from '@/lib/actions/ielts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, FileText, Award, Trophy, StickyNote } from 'lucide-react'

interface AddMilestoneModalProps {
  open: boolean
  onClose: () => void
  planId: string
}

const milestoneTypes = [
  { value: 'practice_test', label: 'Practice Test', icon: FileText, color: 'text-blue-500' },
  { value: 'mock_exam', label: 'Mock Exam', icon: Trophy, color: 'text-purple-500' },
  { value: 'achievement', label: 'Thành tích', icon: Award, color: 'text-yellow-500' },
  { value: 'note', label: 'Ghi chú', icon: StickyNote, color: 'text-gray-500' },
]

export function AddMilestoneModal({ open, onClose, planId }: AddMilestoneModalProps) {
  const [state, formAction] = useFormState<IELTSFormState, FormData>(addMilestone, {})
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
      <div className="relative w-full max-w-lg mx-4 bg-white dark:glass-card dark:bg-white/10 dark:border dark:border-white/15 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-transparent dark:backdrop-blur-xl p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm milestone</h2>
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
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">Loại</label>
            <div className="grid grid-cols-2 gap-2">
              {milestoneTypes.map((type) => {
                const Icon = type.icon
                return (
                  <label key={type.value} className="relative">
                    <input
                      type="radio"
                      name="milestone_type"
                      value={type.value}
                      className="peer sr-only"
                      required
                    />
                    <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-white/20 rounded-lg cursor-pointer transition peer-checked:border-accent-pink peer-checked:bg-accent-pink/10 hover:bg-gray-50 dark:hover:bg-white/5">
                      <Icon className={`w-5 h-5 ${type.color}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Tiêu đề
            </label>
            <Input name="title" placeholder="VD: Cambridge 18 Test 1" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">
              Ngày
            </label>
            <Input name="milestone_date" type="date" defaultValue={today} />
          </div>

          {/* Scores */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Điểm số (tùy chọn)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Listening</label>
                <Input name="listening_score" type="number" step="0.5" min="0" max="9" placeholder="7.0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Reading</label>
                <Input name="reading_score" type="number" step="0.5" min="0" max="9" placeholder="7.0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Writing</label>
                <Input name="writing_score" type="number" step="0.5" min="0" max="9" placeholder="6.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50">Speaking</label>
                <Input name="speaking_score" type="number" step="0.5" min="0" max="9" placeholder="6.5" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50">Overall</label>
              <Input name="overall_score" type="number" step="0.5" min="0" max="9" placeholder="7.0" />
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
              placeholder="Nhận xét, điều cần cải thiện..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              Thêm milestone
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
