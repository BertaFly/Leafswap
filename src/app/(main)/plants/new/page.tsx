import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddPlantForm } from '@/components/plants/AddPlantForm'

export default async function NewPlantPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add a plant</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a plant to your collection</p>
      </div>
      <AddPlantForm userId={user.id} />
    </div>
  )
}
