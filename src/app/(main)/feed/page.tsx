import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/posts/PostCard'
import { FeedFilters } from '@/components/posts/FeedFilters'
import { Suspense } from 'react'
import type { FeedPost } from '@/types/post'

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('posts')
    .select(`
      id, type, status, title, description, created_at, author_id,
      profiles!author_id (id, username, display_name, avatar_url),
      post_plants (
        id, role, species_name,
        plants (id, species, nickname, photo_urls)
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(40)

  if (type) {
    query = query.eq('type', type)
  }

  const { data: posts } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Button asChild size="sm">
          <Link href="/posts/new">Create post</Link>
        </Button>
      </div>

      <Suspense>
        <FeedFilters />
      </Suspense>

      {!posts?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          {type ? 'No posts of this type yet.' : 'No posts yet. Be the first!'}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 gap-4">
          {posts.map(post => (
            <div key={post.id} className="mb-4 break-inside-avoid">
              <PostCard post={post as unknown as FeedPost} isOwn={post.author_id === user!.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
