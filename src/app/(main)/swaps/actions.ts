'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateSwapData {
  postId: string
  conversationId: string
  requestedPostPlantIds: string[]
  offerNote: string
}

export async function createSwap(
  data: CreateSwapData
): Promise<{ swapId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Fetch post to get the receiver (post author)
  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id, status')
    .eq('id', data.postId)
    .single()

  if (!post) return { error: 'Post not found' }
  if (post.author_id === user.id) return { error: 'Cannot propose a swap on your own post' }
  if (post.status !== 'active') return { error: 'This post is no longer active' }

  // Ensure no active swap already exists for this conversation
  const { data: existing } = await supabase
    .from('swaps')
    .select('id, status')
    .eq('conversation_id', data.conversationId)
    .not('status', 'eq', 'cancelled')
    .maybeSingle()

  if (existing) return { error: 'A swap proposal already exists for this conversation' }

  const { data: swap, error: swapError } = await supabase
    .from('swaps')
    .insert({
      post_id: data.postId,
      conversation_id: data.conversationId,
      initiator_id: user.id,
      receiver_id: post.author_id,
      offer_note: data.offerNote.trim() || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (swapError || !swap) return { error: swapError?.message ?? 'Failed to create swap' }

  if (data.requestedPostPlantIds.length > 0) {
    const { error: plantsError } = await supabase
      .from('swap_requested_plants')
      .insert(
        data.requestedPostPlantIds.map(post_plant_id => ({
          swap_id: swap.id,
          post_plant_id,
        }))
      )
    if (plantsError) return { error: plantsError.message }
  }

  revalidatePath(`/messages/${data.conversationId}`)
  return { swapId: swap.id }
}

export async function updateSwapStatus(
  swapId: string,
  status: 'agreed' | 'completed' | 'cancelled'
): Promise<void | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: swap } = await supabase
    .from('swaps')
    .select('initiator_id, receiver_id, status, conversation_id')
    .eq('id', swapId)
    .single()

  if (!swap) return { error: 'Swap not found' }

  const isInitiator = swap.initiator_id === user.id
  const isReceiver  = swap.receiver_id === user.id

  if (!isInitiator && !isReceiver) return { error: 'Not authorised' }

  // Status transition rules
  if (status === 'agreed' && !isReceiver)    return { error: 'Only the receiver can agree to a swap' }
  if (status === 'cancelled' && swap.status === 'completed') return { error: 'Cannot cancel a completed swap' }
  if (status === 'completed' && swap.status !== 'agreed')   return { error: 'Both parties must agree before marking complete' }

  const { error } = await supabase
    .from('swaps')
    .update({
      status,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', swapId)

  if (error) return { error: error.message }

  revalidatePath(`/swaps/${swapId}`)
  if (swap.conversation_id) revalidatePath(`/messages/${swap.conversation_id}`)
}
