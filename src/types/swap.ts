import type { UserProfile } from './user'
import type { PostDetailPlantItem } from './post'

export type SwapStatus = 'pending' | 'agreed' | 'completed' | 'cancelled'

export interface SwapDetail {
  id: string
  status: SwapStatus
  offer_note: string | null
  created_at: string
  completed_at: string | null
  conversation_id: string | null
  initiator_id?: string
  receiver_id?: string
  initiator: UserProfile
  receiver: UserProfile
  posts: { id: string; title: string } | null
  swap_requested_plants: Array<{
    post_plant_id: string
    post_plants: PostDetailPlantItem | null
  }>
}
