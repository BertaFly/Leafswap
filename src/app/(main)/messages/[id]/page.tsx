import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ConversationView } from '@/components/messages/ConversationView'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: conv } = await supabase
    .from('conversations')
    .select(`
      id, post_id, participant_1, participant_2,
      p1:profiles!participant_1(id, username, display_name, avatar_url),
      p2:profiles!participant_2(id, username, display_name, avatar_url),
      posts(id, title, type)
    `)
    .eq('id', id)
    .single()

  if (!conv) notFound()

  const p1 = conv.p1 as any
  const p2 = conv.p2 as any

  // Only participants can view the conversation
  if (p1?.id !== user!.id && p2?.id !== user!.id) notFound()

  const other = p1?.id === user!.id ? p2 : p1
  const post = conv.posts as any

  const participantsMap: Record<string, { username: string; display_name: string | null; avatar_url: string | null }> = {
    [p1.id]: p1,
    [p2.id]: p2,
  }

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_id')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b shrink-0">
        <Link href="/messages" className="text-muted-foreground hover:text-foreground text-sm">
          ← Back
        </Link>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">
            {other?.display_name || other?.username}
          </p>
          {post?.title && (
            <p className="text-xs text-muted-foreground truncate">
              Re:{' '}
              <Link href={`/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </p>
          )}
        </div>
      </div>

      <ConversationView
        conversationId={id}
        currentUserId={user!.id}
        initialMessages={initialMessages ?? []}
        participantsMap={participantsMap}
      />
    </div>
  )
}
