'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { WordStatus, PhraseStats } from '@/types/database'

const phraseSchema = z.object({
  phrase: z.string().min(1, 'Vui lòng nhập cụm từ'),
  meaning: z.string().min(1, 'Vui lòng nhập nghĩa'),
  meaning_vi: z.string().optional(),
  example_sentence: z.string().optional(),
  topic_id: z.string().optional(),
})

export type PhraseFormState = {
  error?: string
  success?: boolean
}

export async function getPhrases() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('phrases')
    .select('*, topic:topics(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getPhrasesByTopic(topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('phrases')
    .select('*, topic:topics(*)')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getPhraseStats(): Promise<PhraseStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { total: 0, new: 0, learning: 0, reviewing: 0, mastered: 0 }
  }

  const { data } = await supabase
    .from('phrases')
    .select('status')
    .eq('user_id', user.id)

  if (!data) {
    return { total: 0, new: 0, learning: 0, reviewing: 0, mastered: 0 }
  }

  return {
    total: data.length,
    new: data.filter(p => p.status === 'new').length,
    learning: data.filter(p => p.status === 'learning').length,
    reviewing: data.filter(p => p.status === 'reviewing').length,
    mastered: data.filter(p => p.status === 'mastered').length,
  }
}

export async function addPhrase(
  _prevState: PhraseFormState,
  formData: FormData
): Promise<PhraseFormState> {
  const rawData = {
    phrase: formData.get('phrase') as string,
    meaning: formData.get('meaning') as string,
    meaning_vi: formData.get('meaning_vi') as string,
    example_sentence: formData.get('example_sentence') as string,
    topic_id: formData.get('topic_id') as string,
  }

  const validated = phraseSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('phrases').insert({
    user_id: user.id,
    phrase: validated.data.phrase.trim(),
    meaning: validated.data.meaning.trim(),
    meaning_vi: validated.data.meaning_vi?.trim() || null,
    example_sentence: validated.data.example_sentence?.trim() || null,
    topic_id: validated.data.topic_id || null,
    status: 'new' as WordStatus,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Cụm từ này đã tồn tại trong danh sách' }
    }
    return { error: 'Không thể thêm cụm từ. Vui lòng thử lại.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updatePhrase(
  phraseId: string,
  data: {
    phrase?: string
    meaning?: string
    meaning_vi?: string
    example_sentence?: string
    topic_id?: string | null
    status?: WordStatus
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('phrases')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', phraseId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deletePhrase(phraseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('phrases')
    .delete()
    .eq('id', phraseId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updatePhraseStatus(phraseId: string, status: WordStatus) {
  return updatePhrase(phraseId, { status })
}
