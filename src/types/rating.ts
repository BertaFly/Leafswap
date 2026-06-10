import type { UserProfile } from './user'

export interface ProfileRatingItem {
  id: string
  score: number
  comment: string | null
  created_at: string
  profiles: UserProfile | null
}
