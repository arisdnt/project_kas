import { UISupplier } from '@/features/supplier/types/supplier'

export type SupplierSortableColumn = 'nama' | 'kontak' | 'email' | 'status' | 'updated'

export type SupplierSortState = {
  column: SupplierSortableColumn
  direction: 'asc' | 'desc'
}

export const SUPPLIER_COLUMN_CLASS = {
  supplier: 'w-[26%] min-w-[220px] pr-3',
  contact: 'w-[18%] min-w-[180px]',
  email: 'w-[18%] min-w-[200px]',
  phone: 'w-[14%] min-w-[140px]',
  status: 'w-[12%] min-w-[110px]',
  updated: 'w-[12%] min-w-[120px]',
  aksi: 'w-[10%] min-w-[100px] pr-0',
} as const

export const SUPPLIER_ROW_HEIGHT_PX = 48

export function formatSupplierDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export type SupplierFilters = {
  status?: 'aktif' | 'nonaktif' | 'blacklist' | 'all'
  contact?: ('with-contact' | 'without-contact')[]
  email?: ('with-email' | 'without-email')[]
  bank?: ('with-bank' | 'without-bank')[]
}

export function getSupplierSortedItems(items: UISupplier[], sortState: SupplierSortState | null): UISupplier[] {
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

function getSortableValue(supplier: UISupplier, column: SupplierSortableColumn): string | number {
  switch (column) {
    case 'nama':
      return (supplier.nama || '').toLowerCase()
    case 'kontak':
      return (supplier.kontak_person || supplier.telepon || supplier.email || '').toLowerCase()
    case 'email':
      return (supplier.email || '').toLowerCase()
    case 'status':
      if (!supplier.status) return 0
      if (supplier.status === 'aktif') return 3
      if (supplier.status === 'nonaktif') return 2
      return 1
    case 'updated': {
      const updated = supplier.diperbarui_pada || supplier.dibuat_pada || null
      const timestamp = updated ? new Date(updated).getTime() : 0
      return Number.isNaN(timestamp) ? 0 : timestamp
    }
    default:
      return 0
  }
}

export function getSupplierFilteredItems(items: UISupplier[], filters: SupplierFilters): UISupplier[] {
  return items.filter((supplier) => {
    if (filters.status && filters.status !== 'all') {
      const status = supplier.status ?? 'aktif'
      if (status !== filters.status) return false
    }

    if (filters.contact && filters.contact.length > 0) {
      const hasContactPerson = Boolean(supplier.kontak_person)
      const hasPhone = Boolean(supplier.telepon)
      const hasContact = hasContactPerson || hasPhone
      const wantsWith = filters.contact.includes('with-contact')
      const wantsWithout = filters.contact.includes('without-contact')

      if (!(wantsWith && wantsWithout)) {
        if (wantsWith && !hasContact) return false
        if (wantsWithout && hasContact) return false
      }
    }

    if (filters.email && filters.email.length > 0) {
      const hasEmail = Boolean(supplier.email)
      const wantsWith = filters.email.includes('with-email')
      const wantsWithout = filters.email.includes('without-email')

      if (!(wantsWith && wantsWithout)) {
        if (wantsWith && !hasEmail) return false
        if (wantsWithout && hasEmail) return false
      }
    }

    if (filters.bank && filters.bank.length > 0) {
      const hasBank = Boolean(supplier.bank_nama || supplier.bank_rekening || supplier.bank_atas_nama)
      const wantsWith = filters.bank.includes('with-bank')
      const wantsWithout = filters.bank.includes('without-bank')

      if (!(wantsWith && wantsWithout)) {
        if (wantsWith && !hasBank) return false
        if (wantsWithout && hasBank) return false
      }
    }

    return true
  })
}

export function resolveSupplierStatusLabel(status?: UISupplier['status']) {
  if (!status) return 'Aktif'
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

export function resolveSupplierStatusTone(status?: UISupplier['status']) {
  switch (status) {
    case 'aktif':
      return 'rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-600'
    case 'nonaktif':
      return 'rounded-full border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-600'
    case 'blacklist':
      return 'rounded-full border border-rose-200 bg-rose-50 text-[12px] font-semibold text-rose-600'
    default:
      return 'rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-600'
  }
}

export function getPrimaryContactName(supplier: UISupplier) {
  return supplier.kontak_person || 'Tidak ada kontak'
}

export function getPrimaryPhone(supplier: UISupplier) {
  return supplier.telepon || '—'
}

export function getPrimaryEmail(supplier: UISupplier) {
  return supplier.email || '—'
}
