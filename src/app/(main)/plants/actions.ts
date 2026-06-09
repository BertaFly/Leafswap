'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface AddPlantData {
  species: string
  scientific_name: string | null
  nickname: string | null
  description: string | null
  acquired_at: string | null
  is_public: boolean
  photo_url: string | null
}

export async function addPlant(data: AddPlantData): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('plants').insert({
    owner_id: user.id,
    species: data.species,
    scientific_name: data.scientific_name,
    nickname: data.nickname,
    description: data.description,
    acquired_at: data.acquired_at || null,
    is_public: data.is_public,
    photo_urls: data.photo_url ? [data.photo_url] : [],
  })

  if (error) return { error: error.message }

  revalidatePath('/plants')
}

export async function deletePlant(plantId: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('plants')
    .delete()
    .eq('id', plantId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/plants')
}
