import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from '@/lib/date'
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

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      {!conversations.length ? (
        <div className="text-center py-16 text-muted-foreground">
          No conversations yet. Message someone from a post.
        </div>
      ) : (
        <div className="divide-y rounded-xl border overflow-hidden">
          {conversations.map(conv => {
            const other       = conv.p1.id === user!.id ? conv.p2 : conv.p1
            const displayName = other.display_name || other.username
            const initials    = displayName.slice(0, 2).toUpperCase()

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={other.avatar_url ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    {conv.last_message_at && (
                      <p className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(conv.last_message_at)}
                      </p>
                    )}
                  </div>
                  {conv.posts?.title && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Re: {conv.posts.title}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
