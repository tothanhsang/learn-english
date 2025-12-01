'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Headphones, BookOpen, PenTool, MessageCircle } from 'lucide-react'
import type { IELTSSkill } from '@/types/database'

interface SkillCardProps {
  skill: IELTSSkill
  current: number | null
  target: number | null
  studyMinutes: number
}

const skillConfig = {
  listening: {
    label: 'Listening',
    icon: Headphones,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    progressColor: 'bg-blue-500',
  },
  reading: {
    label: 'Reading',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    progressColor: 'bg-green-500',
  },
  writing: {
    label: 'Writing',
    icon: PenTool,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    progressColor: 'bg-purple-500',
  },
  speaking: {
    label: 'Speaking',
    icon: MessageCircle,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    progressColor: 'bg-orange-500',
  },
}

export function SkillCard({ skill, current, target, studyMinutes }: SkillCardProps) {
  const config = skillConfig[skill]
  const Icon = config.icon
  const hours = Math.round(studyMinutes / 60)

  const progress = current && target ? Math.min((current / target) * 100, 100) : 0

  return (
    <Card className="hover:shadow-md transition dark:hover:border-white/25">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{config.label}</h3>
              <p className="text-sm text-gray-500 dark:text-white/50">{hours}h học</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {current ?? '—'}
            </div>
            <div className="text-sm text-gray-500 dark:text-white/50">
              Mục tiêu: {target ?? '—'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {target && (
          <div className="mt-4">
            <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-white/50">
              <span>{current ?? 0}</span>
              <span>{target}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
