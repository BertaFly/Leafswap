import type { UserProfile } from './user'

export type PostType   = 'offering_swap' | 'seeking' | 'giveaway'
export type PostStatus = 'active' | 'completed' | 'cancelled'

// Used in feed cards and post lists
export interface PostPlantItem {
  id: string
  role: 'offered' | 'sought'
  species_name: string | null
  plants: {
    id: string
    species: string
    nickname: string | null
    scientific_name?: string | null
    description?: string | null
    photo_urls: string[]
  } | null
}

export interface FeedPost {
  id: string
  type: PostType
  status: PostStatus
  title: string
  description: string | null
  created_at: string
  profiles: UserProfile | null
  post_plants: PostPlantItem[]
}

// Used in post detail page and swap proposal page
export type PostDetailPlantItem = PostPlantItem

export interface PostDetail {
  id: string
  type: PostType
  status: PostStatus
  title: string
  description: string | null
  created_at: string
  profiles: UserProfile | null
  post_plants: PostDetailPlantItem[]
}

// Used in swap proposal form page (narrower shape)
export interface PostWithPlants {
  id: string
  title: string
  status: PostStatus
  author_id: string
  post_plants: PostDetailPlantItem[]
}
