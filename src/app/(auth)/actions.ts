'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type AuthState = { error: string } | undefined

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string,
        display_name: formData.get('username') as string,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  redirect('/check-email')
}

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }
  redirect('/feed')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
