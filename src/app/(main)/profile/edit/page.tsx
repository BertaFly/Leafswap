import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/components/profile/EditProfileForm'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, location, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your public profile information</p>
      </div>
      <EditProfileForm profile={profile} />
    </div>
  )
}
