import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfilePlantGrid } from '@/components/profile/ProfilePlantGrid'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, location, avatar_url, avg_rating, swap_count')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id

  let plantsQuery = supabase
    .from('plants')
    .select('id, species, nickname, photo_urls, is_public')
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false })

  if (!isOwnProfile) {
    plantsQuery = plantsQuery.eq('is_public', true)
  }

  const { data: plants } = await plantsQuery

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <ProfilePlantGrid plants={plants ?? []} isOwnProfile={isOwnProfile} />
    </div>
  )
}
