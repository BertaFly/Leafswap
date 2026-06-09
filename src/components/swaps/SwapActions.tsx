'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSwapStatus } from '@/app/(main)/swaps/actions'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'

type SwapStatus = 'pending' | 'agreed' | 'completed' | 'cancelled'

interface SwapActionsProps {
  swapId: string
  status: SwapStatus
  isInitiator: boolean
  conversationId: string | null
  canRate: boolean
}

export function SwapActions({ swapId, status, isInitiator, conversationId, canRate }: SwapActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function act(newStatus: 'agreed' | 'completed' | 'cancelled') {
    startTransition(async () => {
      await updateSwapStatus(swapId, newStatus)
      router.refresh()
    })
  }

  if (status === 'cancelled') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">This swap was cancelled.</p>
        {conversationId && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/messages/${conversationId}`}>Back to conversation</Link>
          </Button>
        )}
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-green-700 font-medium">Swap completed!</p>
        {canRate && (
          <Button asChild size="sm">
            <Link href={`/swaps/${swapId}/rate`}>Rate your experience</Link>
          </Button>
        )}
        {!canRate && (
          <p className="text-xs text-muted-foreground">You have already submitted a rating.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {conversationId && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/messages/${conversationId}`}>View conversation</Link>
        </Button>
      )}

      {/* Receiver: agree or cancel */}
      {!isInitiator && status === 'pending' && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={isPending}>Agree to swap</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Agree to this swap?</AlertDialogTitle>
                <AlertDialogDescription>
                  Both parties will need to mark it complete once the exchange happens.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Not yet</AlertDialogCancel>
                <AlertDialogAction onClick={() => act('agreed')}>Agree</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" disabled={isPending}
                className="text-destructive hover:text-destructive">
                Decline
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Decline this swap?</AlertDialogTitle>
                <AlertDialogDescription>
                  The proposal will be cancelled. You can still message each other.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => act('cancelled')}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Decline
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Initiator: cancel a pending proposal */}
      {isInitiator && status === 'pending' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" disabled={isPending}
              className="text-destructive hover:text-destructive">
              Withdraw proposal
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Withdraw your proposal?</AlertDialogTitle>
              <AlertDialogDescription>
                The swap proposal will be cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => act('cancelled')}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Both: mark complete when agreed */}
      {status === 'agreed' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={isPending}>Mark as completed</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark swap as completed?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm the exchange happened. Both parties can then rate each other.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction onClick={() => act('completed')}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
