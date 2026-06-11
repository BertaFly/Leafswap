'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SwapActions } from './SwapActions'
import type { SwapStatus } from '@/types/swap'

const STATUS_STYLES: Record<SwapStatus, string> = {
  pending:   'bg-amber-100 text-amber-700',
  agreed:    'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-muted text-muted-foreground',
}

const STATUS_LABELS: Record<SwapStatus, string> = {
  pending:   'Pending',
  agreed:    'Agreed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface SwapStatusWatcherProps {
  swapId: string
  initialStatus: SwapStatus
  isInitiator: boolean
  conversationId: string | null
  hasAlreadyRated: boolean
}

export function SwapStatusWatcher({
  swapId,
  initialStatus,
  isInitiator,
  conversationId,
  hasAlreadyRated,
}: SwapStatusWatcherProps) {
  const [status, setStatus] = useState<SwapStatus>(initialStatus)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`swap:${swapId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'swaps',
          filter: `id=eq.${swapId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as SwapStatus
          setStatus(newStatus)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [swapId])

  const canRate = status === 'completed' && !hasAlreadyRated

  return (
    <>
      <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLES[status]}`}>
        {STATUS_LABELS[status]}
      </span>

      <SwapActions
        swapId={swapId}
        status={status}
        isInitiator={isInitiator}
        conversationId={conversationId}
        canRate={canRate}
      />
    </>
  )
}
