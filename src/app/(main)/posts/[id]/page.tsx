import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { PostStatusActions } from '@/components/posts/PostStatusActions'
import { MessageAuthorButton } from '@/components/messages/MessageAuthorButton'
import { formatDistanceToNow } from '@/lib/date'
import type { PostDetail } from '@/types/post'

const TYPE_LABELS: Record<string, string> = {
  offering_swap: 'Offering swap',
  seeking:       'Seeking',
  giveaway:      'Giveaway',
}

const TYPE_STYLES: Record<string, string> = {
  offering_swap: 'bg-green-100 text-green-700',
  seeking:       'bg-blue-100 text-blue-700',
  giveaway:      'bg-amber-100 text-amber-700',
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('posts')
    .select(`
      id, type, status, title, description, created_at,
      profiles!author_id(id, username, display_name, avatar_url),
      post_plants(
        id, role, species_name,
        plants(id, species, nickname, scientific_name, description, photo_urls)
      )
    `)
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const post    = raw as unknown as PostDetail
  const author  = post.profiles
  const isOwner = user?.id === author?.id
  const offered = post.post_plants.filter(p => p.role === 'offered')
  const sought  = post.post_plants.filter(p => p.role === 'sought')
  const displayName = author?.display_name || author?.username || 'Unknown'

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${TYPE_STYLES[post.type]}`}>
            {TYPE_LABELS[post.type]}
          </span>
          {post.status !== 'active' && (
            <span className="text-sm px-3 py-1 rounded-full font-medium bg-muted text-muted-foreground capitalize">
              {post.status}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        {post.description && (
          <p className="text-muted-foreground leading-relaxed">{post.description}</p>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link href={`/profile/${author?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author?.avatar_url ?? undefined} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              @{author?.username} · {formatDistanceToNow(post.created_at)}
            </p>
          </div>
        </Link>

        {!isOwner && post.status === 'active' && author?.id && (
          <MessageAuthorButton postId={post.id} recipientId={author.id} />
        )}
        {isOwner && post.status === 'active' && (
          <PostStatusActions postId={post.id} />
        )}
      </div>

      <Separator />

      {offered.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">
            {post.type === 'giveaway' ? 'Giving away' : 'Offering'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {offered.map(pp => {
              const plant = pp.plants
              return (
                <div key={pp.id} className="rounded-xl border overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {plant?.photo_urls?.[0] ? (
                      <img src={plant.photo_urls[0]} alt={plant.species} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground/20">
                        {plant?.species?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p className="text-sm font-medium">{plant?.nickname ?? plant?.species}</p>
                    {plant?.nickname && <p className="text-xs text-muted-foreground">{plant.species}</p>}
                    {plant?.scientific_name && (
                      <p className="text-xs text-muted-foreground italic">{plant.scientific_name}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {sought.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Looking for</h2>
          <div className="flex flex-wrap gap-2">
            {sought.map(pp => (
              <span key={pp.id} className="px-3 py-1.5 bg-muted rounded-full text-sm">
                {pp.species_name ?? pp.plants?.species}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
