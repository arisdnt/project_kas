import { UIPelanggan } from '@/features/pelanggan/types/pelanggan'

export type PelangganSortableColumn = 'kode' | 'nama' | 'email' | 'tipe' | 'poin' | 'status' | 'updated'

export type PelangganSortState = {
  column: PelangganSortableColumn
  direction: 'asc' | 'desc'
}

export const PELANGGAN_COLUMN_CLASS = {
  kode: 'w-[12%] min-w-[110px]',
  nama: 'w-[22%] min-w-[220px] pr-3',
  email: 'w-[18%] min-w-[200px]',
  telepon: 'w-[14%] min-w-[150px]',
  tipe: 'w-[12%] min-w-[120px]',
  poin: 'w-[12%] min-w-[140px]',
  status: 'w-[10%] min-w-[110px]',
  updated: 'w-[12%] min-w-[120px]',
  aksi: 'w-[10%] min-w-[110px] pr-0',
} as const

export const PELANGGAN_ROW_HEIGHT_PX = 48

export function formatPelangganDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export type PelangganFilters = {
  status?: 'all' | 'aktif' | 'nonaktif' | 'blacklist'
  tipe?: 'all' | 'reguler' | 'vip' | 'member' | 'wholesale'
  contact?: ('with-contact' | 'without-contact')[]
  email?: ('with-email' | 'without-email')[]
  poin?: ('with-points' | 'zero-points')[]
}

export function getPelangganSortedItems(items: UIPelanggan[], sortState: PelangganSortState | null): UIPelanggan[] {
  if (!sortState) return items

  const sorted = [...items]
  const direction = sortState.direction === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    const valueA = getSortableValue(a, sortState.column)
    const valueB = getSortableValue(b, sortState.column)

    if (valueA < valueB) return -1 * direction
    if (valueA > valueB) return 1 * direction
    return 0
  })

  return sorted
}

function getSortableValue(pelanggan: UIPelanggan, column: PelangganSortableColumn): string | number {
  switch (column) {
    case 'kode':
      return (pelanggan.kode || '').toLowerCase()
    case 'nama':
      return (pelanggan.nama || '').toLowerCase()
    case 'email':
      return (pelanggan.email || '').toLowerCase()
    case 'tipe':
      return tipePriority(pelanggan.tipe)
    case 'poin':
      return pelanggan.saldo_poin ?? 0
    case 'status':
      return statusPriority(pelanggan.status)
    case 'updated': {
      const updated = pelanggan.diperbarui_pada || pelanggan.dibuat_pada || null
      const timestamp = updated ? new Date(updated).getTime() : 0
      return Number.isNaN(timestamp) ? 0 : timestamp
    }
    default:
      return 0
  }
}

function tipePriority(tipe: UIPelanggan['tipe']): number {
  switch (tipe) {
    case 'vip':
      return 4
    case 'wholesale':
      return 3
    case 'member':
      return 2
    default:
      return 1
  }
}

function statusPriority(status: UIPelanggan['status']): number {
  switch (status) {
    case 'aktif':
      return 3
    case 'nonaktif':
      return 2
    case 'blacklist':
      return 1
    default:
      return 0
  }
}

export function getPelangganFilteredItems(items: UIPelanggan[], filters: PelangganFilters): UIPelanggan[] {
  return items.filter((pelanggan) => {
    if (filters.status && filters.status !== 'all') {
      if (pelanggan.status !== filters.status) return false
    }

    if (filters.tipe && filters.tipe !== 'all') {
      if (pelanggan.tipe !== filters.tipe) return false
    }

    if (filters.contact && filters.contact.length > 0) {
      const hasContact = Boolean(pelanggan.telepon)
      const wantsWith = filters.contact.includes('with-contact')
      const wantsWithout = filters.contact.includes('without-contact')
      if (!(wantsWith && wantsWithout)) {
        if (wantsWith && !hasContact) return false
        if (wantsWithout && hasContact) return false
      }
    }

    if (filters.email && filters.email.length > 0) {
      const hasEmail = Boolean(pelanggan.email)
      const wantsWith = filters.email.includes('with-email')
      const wantsWithout = filters.email.includes('without-email')
      if (!(wantsWith && wantsWithout)) {
        if (wantsWith && !hasEmail) return false
        if (wantsWithout && hasEmail) return false
      }
    }

    if (filters.poin && filters.poin.length > 0) {
      const hasPoints = (pelanggan.saldo_poin ?? 0) > 0
      const wantsWith = filters.poin.includes('with-points')
      const wantsZero = filters.poin.includes('zero-points')
      if (!(wantsWith && wantsZero)) {
        if (wantsWith && !hasPoints) return false
        if (wantsZero && hasPoints) return false
      }
    }

    return true
  })
}

export function resolvePelangganStatusLabel(status: UIPelanggan['status']) {
  switch (status) {
    case 'aktif':
      return 'Aktif'
    case 'nonaktif':
      return 'Nonaktif'
    case 'blacklist':
      return 'Blacklist'
    default:
      return status
  }
}

export function resolvePelangganStatusTone(status: UIPelanggan['status']) {
  switch (status) {
    case 'aktif':
      return 'rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-600'
    case 'nonaktif':
      return 'rounded-full border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-600'
    case 'blacklist':
      return 'rounded-full border border-rose-200 bg-rose-50 text-[12px] font-semibold text-rose-600'
    default:
      return 'rounded-full border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-600'
  }
}

export function resolvePelangganTypeTone(tipe: UIPelanggan['tipe']) {
  switch (tipe) {
    case 'vip':
      return 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-[12px] font-semibold text-yellow-700'
    case 'member':
      return 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[12px] font-semibold text-blue-700'
    case 'wholesale':
      return 'inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-[12px] font-semibold text-purple-700'
    default:
      return 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-600'
  }
}

export function formatPoints(value: number) {
  return value.toLocaleString('id-ID')
}

export function formatDiscount(value: number) {
  if (!value) return null
  return `Diskon ${value}%`
}
