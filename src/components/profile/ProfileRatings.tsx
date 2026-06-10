import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from '@/lib/date'

interface Rating {
  id: string
  score: number
  comment: string | null
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

function Stars({ score }: { score: number }) {
  return (
    <span className="text-amber-400 text-sm" aria-label={`${score} out of 5 stars`}>
      {'★'.repeat(score)}
      <span className="text-muted-foreground/30">{'★'.repeat(5 - score)}</span>
    </span>
  )
}

export function ProfileRatings({ ratings }: { ratings: Rating[] }) {
  if (ratings.length === 0) return null

  return (
    <div className="space-y-4">
      <Separator />
      <h2 className="font-semibold text-lg">Ratings ({ratings.length})</h2>
      <div className="space-y-4">
        {ratings.map(rating => {
          const reviewer   = rating.profiles
          const authorName = reviewer?.display_name || reviewer?.username || 'Unknown'
          const initials   = authorName.slice(0, 2).toUpperCase()

          return (
            <div key={rating.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/profile/${reviewer?.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={reviewer?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{authorName}</span>
                </Link>
                <div className="flex items-center gap-2">
                  <Stars score={rating.score} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(rating.created_at)}
                  </span>
                </div>
              </div>
              {rating.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                  {rating.comment}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
