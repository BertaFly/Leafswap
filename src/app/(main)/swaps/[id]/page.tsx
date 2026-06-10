import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SwapActions } from '@/components/swaps/SwapActions'
import type { SwapDetail } from '@/types/swap'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  agreed:    'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-muted text-muted-foreground',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending',
  agreed:    'Agreed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default async function SwapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('swaps')
    .select(`
      id, status, offer_note, created_at, completed_at, conversation_id,
      initiator:profiles!initiator_id(id, username, display_name, avatar_url),
      receiver:profiles!receiver_id(id, username, display_name, avatar_url),
      posts(id, title),
      swap_requested_plants(
        post_plant_id,
        post_plants(
          id, role, species_name,
          plants(id, species, nickname, photo_urls)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const swap = raw as unknown as SwapDetail

  if (swap.initiator.id !== user!.id && swap.receiver.id !== user!.id) notFound()

  const isInitiator    = swap.initiator.id === user!.id
  const requestedPlants = swap.swap_requested_plants.map(srp => srp.post_plants)

  const { data: userRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('swap_id', id)
    .eq('source_user_id', user!.id)
    .maybeSingle()

  const canRate = swap.status === 'completed' && !userRating

  return (
    <div className="max-w-xl mx-auto space-y-6">

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Swap proposal</h1>
          {swap.posts && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Re:{' '}
              <Link href={`/posts/${swap.posts.id}`} className="hover:underline">
                {swap.posts.title}
              </Link>
            </p>
          )}
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLES[swap.status]}`}>
          {STATUS_LABELS[swap.status]}
        </span>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        {([
          { label: 'Proposing', profile: swap.initiator },
          { label: 'Receiving', profile: swap.receiver },
        ] as const).map(({ label, profile }) => {
          const displayName = profile.display_name || profile.username
          return (
            <div key={label} className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
              <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 hover:opacity-80">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{displayName}</span>
              </Link>
            </div>
          )
        })}
      </div>

      <Separator />

      {requestedPlants.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">
            {isInitiator ? 'You requested' : 'They want'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {requestedPlants.map(pp => {
              if (!pp) return null
              const plant = pp.plants
              const label = plant?.nickname ?? plant?.species ?? pp.species_name ?? '?'
              return (
                <div key={pp.id} className="rounded-xl border overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {plant?.photo_urls?.[0] ? (
                      <img src={plant.photo_urls[0]} alt={label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground/20">
                        {label[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="p-2 text-xs font-medium truncate">{label}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {swap.offer_note && (
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">
            {isInitiator ? 'Your offer' : 'Their offer'}
          </p>
          <div className="rounded-xl bg-muted p-3 text-sm leading-relaxed">
            {swap.offer_note}
          </div>
        </div>
      )}

      <Separator />

      <SwapActions
        swapId={id}
        status={swap.status}
        isInitiator={isInitiator}
        conversationId={swap.conversation_id}
        canRate={canRate}
      />
    </div>
  )
}
