'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSwap } from '@/app/(main)/swaps/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PostPlant {
  id: string
  role: string
  species_name: string | null
  plants: { id: string; species: string; nickname: string | null; photo_urls: string[] } | null
}

interface SwapProposalFormProps {
  postId: string
  conversationId: string
  offeredPlants: PostPlant[]
}

export function SwapProposalForm({ postId, conversationId, offeredPlants }: SwapProposalFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [offerNote, setOfferNote] = useState('')
  const router = useRouter()

  function togglePlant(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedIds.length === 0) {
      setError('Select at least one plant you want from this post')
      return
    }

    startTransition(async () => {
      const result = await createSwap({
        postId,
        conversationId,
        requestedPostPlantIds: selectedIds,
        offerNote,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(`/swaps/${result.swapId}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="space-y-3">
        <Label>Which plants do you want? <span className="text-destructive">*</span></Label>
        {offeredPlants.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-center text-sm text-muted-foreground">
              This post has no specific plants listed.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {offeredPlants.map(pp => {
              const plant = pp.plants
              const label = plant?.nickname ?? plant?.species ?? pp.species_name ?? '?'
              const selected = selectedIds.includes(pp.id)

              return (
                <button
                  key={pp.id}
                  type="button"
                  onClick={() => togglePlant(pp.id)}
                  className={cn(
                    'rounded-xl border overflow-hidden text-left transition-colors',
                    selected ? 'border-foreground ring-1 ring-foreground' : 'border-border'
                  )}
                >
                  <div className="aspect-video bg-muted">
                    {plant?.photo_urls?.[0] ? (
                      <img src={plant.photo_urls[0]} alt={label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground/20">
                        {label[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="p-2 text-xs font-medium truncate">{label}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer_note">What will you offer in return?</Label>
        <Textarea
          id="offer_note"
          value={offerNote}
          onChange={e => setOfferNote(e.target.value)}
          placeholder="Describe the plants, cuttings, or anything else you're offering..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Be specific — size, condition, rooted or cutting, shipping info.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Sending...' : 'Send proposal'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
