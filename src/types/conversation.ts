import type { UserProfile } from './user'

export type { UserProfile }

export interface ConvPost {
  id: string
  title: string
  type?: string
  author_id?: string
}

export interface Conversation {
  id: string
  last_message_at?: string | null
  post_id: string | null
  participant_1?: string
  participant_2?: string
  p1: UserProfile
  p2: UserProfile
  posts: ConvPost | null
}
