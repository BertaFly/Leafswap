'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/date'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface Participant {
  username: string
  display_name: string | null
  avatar_url: string | null
}

const SWAP_STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 border-amber-200 text-amber-800',
  agreed:    'bg-blue-50 border-blue-200 text-blue-800',
  completed: 'bg-green-50 border-green-200 text-green-800',
}

const SWAP_STATUS_LABELS: Record<string, string> = {
  pending:   'Swap proposal pending',
  agreed:    'Swap agreed',
  completed: 'Swap completed',
}

interface ConversationViewProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
  participantsMap: Record<string, Participant>
  linkedPost?: { id: string; title: string; authorId: string } | null
  existingSwap?: { id: string; status: string } | null
}

export function ConversationView({
  conversationId,
  currentUserId,
  initialMessages,
  participantsMap,
  linkedPost,
  existingSwap,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  async function handleSend() {
    const content = input.trim()
    if (!content || isSending) return

    setInput('')
    setIsSending(true)

    const { data: inserted } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: currentUserId, content })
      .select('id, content, sender_id, created_at')
      .single()

    if (inserted) {
      // Add immediately from insert response so the sender doesn't wait for
      // the WebSocket event, which may not yet be established on first send.
      // The Realtime dedup check prevents this from appearing twice.
      setMessages(prev =>
        prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted]
      )
    }

    setIsSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isPostAuthor = linkedPost?.authorId === currentUserId
  const canProposeSwap = linkedPost && !isPostAuthor && !existingSwap

  return (
    <>
      {/* Swap banner */}
      {(existingSwap || canProposeSwap) && (
        <div className={cn(
          'mt-3 rounded-xl border px-3 py-2 flex items-center justify-between gap-3 shrink-0 text-sm',
          existingSwap
            ? SWAP_STATUS_STYLES[existingSwap.status] ?? 'bg-muted border-border text-foreground'
            : 'bg-muted border-border text-muted-foreground'
        )}>
          {existingSwap ? (
            <>
              <span className="font-medium">{SWAP_STATUS_LABELS[existingSwap.status] ?? 'Swap'}</span>
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => router.push(`/swaps/${existingSwap.id}`)}>
                View swap
              </Button>
            </>
          ) : (
            <>
              <span>Ready to make it official?</span>
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => router.push(`/swaps/new?post=${linkedPost!.id}&conversation=${conversationId}`)}>
                Propose swap
              </Button>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map(msg => {
          const isOwn = msg.sender_id === currentUserId
          const sender = participantsMap[msg.sender_id]
          const displayName = sender?.display_name || sender?.username || '?'
          const initials = displayName.slice(0, 2).toUpperCase()

          return (
            <div key={msg.id} className={cn('flex gap-2 items-end', isOwn && 'flex-row-reverse')}>
              {!isOwn && (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={sender?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-[75%] space-y-0.5', isOwn && 'items-end flex flex-col')}>
                <div
                  className={cn(
                    'px-3 py-2 rounded-2xl text-sm leading-relaxed',
                    isOwn
                      ? 'bg-foreground text-background rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  {formatDistanceToNow(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t shrink-0">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!input.trim() || isSending} size="sm">
          Send
        </Button>
      </div>
    </>
  )
}
