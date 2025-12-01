'use client'

import { useState } from 'react'
import type { IELTSPlan, IELTSSession, IELTSMilestone, IELTSStats } from '@/types/database'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target, Calendar, Clock, TrendingUp, Flame } from 'lucide-react'
import { CreatePlanModal } from './create-plan-modal'
import { AddSessionModal } from './add-session-modal'
import { AddMilestoneModal } from './add-milestone-modal'
import { SkillCard } from './skill-card'
import { SessionList } from './session-list'
import { MilestoneList } from './milestone-list'
import { PlanSelector } from './plan-selector'

interface IELTSContentProps {
  activePlan: IELTSPlan | null
  allPlans: IELTSPlan[]
  sessions: IELTSSession[]
  milestones: IELTSMilestone[]
  stats: IELTSStats | null
}

export function IELTSContent({ activePlan, allPlans, sessions, milestones, stats }: IELTSContentProps) {
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddMilestone, setShowAddMilestone] = useState(false)

  const skills = ['listening', 'reading', 'writing', 'speaking'] as const

  if (!activePlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IELTS Planner</h1>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent-pink/20 flex items-center justify-center">
                <Target className="w-8 h-8 text-accent-pink" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bắt đầu lên kế hoạch IELTS
              </h2>
              <p className="text-gray-600 dark:text-white/60 max-w-md mx-auto">
                Tạo kế hoạch học IELTS với mục tiêu điểm số, ngày thi và theo dõi tiến độ học tập của bạn.
              </p>
              <Button onClick={() => setShowCreatePlan(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Tạo kế hoạch mới
              </Button>
            </div>
          </CardContent>
        </Card>

        <CreatePlanModal open={showCreatePlan} onClose={() => setShowCreatePlan(false)} />
      </div>
    )
  }

  const daysLeft = stats?.daysUntilExam
  const totalHours = Math.round((stats?.totalStudyMinutes || 0) / 60)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IELTS Planner</h1>
          <p className="text-gray-600 dark:text-white/60">{activePlan.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {allPlans.length > 1 && <PlanSelector plans={allPlans} activePlanId={activePlan.id} />}
          <Button variant="outline" size="sm" onClick={() => setShowCreatePlan(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Kế hoạch mới
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-white/50">Còn lại</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {daysLeft !== null ? `${daysLeft} ngày` : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-white/50">Tổng giờ học</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-white/50">Tuần này</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.sessionsThisWeek || 0} phiên
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-white/50">Streak</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.currentStreak || 0} ngày
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill}
            skill={skill}
            current={activePlan[`current_${skill}` as keyof IELTSPlan] as number | null}
            target={activePlan[`target_${skill}` as keyof IELTSPlan] as number | null}
            studyMinutes={stats?.studyMinutesBySkill[skill] || 0}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setShowAddSession(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm phiên học
        </Button>
        <Button variant="outline" onClick={() => setShowAddMilestone(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm milestone
        </Button>
      </div>

      {/* Sessions and Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionList sessions={sessions} />
        <MilestoneList milestones={milestones} />
      </div>

      {/* Modals */}
      <CreatePlanModal open={showCreatePlan} onClose={() => setShowCreatePlan(false)} />
      <AddSessionModal
        open={showAddSession}
        onClose={() => setShowAddSession(false)}
        planId={activePlan.id}
      />
      <AddMilestoneModal
        open={showAddMilestone}
        onClose={() => setShowAddMilestone(false)}
        planId={activePlan.id}
      />
    </div>
  )
}
