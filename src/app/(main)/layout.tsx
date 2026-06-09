import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/nav/NavBar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar
        username={profile?.username ?? ''}
        displayName={profile?.display_name ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  )
}
