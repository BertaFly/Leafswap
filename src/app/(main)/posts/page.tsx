import { redirect } from 'next/navigation'

export default function PostsPage() {
  redirect('/activity?tab=posts')
}
