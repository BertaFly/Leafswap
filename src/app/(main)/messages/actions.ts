'use server'

import { createClient } from '@/lib/supabase/server'

export async function startConversation(
  postId: string,
  recipientId: string
): Promise<{ conversationId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === recipientId) return { error: 'Cannot message yourself' }

  // Check if conversation already exists (either participant order)
  const { data: existing1 } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', user.id)
    .eq('participant_2', recipientId)
    .eq('post_id', postId)
    .maybeSingle()

  if (existing1) return { conversationId: existing1.id }

  const { data: existing2 } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', recipientId)
    .eq('participant_2', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (existing2) return { conversationId: existing2.id }

  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: user.id,
      participant_2: recipientId,
      post_id: postId,
    })
    .select('id')
    .single()

  if (error || !conv) return { error: error?.message ?? 'Failed to start conversation' }

  return { conversationId: conv.id }
}
