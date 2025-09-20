import { BrandFilters } from '@/features/brand/utils/tableUtils'

type Props = {
  filters: BrandFilters
}

export function BrandActiveFiltersDisplay({ filters }: Props) {
  const active: string[] = []

  if (filters.status?.length) {
    active.push(`Status: ${filters.status.join(', ')}`)
  }

  if (filters.logo?.length) {
    const labels = filters.logo.map((item) => (item === 'with-logo' ? 'Dengan logo' : 'Tanpa logo'))
    active.push(`Logo: ${labels.join(', ')}`)
  }

  if (filters.website?.length) {
    const labels = filters.website.map((item) => (item === 'with-website' ? 'Dengan website' : 'Tanpa website'))
    active.push(`Website: ${labels.join(', ')}`)
  }

  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      {active.map((label) => (
        <span
          key={label}
          className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-600"
        >
          {label}
        </span>
      ))}
    </div>
  )
}
