'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/(main)/profile/edit/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

interface Profile {
  username: string
  display_name: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
}

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              defaultValue={profile.username}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9_]+"
              title="Lowercase letters, numbers, and underscores only"
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name ?? ''}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ''}
              placeholder="Tell the community about your plants..."
              rows={3}
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile.location ?? ''}
              placeholder="City, Country"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={profile.avatar_url ?? ''}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Paste a URL to an image. File upload coming soon.
            </p>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
