import { createClient } from '@/lib/supabase/server'
import { CreatePostForm } from '@/components/posts/CreatePostForm'

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: plants } = await supabase
    .from('plants')
    .select('id, species, nickname, photo_urls')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create a post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Offer a swap, seek a plant, or give one away
        </p>
      </div>
      <CreatePostForm userPlants={plants ?? []} />
    </div>
  )
}
