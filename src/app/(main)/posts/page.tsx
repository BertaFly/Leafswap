import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/posts/PostCard'
import type { FeedPost } from '@/types/post'

export default async function MyPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, type, status, title, description, created_at,
      profiles!author_id (id, username, display_name, avatar_url),
      post_plants (
        id, role, species_name,
        plants (id, species, nickname, photo_urls)
      )
    `)
    .eq('author_id', user!.id)
    .order('created_at', { ascending: false })

  const active    = posts?.filter(p => p.status === 'active')    ?? []
  const inactive  = posts?.filter(p => p.status !== 'active')    ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Button asChild size="sm">
          <Link href="/posts/new">Create post</Link>
        </Button>
      </div>

      {!posts?.length ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground">You haven&apos;t created any posts yet.</p>
          <Button asChild variant="outline">
            <Link href="/posts/new">Create your first post</Link>
          </Button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Active ({active.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {active.map(post => <PostCard key={post.id} post={post as unknown as FeedPost} />)}
              </div>
            </section>
          )}
          {inactive.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Past posts ({inactive.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
                {inactive.map(post => <PostCard key={post.id} post={post as unknown as FeedPost} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
