'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const topicSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên chủ đề'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type TopicFormState = {
  error?: string
  success?: boolean
}

export async function getTopics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  return data || []
}

export async function addTopic(
  _prevState: TopicFormState,
  formData: FormData
): Promise<TopicFormState> {
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string || '📚',
    color: formData.get('color') as string || 'gray',
  }

  const validated = topicSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('topics').insert({
    user_id: user.id,
    name: validated.data.name.trim(),
    description: validated.data.description?.trim() || null,
    icon: validated.data.icon || '📚',
    color: validated.data.color || 'gray',
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Chủ đề này đã tồn tại' }
    }
    return { error: 'Không thể thêm chủ đề. Vui lòng thử lại.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTopic(
  topicId: string,
  data: { name?: string; description?: string; icon?: string; color?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('topics')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', topicId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTopic(topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
