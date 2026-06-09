export type PostType = 'offering_swap' | 'seeking' | 'giveaway'
export type PostStatus = 'active' | 'completed' | 'cancelled'

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

export interface PostAuthor {
  id?: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface FeedPost {
  id: string
  type: PostType
  status: PostStatus
  title: string
  description: string | null
  created_at: string
  profiles: PostAuthor | null
  post_plants: PostPlantItem[]
}
