'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type PostType = 'offering_swap' | 'seeking' | 'giveaway'

interface CreatePostData {
  type: PostType
  title: string
  description: string | null
  offeredPlantIds: string[]
  soughtSpecies: string[]
}

export async function createPost(
  data: CreatePostData
): Promise<{ error: string } | { postId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      type: data.type,
      title: data.title,
      description: data.description,
      status: 'active',
    })
    .select('id')
    .single()

  if (postError || !post) return { error: postError?.message ?? 'Failed to create post' }

  const plantRows = [
    ...data.offeredPlantIds.map(plant_id => ({
      post_id: post.id,
      role: 'offered' as const,
      plant_id,
      species_name: null,
    })),
    ...data.soughtSpecies.map(species_name => ({
      post_id: post.id,
      role: 'sought' as const,
      plant_id: null,
      species_name,
    })),
  ]

  if (plantRows.length > 0) {
    const { error: plantsError } = await supabase.from('post_plants').insert(plantRows)
    if (plantsError) return { error: plantsError.message }
  }

  revalidatePath('/feed')
  revalidatePath('/posts')
  return { postId: post.id }
}

export async function updatePostStatus(
  postId: string,
  status: 'completed' | 'cancelled'
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('posts')
    .update({ status })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/posts/${postId}`)
  revalidatePath('/feed')
  revalidatePath('/posts')
}
