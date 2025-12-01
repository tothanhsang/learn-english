'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Headphones, BookOpen, PenTool, MessageCircle, Clock, Trash2 } from 'lucide-react'
import type { IELTSSession, IELTSSkill } from '@/types/database'
import { deleteSession } from '@/lib/actions/ielts'
import { useState } from 'react'

interface SessionListProps {
  sessions: IELTSSession[]
}

const skillConfig = {
  listening: { icon: Headphones, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
  reading: { icon: BookOpen, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' },
  writing: { icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  speaking: { icon: MessageCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' },
}

export function SessionList({ sessions }: SessionListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa phiên học này?')) return
    setDeleting(id)
    await deleteSession(id)
    setDeleting(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Hôm nay'
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua'

    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Phiên học gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-white/50 text-center py-4">
            Chưa có phiên học nào. Bắt đầu học ngay!
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => {
              const skill = session.skill as IELTSSkill
              const config = skillConfig[skill]
              const Icon = config.icon

              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {skill}
                    </p>
                    {session.activity && (
                      <p className="text-xs text-gray-500 dark:text-white/50 truncate">
                        {session.activity}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                    <Clock className="w-4 h-4" />
                    {session.duration_minutes}m
                  </div>
                  <div className="text-xs text-gray-400 dark:text-white/40">
                    {formatDate(session.session_date)}
                  </div>
                  <button
                    onClick={() => handleDelete(session.id)}
                    disabled={deleting === session.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
