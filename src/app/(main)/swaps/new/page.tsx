import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SwapProposalForm } from '@/components/swaps/SwapProposalForm'
import type { PostWithPlants } from '@/types/post'

export default async function NewSwapPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string; conversation?: string }>
}) {
  const { post: postId, conversation: conversationId } = await searchParams

  if (!postId || !conversationId) redirect('/feed')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('posts')
    .select(`
      id, title, status, author_id,
      post_plants(
        id, role, species_name,
        plants(id, species, nickname, photo_urls)
      )
    `)
    .eq('id', postId)
    .single()

  if (!raw) notFound()

  const post = raw as unknown as PostWithPlants

  if (post.author_id === user!.id) redirect(`/posts/${postId}`)
  if (post.status !== 'active') redirect(`/posts/${postId}`)

  const offeredPlants = post.post_plants.filter(pp => pp.role === 'offered')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Propose a swap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Re: <span className="font-medium">{post.title}</span>
        </p>
      </div>
      <SwapProposalForm
        postId={postId}
        conversationId={conversationId}
        offeredPlants={offeredPlants}
      />
    </div>
  )
}
