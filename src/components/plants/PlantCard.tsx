import { DeletePlantButton } from './DeletePlantButton'

interface Plant {
  id: string
  species: string
  scientific_name: string | null
  nickname: string | null
  photo_urls: string[]
  is_public: boolean
}

export function PlantCard({ plant }: { plant: Plant }) {
  return (
    <div className="rounded-xl overflow-hidden border bg-card">
      <div className="aspect-square bg-muted">
        {plant.photo_urls[0] ? (
          <img
            src={plant.photo_urls[0]}
            alt={plant.nickname ?? plant.species}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
            {plant.species[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-2 space-y-1">
        <p className="text-sm font-medium leading-tight truncate">
          {plant.nickname ?? plant.species}
        </p>
        {plant.nickname && (
          <p className="text-xs text-muted-foreground truncate">{plant.species}</p>
        )}
        <div className="flex items-center justify-between pt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            plant.is_public
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          }`}>
            {plant.is_public ? 'Public' : 'Private'}
          </span>
          <DeletePlantButton plantId={plant.id} />
        </div>
      </div>
    </div>
  )
}
