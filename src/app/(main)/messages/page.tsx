import { createClient } from '@/lib/supabase/server'
import { ConversationList } from '@/components/messages/ConversationList'
import type { Conversation } from '@/types/conversation'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at, post_id,
      p1:profiles!participant_1(id, username, display_name, avatar_url),
      p2:profiles!participant_2(id, username, display_name, avatar_url),
      posts(id, title)
    `)
    .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
    .order('last_message_at', { ascending: false })

  const conversations = (raw ?? []) as unknown as Conversation[]

  // Initial unread count per conversation — Client Component keeps this live via Realtime.
  const convIds = conversations.map(c => c.id)
  const initialUnread: Record<string, number> = {}

  if (convIds.length) {
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('is_read', false)
      .neq('sender_id', user!.id)
      .in('conversation_id', convIds)

    for (const msg of unreadMessages ?? []) {
      initialUnread[msg.conversation_id] = (initialUnread[msg.conversation_id] ?? 0) + 1
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      {!conversations.length ? (
        <div className="text-center py-16 text-muted-foreground">
          No conversations yet. Message someone from a post.
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
          initialUnread={initialUnread}
          currentUserId={user!.id}
        />
      )}
    </div>
  )
}
