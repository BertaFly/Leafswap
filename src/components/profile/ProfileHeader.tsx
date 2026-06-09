import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
  avg_rating: number | null
  swap_count: number
}

interface ProfileHeaderProps {
  profile: Profile
  isOwnProfile: boolean
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const displayName = profile.display_name || profile.username

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
            {profile.location && (
              <p className="text-muted-foreground text-sm mt-0.5">{profile.location}</p>
            )}
          </div>
        </div>
        {isOwnProfile && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit">Edit profile</Link>
          </Button>
        )}
      </div>

      {profile.bio && (
        <p className="text-sm leading-relaxed max-w-prose">{profile.bio}</p>
      )}

      <div className="flex gap-6 text-sm">
        <div>
          <span className="font-semibold">{profile.swap_count}</span>
          <span className="text-muted-foreground ml-1">swaps</span>
        </div>
        {profile.avg_rating && (
          <div>
            <span className="font-semibold">{profile.avg_rating.toFixed(1)}</span>
            <span className="text-muted-foreground ml-1">rating</span>
          </div>
        )}
      </div>

      <Separator />
    </div>
  )
}
