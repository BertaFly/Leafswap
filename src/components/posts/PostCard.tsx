import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from '@/lib/date'
import type { FeedPost, PostPlantItem } from '@/types/post'

const TYPE_LABELS: Record<FeedPost['type'], string> = {
  offering_swap: 'Offering swap',
  seeking:       'Seeking',
  giveaway:      'Giveaway',
}

const TYPE_STYLES: Record<FeedPost['type'], string> = {
  offering_swap: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  seeking:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  giveaway:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export function PostCard({ post }: { post: FeedPost }) {
  const offered = post.post_plants.filter(p => p.role === 'offered')
  const sought  = post.post_plants.filter(p => p.role === 'sought')
  const author  = post.profiles
  const displayName = author?.display_name || author?.username || 'Unknown'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="rounded-xl border bg-card p-4 space-y-3 hover:bg-muted/30 transition-colors">

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={author?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">@{author?.username}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_STYLES[post.type]}`}>
            {TYPE_LABELS[post.type]}
          </span>
        </div>

        <div>
          <p className="font-semibold leading-tight">{post.title}</p>
          {post.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
          )}
        </div>

        {offered.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Offering</p>
            <div className="flex gap-1.5 flex-wrap">
              {offered.slice(0, 4).map(p => (
                <PlantChip key={p.id} postPlant={p} />
              ))}
            </div>
          </div>
        )}

        {sought.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Looking for</p>
            <div className="flex gap-1.5 flex-wrap">
              {sought.slice(0, 4).map(p => (
                <span key={p.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {p.species_name ?? p.plants?.species}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(post.created_at)}
        </p>
      </div>
    </Link>
  )
}

function PlantChip({ postPlant }: { postPlant: PostPlantItem }) {
  const photo = postPlant.plants?.photo_urls[0]
  const label = postPlant.plants?.nickname ?? postPlant.plants?.species ?? postPlant.species_name ?? ''

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full pr-2 overflow-hidden">
      {photo ? (
        <img src={photo} alt={label} className="w-5 h-5 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-muted-foreground/20 shrink-0 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
          {label[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-xs truncate max-w-[100px]">{label}</span>
    </div>
  )
}
