import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostCard } from '@/components/posts/PostCard'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/date'
import type { FeedPost } from '@/types/post'

const SWAP_STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  agreed:    'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-muted text-muted-foreground',
}

const SWAP_HINTS: Record<string, (isInitiator: boolean) => string> = {
  pending:   (i) => i ? 'Waiting for their response' : 'Awaiting your response',
  agreed:    ()  => 'Ready to complete',
  completed: ()  => 'Swap completed',
  cancelled: ()  => 'Cancelled',
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === 'swaps' ? 'swaps' : 'posts'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let posts: any[] = []
  let swaps: any[] = []

  if (activeTab === 'posts') {
    const { data } = await supabase
      .from('posts')
      .select(`
        id, type, status, title, description, created_at,
        profiles!author_id(id, username, display_name, avatar_url),
        post_plants(
          id, role, species_name,
          plants(id, species, nickname, photo_urls)
        )
      `)
      .eq('author_id', user!.id)
      .order('created_at', { ascending: false })
    posts = data ?? []
  } else {
    const { data } = await supabase
      .from('swaps')
      .select(`
        id, status, offer_note, created_at, conversation_id,
        initiator_id, receiver_id,
        posts(id, title),
        initiator:profiles!initiator_id(id, username, display_name, avatar_url),
        receiver:profiles!receiver_id(id, username, display_name, avatar_url)
      `)
      .or(`initiator_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
      .order('created_at', { ascending: false })
    swaps = data ?? []
  }

  const activePosts   = posts.filter(p => p.status === 'active')
  const inactivePosts = posts.filter(p => p.status !== 'active')
  const activeSwaps   = swaps.filter(s => s.status === 'pending' || s.status === 'agreed')
  const pastSwaps     = swaps.filter(s => s.status === 'completed' || s.status === 'cancelled')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity</h1>
        <Button asChild size="sm">
          <Link href={activeTab === 'swaps' ? '/swaps/new' : '/posts/new'}>
            {activeTab === 'swaps' ? 'New swap' : 'Create post'}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { label: 'Posts',  href: '/activity',           key: 'posts',  count: posts.length },
          { label: 'Swaps',  href: '/activity?tab=swaps', key: 'swaps',  count: swaps.length },
        ].map(t => (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === t.key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
                {t.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground">You haven&apos;t created any posts yet.</p>
              <Button asChild variant="outline">
                <Link href="/posts/new">Create your first post</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {activePosts.length > 0 && (
                <section className="space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Active ({activePosts.length})
                  </p>
                  <div className="columns-1 sm:columns-2 gap-4">
                    {activePosts.map(p => (
                      <div key={p.id} className="mb-4 break-inside-avoid">
                        <PostCard post={p as unknown as FeedPost} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {inactivePosts.length > 0 && (
                <section className="space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Past ({inactivePosts.length})
                  </p>
                  <div className="columns-1 sm:columns-2 gap-4 opacity-60">
                    {inactivePosts.map(p => (
                      <div key={p.id} className="mb-4 break-inside-avoid">
                        <PostCard post={p as unknown as FeedPost} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {/* Swaps tab */}
      {activeTab === 'swaps' && (
        <>
          {swaps.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No swaps yet. Browse the feed to find plants to swap.
            </div>
          ) : (
            <div className="space-y-8">
              {activeSwaps.length > 0 && (
                <section className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Active ({activeSwaps.length})
                  </p>
                  {activeSwaps.map(swap => (
                    <SwapListItem key={swap.id} swap={swap} currentUserId={user!.id} />
                  ))}
                </section>
              )}
              {pastSwaps.length > 0 && (
                <section className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Past ({pastSwaps.length})
                  </p>
                  <div className="opacity-60">
                    {pastSwaps.map(swap => (
                      <SwapListItem key={swap.id} swap={swap} currentUserId={user!.id} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SwapListItem({ swap, currentUserId }: { swap: any; currentUserId: string }) {
  const isInitiator = swap.initiator_id === currentUserId
  const other       = isInitiator ? swap.receiver : swap.initiator
  const post        = swap.posts
  const displayName = other?.display_name || other?.username || '?'
  const initials    = displayName.slice(0, 2).toUpperCase()
  const hint        = SWAP_HINTS[swap.status]?.(isInitiator) ?? ''
  const needsAction = swap.status === 'pending' && !isInitiator

  return (
    <Link href={`/swaps/${swap.id}`}>
      <div className={cn(
        'rounded-xl border p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors',
        needsAction && 'border-amber-200 bg-amber-50/50 dark:bg-amber-900/10'
      )}>
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={other?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{displayName}</span>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
              SWAP_STATUS_STYLES[swap.status]
            )}>
              {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
            </span>
            {needsAction && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-amber-200 text-amber-800">
                Action needed
              </span>
            )}
          </div>
          {post?.title && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">Re: {post.title}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>

        <p className="text-xs text-muted-foreground shrink-0">
          {formatDistanceToNow(swap.created_at)}
        </p>
      </div>
    </Link>
  )
}
