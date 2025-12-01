'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { IELTSPlan, IELTSSession, IELTSMilestone, IELTSSkill, MilestoneType, IELTSStats } from '@/types/database'

// Schemas
const planSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên kế hoạch'),
  exam_date: z.string().optional(),
  target_listening: z.coerce.number().min(0).max(9).optional(),
  target_reading: z.coerce.number().min(0).max(9).optional(),
  target_writing: z.coerce.number().min(0).max(9).optional(),
  target_speaking: z.coerce.number().min(0).max(9).optional(),
  target_overall: z.coerce.number().min(0).max(9).optional(),
  current_listening: z.coerce.number().min(0).max(9).optional(),
  current_reading: z.coerce.number().min(0).max(9).optional(),
  current_writing: z.coerce.number().min(0).max(9).optional(),
  current_speaking: z.coerce.number().min(0).max(9).optional(),
  current_overall: z.coerce.number().min(0).max(9).optional(),
  study_hours_per_day: z.coerce.number().min(1).max(12).default(2),
  notes: z.string().optional(),
})

const sessionSchema = z.object({
  plan_id: z.string(),
  skill: z.enum(['listening', 'reading', 'writing', 'speaking']),
  duration_minutes: z.coerce.number().min(1, 'Thời gian phải ít nhất 1 phút'),
  activity: z.string().optional(),
  notes: z.string().optional(),
  session_date: z.string().optional(),
})

const milestoneSchema = z.object({
  plan_id: z.string(),
  milestone_type: z.enum(['practice_test', 'mock_exam', 'achievement', 'note']),
  listening_score: z.coerce.number().min(0).max(9).optional(),
  reading_score: z.coerce.number().min(0).max(9).optional(),
  writing_score: z.coerce.number().min(0).max(9).optional(),
  speaking_score: z.coerce.number().min(0).max(9).optional(),
  overall_score: z.coerce.number().min(0).max(9).optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  milestone_date: z.string().optional(),
})

export type IELTSFormState = {
  error?: string
  success?: boolean
  timestamp?: number
}

// ========== PLAN ACTIONS ==========

export async function createPlan(
  _prevState: IELTSFormState,
  formData: FormData
): Promise<IELTSFormState> {
  const rawData = {
    name: formData.get('name') as string,
    exam_date: formData.get('exam_date') as string,
    target_listening: formData.get('target_listening') as string,
    target_reading: formData.get('target_reading') as string,
    target_writing: formData.get('target_writing') as string,
    target_speaking: formData.get('target_speaking') as string,
    target_overall: formData.get('target_overall') as string,
    current_listening: formData.get('current_listening') as string,
    current_reading: formData.get('current_reading') as string,
    current_writing: formData.get('current_writing') as string,
    current_speaking: formData.get('current_speaking') as string,
    current_overall: formData.get('current_overall') as string,
    study_hours_per_day: formData.get('study_hours_per_day') as string,
    notes: formData.get('notes') as string,
  }

  const validated = planSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('ielts_plans').insert({
    user_id: user.id,
    name: validated.data.name,
    exam_date: validated.data.exam_date || null,
    target_listening: validated.data.target_listening || null,
    target_reading: validated.data.target_reading || null,
    target_writing: validated.data.target_writing || null,
    target_speaking: validated.data.target_speaking || null,
    target_overall: validated.data.target_overall || null,
    current_listening: validated.data.current_listening || null,
    current_reading: validated.data.current_reading || null,
    current_writing: validated.data.current_writing || null,
    current_speaking: validated.data.current_speaking || null,
    current_overall: validated.data.current_overall || null,
    study_hours_per_day: validated.data.study_hours_per_day,
    notes: validated.data.notes || null,
    is_active: true,
  })

  if (error) {
    return { error: 'Không thể tạo kế hoạch. Vui lòng thử lại.' }
  }

  revalidatePath('/ielts')
  return { success: true, timestamp: Date.now() }
}

export async function updatePlan(
  planId: string,
  data: Partial<IELTSPlan>
): Promise<IELTSFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('ielts_plans')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/ielts')
  return { success: true }
}

export async function deletePlan(planId: string): Promise<IELTSFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('ielts_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/ielts')
  return { success: true }
}

export async function getActivePlan(): Promise<IELTSPlan | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('ielts_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function getAllPlans(): Promise<IELTSPlan[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('ielts_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

// ========== SESSION ACTIONS ==========

export async function addSession(
  _prevState: IELTSFormState,
  formData: FormData
): Promise<IELTSFormState> {
  const rawData = {
    plan_id: formData.get('plan_id') as string,
    skill: formData.get('skill') as string,
    duration_minutes: formData.get('duration_minutes') as string,
    activity: formData.get('activity') as string,
    notes: formData.get('notes') as string,
    session_date: formData.get('session_date') as string,
  }

  const validated = sessionSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('ielts_sessions').insert({
    plan_id: validated.data.plan_id,
    user_id: user.id,
    skill: validated.data.skill as IELTSSkill,
    duration_minutes: validated.data.duration_minutes,
    activity: validated.data.activity || null,
    notes: validated.data.notes || null,
    session_date: validated.data.session_date || new Date().toISOString().split('T')[0],
  })

  if (error) {
    return { error: 'Không thể thêm phiên học. Vui lòng thử lại.' }
  }

  revalidatePath('/ielts')
  return { success: true, timestamp: Date.now() }
}

export async function deleteSession(sessionId: string): Promise<IELTSFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('ielts_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/ielts')
  return { success: true }
}

export async function getSessionsByPlan(planId: string): Promise<IELTSSession[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('ielts_sessions')
    .select('*')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })
    .limit(50)

  return data || []
}

export async function getRecentSessions(days: number = 7): Promise<IELTSSession[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('ielts_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('session_date', startDate.toISOString().split('T')[0])
    .order('session_date', { ascending: false })

  return data || []
}

// ========== MILESTONE ACTIONS ==========

export async function addMilestone(
  _prevState: IELTSFormState,
  formData: FormData
): Promise<IELTSFormState> {
  const rawData = {
    plan_id: formData.get('plan_id') as string,
    milestone_type: formData.get('milestone_type') as string,
    listening_score: formData.get('listening_score') as string,
    reading_score: formData.get('reading_score') as string,
    writing_score: formData.get('writing_score') as string,
    speaking_score: formData.get('speaking_score') as string,
    overall_score: formData.get('overall_score') as string,
    title: formData.get('title') as string,
    notes: formData.get('notes') as string,
    milestone_date: formData.get('milestone_date') as string,
  }

  const validated = milestoneSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('ielts_milestones').insert({
    plan_id: validated.data.plan_id,
    user_id: user.id,
    milestone_type: validated.data.milestone_type as MilestoneType,
    listening_score: validated.data.listening_score || null,
    reading_score: validated.data.reading_score || null,
    writing_score: validated.data.writing_score || null,
    speaking_score: validated.data.speaking_score || null,
    overall_score: validated.data.overall_score || null,
    title: validated.data.title || null,
    notes: validated.data.notes || null,
    milestone_date: validated.data.milestone_date || new Date().toISOString().split('T')[0],
  })

  if (error) {
    return { error: 'Không thể thêm milestone. Vui lòng thử lại.' }
  }

  revalidatePath('/ielts')
  return { success: true, timestamp: Date.now() }
}

export async function deleteMilestone(milestoneId: string): Promise<IELTSFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('ielts_milestones')
    .delete()
    .eq('id', milestoneId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/ielts')
  return { success: true }
}

export async function getMilestonesByPlan(planId: string): Promise<IELTSMilestone[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('ielts_milestones')
    .select('*')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .order('milestone_date', { ascending: false })

  return data || []
}

// ========== STATS ==========

export async function getIELTSStats(planId: string): Promise<IELTSStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultStats: IELTSStats = {
    totalStudyMinutes: 0,
    studyMinutesBySkill: { listening: 0, reading: 0, writing: 0, speaking: 0 },
    sessionsThisWeek: 0,
    currentStreak: 0,
    daysUntilExam: null,
  }

  if (!user) return defaultStats

  // Get all sessions for this plan
  const { data: sessions } = await supabase
    .from('ielts_sessions')
    .select('*')
    .eq('plan_id', planId)
    .eq('user_id', user.id)

  if (!sessions || sessions.length === 0) return defaultStats

  // Calculate total minutes and by skill
  const studyMinutesBySkill: Record<IELTSSkill, number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  }
  let totalStudyMinutes = 0

  sessions.forEach((session) => {
    totalStudyMinutes += session.duration_minutes
    studyMinutesBySkill[session.skill as IELTSSkill] += session.duration_minutes
  })

  // Sessions this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const sessionsThisWeek = sessions.filter(
    (s) => new Date(s.session_date) >= oneWeekAgo
  ).length

  // Calculate streak
  const uniqueDates = [...new Set(sessions.map((s) => s.session_date))].sort().reverse()
  let currentStreak = 0
  const today = new Date().toISOString().split('T')[0]

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() - i)
    const expected = expectedDate.toISOString().split('T')[0]

    if (uniqueDates.includes(expected)) {
      currentStreak++
    } else if (i === 0 && uniqueDates[0] !== today) {
      // Allow for today not being logged yet
      continue
    } else {
      break
    }
  }

  // Get days until exam
  const { data: plan } = await supabase
    .from('ielts_plans')
    .select('exam_date')
    .eq('id', planId)
    .single()

  let daysUntilExam: number | null = null
  if (plan?.exam_date) {
    const examDate = new Date(plan.exam_date)
    const todayDate = new Date()
    daysUntilExam = Math.ceil((examDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  return {
    totalStudyMinutes,
    studyMinutesBySkill,
    sessionsThisWeek,
    currentStreak,
    daysUntilExam,
  }
}
