import { PelangganFilters } from '@/features/pelanggan/utils/tableUtils'

type Props = {
  filters: PelangganFilters
}

export function PelangganActiveFiltersDisplay({ filters }: Props) {
  const active: string[] = []

  if (filters.status && filters.status !== 'all') {
    const label = filters.status === 'aktif' ? 'Aktif' : filters.status === 'nonaktif' ? 'Nonaktif' : 'Blacklist'
    active.push(`Status: ${label}`)
  }

  if (filters.tipe && filters.tipe !== 'all') {
    active.push(`Tipe: ${filters.tipe.toUpperCase()}`)
  }

  if (filters.contact?.length) {
    const labels = filters.contact.map((item) => (item === 'with-contact' ? 'Dengan telepon' : 'Tanpa telepon'))
    active.push(`Telepon: ${labels.join(', ')}`)
  }

  if (filters.email?.length) {
    const labels = filters.email.map((item) => (item === 'with-email' ? 'Dengan email' : 'Tanpa email'))
    active.push(`Email: ${labels.join(', ')}`)
  }

  if (filters.poin?.length) {
    const labels = filters.poin.map((item) => (item === 'with-points' ? 'Memiliki poin' : 'Tanpa poin'))
    active.push(`Poin: ${labels.join(', ')}`)
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
