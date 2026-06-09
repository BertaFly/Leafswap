import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlantCard } from '@/components/plants/PlantCard'

export default async function PlantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: plants } = await supabase
    .from('plants')
    .select('id, species, scientific_name, nickname, photo_urls, is_public')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Collection ({plants?.length ?? 0})</h1>
        <Button asChild>
          <Link href="/plants/new">Add plant</Link>
        </Button>
      </div>

      {!plants?.length ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground">You haven&apos;t added any plants yet.</p>
          <Button asChild variant="outline">
            <Link href="/plants/new">Add your first plant</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  )
}
