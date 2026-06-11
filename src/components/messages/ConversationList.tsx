'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from '@/lib/date'
import type { Conversation } from '@/types/conversation'

interface ConversationListProps {
  conversations: Conversation[]
  initialUnread: Record<string, number>
  currentUserId: string
}

export function ConversationList({
  conversations,
  initialUnread,
  currentUserId,
}: ConversationListProps) {
  const [unread, setUnread] = useState<Record<string, number>>(initialUnread)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const convIds = conversations.map(c => c.id)
    if (!convIds.length) return

    const refreshUnreadCounts = async () => {
      const { data } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', currentUserId)
        .in('conversation_id', convIds)

      const counts = (data ?? []).reduce<Record<string, number>>((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] ?? 0) + 1
        return acc
      }, {})
      setUnread(counts)
    }

    const channel = supabase
      .channel('conv-list-unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          if (msg.sender_id === currentUserId) return
          if (!convIds.includes(msg.conversation_id)) return
          setUnread(prev => ({
            ...prev,
            [msg.conversation_id]: (prev[msg.conversation_id] ?? 0) + 1,
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => {
          // A batch of messages was marked as read — re-query all counts at once.
          refreshUnreadCounts()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, currentUserId, conversations])

  return (
    <div className="divide-y rounded-xl border overflow-hidden">
      {conversations.map(conv => {
        const other       = conv.p1.id === currentUserId ? conv.p2 : conv.p1
        const displayName = other.display_name || other.username
        const initials    = displayName.slice(0, 2).toUpperCase()
        const count       = unread[conv.id] ?? 0

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={other.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 ring-2 ring-background flex items-center justify-center text-[9px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={count > 0 ? 'font-semibold text-sm truncate' : 'font-medium text-sm truncate'}>
                  {displayName}
                </p>
                {conv.last_message_at && (
                  <p className={count > 0 ? 'text-xs font-medium text-foreground shrink-0' : 'text-xs text-muted-foreground shrink-0'}>
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
  )
}
