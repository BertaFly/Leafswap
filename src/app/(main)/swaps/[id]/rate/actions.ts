'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitRating(
  swapId: string,
  score: number,
  comment: string
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: swap } = await supabase
    .from('swaps')
    .select('initiator_id, receiver_id, status')
    .eq('id', swapId)
    .single()

  if (!swap) return { error: 'Swap not found' }
  if (swap.status !== 'completed') return { error: 'Swap is not completed yet' }

  const isInitiator = swap.initiator_id === user.id
  const isReceiver  = swap.receiver_id  === user.id

  if (!isInitiator && !isReceiver) return { error: 'Not authorised' }

  const target_user_id = isInitiator ? swap.receiver_id : swap.initiator_id

  const { error } = await supabase.from('ratings').insert({
    swap_id:        swapId,
    source_user_id: user.id,
    target_user_id,
    score,
    comment: comment.trim() || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already rated this swap' }
    return { error: error.message }
  }

  revalidatePath(`/swaps/${swapId}`)
  revalidatePath(`/profile`)
  redirect(`/swaps/${swapId}`)
}
