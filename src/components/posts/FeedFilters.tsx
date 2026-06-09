'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const FILTERS = [
  { label: 'All',       value: '' },
  { label: 'Offering',  value: 'offering_swap' },
  { label: 'Seeking',   value: 'seeking' },
  { label: 'Giveaway',  value: 'giveaway' },
]

export function FeedFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const current = searchParams.get('type') ?? ''

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set('type', value)
    else params.delete('type')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            current === f.value
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
