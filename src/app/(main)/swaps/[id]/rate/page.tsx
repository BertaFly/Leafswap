import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingForm } from '@/components/swaps/RatingForm'

export default async function RatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: swap } = await supabase
    .from('swaps')
    .select(`
      id, status, initiator_id, receiver_id,
      initiator:profiles!initiator_id(id, username, display_name, avatar_url),
      receiver:profiles!receiver_id(id, username, display_name, avatar_url),
      posts(id, title)
    `)
    .eq('id', id)
    .single()

  if (!swap) notFound()

  const initiator = (swap as any).initiator
  const receiver  = (swap as any).receiver

  if (initiator?.id !== user!.id && receiver?.id !== user!.id) notFound()
  if (swap.status !== 'completed') redirect(`/swaps/${id}`)

  // Already rated?
  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('swap_id', id)
    .eq('source_user_id', user!.id)
    .maybeSingle()

  if (existing) redirect(`/swaps/${id}`)

  const isInitiator = initiator?.id === user!.id
  const target      = isInitiator ? receiver : initiator
  const displayName = target?.display_name || target?.username || '?'
  const post        = (swap as any).posts

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <Link href={`/swaps/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to swap
        </Link>
        <h1 className="text-2xl font-bold mt-3">Rate your experience</h1>
        {post?.title && (
          <p className="text-sm text-muted-foreground mt-1">Re: {post.title}</p>
        )}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
        <Avatar className="h-12 w-12">
          <AvatarImage src={target?.avatar_url ?? undefined} />
          <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-muted-foreground">@{target?.username}</p>
        </div>
      </div>

      <RatingForm swapId={id} targetName={displayName} />
    </div>
  )
}
