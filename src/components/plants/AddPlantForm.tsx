'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addPlant } from '@/app/(main)/plants/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'

export function AddPlantForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (preview) URL.revokeObjectURL(preview)
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      let photoUrl: string | null = null
      const file = fileRef.current?.files?.[0]

      if (file) {
        const supabase = createClient()
        const ext = file.name.split('.').pop()
        const path = `${userId}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('plant-photos')
          .upload(path, file)

        if (uploadError) {
          setError(`Photo upload failed: ${uploadError.message}`)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('plant-photos')
          .getPublicUrl(path)

        photoUrl = publicUrl
      }

      const result = await addPlant({
        species: formData.get('species') as string,
        scientific_name: (formData.get('scientific_name') as string).trim() || null,
        nickname: (formData.get('nickname') as string).trim() || null,
        description: (formData.get('description') as string).trim() || null,
        acquired_at: (formData.get('acquired_at') as string) || null,
        is_public: isPublic,
        photo_url: photoUrl,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push('/plants')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            {preview && (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <Input
              id="photo"
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">
              Species <span className="text-destructive">*</span>
            </Label>
            <Input id="species" name="species" placeholder="Monstera Deliciosa" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scientific_name">Scientific name</Label>
            <Input id="scientific_name" name="scientific_name" placeholder="Monstera deliciosa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" name="nickname" placeholder="Big Boy" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Where did you get it? Notes about health or history..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquired_at">Acquired on</Label>
            <Input id="acquired_at" name="acquired_at" type="date" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Visible on profile</p>
              <p className="text-xs text-muted-foreground">
                Public plants appear on your profile and can be used in swap posts
              </p>
            </div>
            <Switch
              id="is_public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Add plant'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
