'use client'

import { useState, useTransition } from 'react'
import { submitRating } from '@/app/(main)/swaps/[id]/rate/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          className={cn(
            'text-3xl transition-transform hover:scale-110 focus:outline-none',
            star <= active ? 'text-amber-400' : 'text-muted-foreground/30'
          )}
        >
          ★
        </button>
      ))}
    </div>
  )
}

const SCORE_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
}

interface RatingFormProps {
  swapId: string
  targetName: string
}

export function RatingForm({ swapId, targetName }: RatingFormProps) {
  const [score, setScore]     = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (score === 0) {
      setError('Please choose a star rating')
      return
    }

    startTransition(async () => {
      const result = await submitRating(swapId, score, comment)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>How was your swap with {targetName}?</Label>
        <StarPicker value={score} onChange={setScore} />
        {score > 0 && (
          <p className="text-sm font-medium text-amber-600">{SCORE_LABELS[score]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Leave a comment (optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Was the plant as described? How was communication? Would you swap again?"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending || score === 0} className="w-full">
        {isPending ? 'Submitting...' : 'Submit rating'}
      </Button>
    </form>
  )
}
