'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const writingSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'Vui lòng nhập nội dung'),
  written_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  topic_id: z.string().optional(),
})

export type WritingFormState = {
  error?: string
  success?: boolean
}

export async function getWritings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('writings')
    .select('*, topic:topics(*)')
    .eq('user_id', user.id)
    .order('written_date', { ascending: false })

  return data || []
}

export async function getWritingsByDate(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('writings')
    .select('*, topic:topics(*)')
    .eq('user_id', user.id)
    .eq('written_date', date)
    .order('created_at', { ascending: false })

  return data || []
}

export async function addWriting(
  _prevState: WritingFormState,
  formData: FormData
): Promise<WritingFormState> {
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    written_date: formData.get('written_date') as string,
    topic_id: formData.get('topic_id') as string,
  }

  const validated = writingSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('writings').insert({
    user_id: user.id,
    title: validated.data.title?.trim() || null,
    content: validated.data.content.trim(),
    written_date: validated.data.written_date,
    topic_id: validated.data.topic_id || null,
  })

  if (error) {
    return { error: 'Không thể lưu bài viết. Vui lòng thử lại.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateWriting(
  writingId: string,
  data: {
    title?: string
    content?: string
    written_date?: string
    topic_id?: string | null
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('writings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', writingId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteWriting(writingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('writings')
    .delete()
    .eq('id', writingId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
