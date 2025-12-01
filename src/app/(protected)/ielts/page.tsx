import { createClient } from '@/lib/supabase/server'
import { getActivePlan, getAllPlans, getSessionsByPlan, getMilestonesByPlan, getIELTSStats } from '@/lib/actions/ielts'
import { IELTSContent } from '@/components/ielts/ielts-content'

export default async function IELTSPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [activePlan, allPlans] = await Promise.all([
    getActivePlan(),
    getAllPlans(),
  ])

  let sessions: Awaited<ReturnType<typeof getSessionsByPlan>> = []
  let milestones: Awaited<ReturnType<typeof getMilestonesByPlan>> = []
  let stats: Awaited<ReturnType<typeof getIELTSStats>> | null = null

  if (activePlan) {
    [sessions, milestones, stats] = await Promise.all([
      getSessionsByPlan(activePlan.id),
      getMilestonesByPlan(activePlan.id),
      getIELTSStats(activePlan.id),
    ])
  }

  return (
    <IELTSContent
      activePlan={activePlan}
      allPlans={allPlans}
      sessions={sessions}
      milestones={milestones}
      stats={stats}
    />
  )
}
