import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SwapProposalForm } from '@/components/swaps/SwapProposalForm'

export default async function NewSwapPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string; conversation?: string }>
}) {
  const { post: postId, conversation: conversationId } = await searchParams

  if (!postId || !conversationId) redirect('/feed')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch post with offered plants
  const { data: post } = await supabase
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

  if (!post) notFound()
  if ((post as any).author_id === user!.id) redirect(`/posts/${postId}`)
  if ((post as any).status !== 'active') redirect(`/posts/${postId}`)

  const offeredPlants = ((post as any).post_plants as any[]).filter(
    (pp: any) => pp.role === 'offered'
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Propose a swap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Re: <span className="font-medium">{(post as any).title}</span>
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
