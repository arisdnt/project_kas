import { SupplierFilters } from '@/features/supplier/utils/tableUtils'

type Props = {
  filters: SupplierFilters
}

export function SupplierActiveFiltersDisplay({ filters }: Props) {
  const active: string[] = []

  if (filters.status && filters.status !== 'all') {
    const statusLabel =
      filters.status === 'aktif' ? 'Aktif' : filters.status === 'nonaktif' ? 'Nonaktif' : 'Blacklist'
    active.push(`Status: ${statusLabel}`)
  }

  if (filters.contact?.length) {
    const labels = filters.contact.map((value) =>
      value === 'with-contact' ? 'Dengan kontak' : 'Tanpa kontak',
    )
    active.push(`Kontak: ${labels.join(', ')}`)
  }

  if (filters.email?.length) {
    const labels = filters.email.map((value) =>
      value === 'with-email' ? 'Dengan email' : 'Tanpa email',
    )
    active.push(`Email: ${labels.join(', ')}`)
  }

  if (filters.bank?.length) {
    const labels = filters.bank.map((value) =>
      value === 'with-bank' ? 'Memiliki rekening' : 'Tanpa rekening',
    )
    active.push(`Rekening: ${labels.join(', ')}`)
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
