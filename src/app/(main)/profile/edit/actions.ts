'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ProfileUpdateState = { error: string } | undefined

export async function updateProfile(
  prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const username = (formData.get('username') as string).trim().toLowerCase()
  const display_name = (formData.get('display_name') as string).trim()
  const bio = (formData.get('bio') as string).trim()
  const location = (formData.get('location') as string).trim()
  const avatar_url = (formData.get('avatar_url') as string).trim() || null

  if (!username) return { error: 'Username is required' }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ username, display_name, bio, location, avatar_url })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') return { error: 'Username already taken' }
    return { error: error.message }
  }

  revalidatePath(`/profile/${currentProfile?.username}`)
  revalidatePath(`/profile/${username}`)
  redirect(`/profile/${username}`)
}
