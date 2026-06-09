import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Plant {
  id: string
  species: string
  nickname: string | null
  photo_urls: string[]
  is_public: boolean
}

interface ProfilePlantGridProps {
  plants: Plant[]
  isOwnProfile: boolean
}

export function ProfilePlantGrid({ plants, isOwnProfile }: ProfilePlantGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">
          {isOwnProfile ? 'My plants' : 'Plants'} ({plants.length})
        </h2>
        {isOwnProfile && (
          <Button size="sm" asChild>
            <Link href="/plants">Manage collection</Link>
          </Button>
        )}
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {isOwnProfile
            ? 'You haven\'t added any plants yet.'
            : 'No public plants yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {plants.map(plant => (
            <div
              key={plant.id}
              className="aspect-square rounded-lg bg-muted overflow-hidden relative"
            >
              {plant.photo_urls[0] ? (
                <img
                  src={plant.photo_urls[0]}
                  alt={plant.nickname ?? plant.species}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                  {plant.nickname ?? plant.species}
                </div>
              )}
              {!plant.is_public && (
                <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Private
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
