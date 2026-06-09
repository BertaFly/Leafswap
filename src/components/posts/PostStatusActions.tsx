'use client'

import { useTransition } from 'react'
import { updatePostStatus } from '@/app/(main)/posts/actions'
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

export function PostStatusActions({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleUpdate(status: 'completed' | 'cancelled') {
    startTransition(async () => {
      await updatePostStatus(postId, status)
    })
  }

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={isPending}>Mark complete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the post and remove it from the active feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdate('completed')}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" disabled={isPending}
            className="text-destructive hover:text-destructive">
            Cancel post
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the post from the feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUpdate('cancelled')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
