'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { startConversation } from '@/app/(main)/messages/actions'
import { Button } from '@/components/ui/button'

interface MessageAuthorButtonProps {
  postId: string
  recipientId: string
}

export function MessageAuthorButton({ postId, recipientId }: MessageAuthorButtonProps) {
  const [isPending, startTransitionFn] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleClick() {
    setError(null)
    startTransitionFn(async () => {
      const result = await startConversation(postId, recipientId)
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(`/messages/${result.conversationId}`)
      }
    })
  }

  return (
    <div>
      <Button size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? 'Opening...' : 'Message'}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
