'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { WordStatus } from '@/types/database'

const wordSchema = z.object({
  word: z.string().min(1, 'Vui lòng nhập từ vựng'),
  definition: z.string().min(1, 'Vui lòng nhập nghĩa'),
  definition_vi: z.string().optional(),
  phonetic: z.string().optional(),
})

export type WordFormState = {
  error?: string
  success?: boolean
}

export async function addWord(
  _prevState: WordFormState,
  formData: FormData
): Promise<WordFormState> {
  const rawData = {
    word: formData.get('word') as string,
    definition: formData.get('definition') as string,
    definition_vi: formData.get('definition_vi') as string,
    phonetic: formData.get('phonetic') as string,
  }

  const validated = wordSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vui lòng đăng nhập' }
  }

  const { error } = await supabase.from('words').insert({
    user_id: user.id,
    word: validated.data.word.toLowerCase().trim(),
    definition: validated.data.definition.trim(),
    definition_vi: validated.data.definition_vi?.trim() || null,
    phonetic: validated.data.phonetic?.trim() || null,
    status: 'new' as WordStatus,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Từ này đã tồn tại trong danh sách' }
    }
    return { error: 'Không thể thêm từ. Vui lòng thử lại.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateWord(
  wordId: string,
  data: { word?: string; definition?: string; definition_vi?: string; phonetic?: string; status?: WordStatus }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('words')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', wordId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/practice')
  return { success: true }
}

export async function deleteWord(wordId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('words')
    .delete()
    .eq('id', wordId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateWordStatus(wordId: string, status: WordStatus) {
  return updateWord(wordId, { status })
}
