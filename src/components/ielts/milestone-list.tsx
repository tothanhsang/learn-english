'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText, Trophy, Award, StickyNote, Trash2 } from 'lucide-react'
import type { IELTSMilestone, MilestoneType } from '@/types/database'
import { deleteMilestone } from '@/lib/actions/ielts'
import { useState } from 'react'

interface MilestoneListProps {
  milestones: IELTSMilestone[]
}

const typeConfig = {
  practice_test: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20', label: 'Practice Test' },
  mock_exam: { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20', label: 'Mock Exam' },
  achievement: { icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-500/20', label: 'Thành tích' },
  note: { icon: StickyNote, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-white/10', label: 'Ghi chú' },
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa milestone này?')) return
    setDeleting(id)
    await deleteMilestone(id)
    setDeleting(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatScores = (milestone: IELTSMilestone) => {
    const scores = []
    if (milestone.listening_score) scores.push(`L: ${milestone.listening_score}`)
    if (milestone.reading_score) scores.push(`R: ${milestone.reading_score}`)
    if (milestone.writing_score) scores.push(`W: ${milestone.writing_score}`)
    if (milestone.speaking_score) scores.push(`S: ${milestone.speaking_score}`)
    return scores.join(' | ')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-white/50 text-center py-4">
            Chưa có milestone nào. Thêm khi hoàn thành bài test!
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.slice(0, 10).map((milestone) => {
              const type = milestone.milestone_type as MilestoneType
              const config = typeConfig[type]
              const Icon = config.icon
              const scores = formatScores(milestone)

              return (
                <div
                  key={milestone.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {milestone.title || config.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-white/40">
                            {formatDate(milestone.milestone_date)}
                          </span>
                          <button
                            onClick={() => handleDelete(milestone.id)}
                            disabled={deleting === milestone.id}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {milestone.overall_score && (
                        <p className="text-lg font-bold text-accent-pink mt-1">
                          Overall: {milestone.overall_score}
                        </p>
                      )}
                      {scores && (
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                          {scores}
                        </p>
                      )}
                      {milestone.notes && (
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-2 line-clamp-2">
                          {milestone.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
