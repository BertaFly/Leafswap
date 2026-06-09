'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/(main)/posts/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PostType = 'offering_swap' | 'seeking' | 'giveaway'

const POST_TYPES: { value: PostType; label: string; description: string }[] = [
  { value: 'offering_swap', label: 'Offering swap',  description: 'I have a plant to trade' },
  { value: 'seeking',       label: 'Seeking',        description: 'I\'m looking for a plant' },
  { value: 'giveaway',      label: 'Giveaway',       description: 'I\'m giving a plant away' },
]

interface UserPlant {
  id: string
  species: string
  nickname: string | null
  photo_urls: string[]
}

export function CreatePostForm({ userPlants }: { userPlants: UserPlant[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [postType, setPostType] = useState<PostType>('offering_swap')
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([])
  const [soughtSpecies, setSoughtSpecies] = useState<string[]>([''])
  const router = useRouter()

  function togglePlant(plantId: string) {
    setSelectedPlantIds(prev =>
      prev.includes(plantId) ? prev.filter(id => id !== plantId) : [...prev, plantId]
    )
  }

  function updateSoughtSpecies(index: number, value: string) {
    setSoughtSpecies(prev => prev.map((s, i) => i === index ? value : s))
  }

  function addSoughtSpecies() {
    setSoughtSpecies(prev => [...prev, ''])
  }

  function removeSoughtSpecies(index: number) {
    setSoughtSpecies(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const filledSought = soughtSpecies.map(s => s.trim()).filter(Boolean)

    if (postType !== 'seeking' && selectedPlantIds.length === 0) {
      setError('Select at least one plant from your collection')
      return
    }
    if (postType === 'offering_swap' && filledSought.length === 0) {
      setError('Add at least one plant you\'re looking for')
      return
    }
    if (postType === 'seeking' && filledSought.length === 0) {
      setError('Add at least one plant you\'re seeking')
      return
    }

    startTransition(async () => {
      const result = await createPost({
        type: postType,
        title: formData.get('title') as string,
        description: (formData.get('description') as string).trim() || null,
        offeredPlantIds: selectedPlantIds,
        soughtSpecies: filledSought,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(`/posts/${result.postId}`)
        router.refresh()
      }
    })
  }

  const showOffered = postType !== 'seeking'
  const showSought  = postType !== 'giveaway'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Post type */}
      <div className="space-y-2">
        <Label>Post type</Label>
        <div className="grid grid-cols-3 gap-3">
          {POST_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setPostType(t.value)}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                postType === t.value
                  ? 'border-foreground bg-muted'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Monstera Thai Constellation looking for Philodendron"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Condition, size, shipping details, preferences..."
          rows={3}
        />
      </div>

      {/* Plants from collection (offered) */}
      {showOffered && (
        <div className="space-y-2">
          <Label>
            {postType === 'giveaway' ? 'Plant(s) you\'re giving away' : 'Plant(s) you\'re offering'}
            <span className="text-destructive"> *</span>
          </Label>
          {userPlants.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center text-sm text-muted-foreground">
                No plants in your collection yet.{' '}
                <a href="/plants/new" className="text-primary underline">Add a plant</a> first.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {userPlants.map(plant => {
                const selected = selectedPlantIds.includes(plant.id)
                return (
                  <button
                    key={plant.id}
                    type="button"
                    onClick={() => togglePlant(plant.id)}
                    className={cn(
                      'rounded-lg border overflow-hidden text-left transition-colors',
                      selected ? 'border-foreground ring-1 ring-foreground' : 'border-border'
                    )}
                  >
                    <div className="aspect-square bg-muted">
                      {plant.photo_urls[0] ? (
                        <img src={plant.photo_urls[0]} alt={plant.species} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground/30">
                          {plant.species[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-xs font-medium truncate">{plant.nickname ?? plant.species}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Sought species */}
      {showSought && (
        <div className="space-y-2">
          <Label>
            {postType === 'seeking' ? 'Plant(s) you\'re looking for' : 'Looking for in return'}
            {postType !== 'offering_swap' ? '' : <span className="text-destructive"> *</span>}
          </Label>
          <div className="space-y-2">
            {soughtSpecies.map((species, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={species}
                  onChange={e => updateSoughtSpecies(i, e.target.value)}
                  placeholder="e.g. Alocasia Zebrina"
                />
                {soughtSpecies.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeSoughtSpecies(i)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addSoughtSpecies}>
              + Add another
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create post'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
