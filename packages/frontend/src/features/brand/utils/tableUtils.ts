import { UIBrand } from '@/features/brand/types/brand'

export type BrandSortableColumn = 'nama' | 'status' | 'updated'

export type BrandSortState = {
  column: BrandSortableColumn
  direction: 'asc' | 'desc'
}

export const BRAND_COLUMN_CLASS = {
  brand: 'w-[22%] min-w-[180px] pr-3',
  deskripsi: 'w-[26%] min-w-[200px]',
  website: 'w-[18%] min-w-[160px]',
  status: 'w-[10%] min-w-[90px]',
  updated: 'w-[16%] min-w-[120px]',
  aksi: 'w-[8%] min-w-[90px] pr-0',
} as const

export const BRAND_ROW_HEIGHT_PX = 48

export function formatBrandDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export type BrandFilters = {
  status?: ('aktif' | 'tidak aktif')[]
  logo?: ('with-logo' | 'without-logo')[]
  website?: ('with-website' | 'without-website')[]
}

export function getBrandSortedItems(items: UIBrand[], sortState: BrandSortState | null): UIBrand[] {
  if (!sortState) return items
  const sorted = [...items]
  const direction = sortState.direction === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    const valueA = getValue(a, sortState.column)
    const valueB = getValue(b, sortState.column)

    if (valueA < valueB) return -1 * direction
    if (valueA > valueB) return 1 * direction
    return 0
  })

  return sorted
}

function getValue(brand: UIBrand, column: BrandSortableColumn): string | number {
  switch (column) {
    case 'nama':
      return (brand.nama || '').toLowerCase()
    case 'status':
      return brand.status === 'aktif' ? 1 : 0
    case 'updated': {
      const updated = (brand as any).diperbarui_pada || (brand as any).dibuat_pada || null
      const timestamp = updated ? new Date(updated).getTime() : 0
      return Number.isNaN(timestamp) ? 0 : timestamp
    }
    default:
      return 0
  }
}

export function getBrandFilteredItems(items: UIBrand[], filters: BrandFilters): UIBrand[] {
  return items.filter((brand) => {
    if (filters.status && filters.status.length > 0) {
      const status = (brand.status as 'aktif' | 'tidak aktif') || 'aktif'
      if (!filters.status.includes(status)) return false
    }

    if (filters.logo && filters.logo.length > 0) {
      const hasLogo = Boolean(brand.logo_url)
      const wantsWithLogo = filters.logo.includes('with-logo')
      const wantsWithoutLogo = filters.logo.includes('without-logo')

      if (!(wantsWithLogo && wantsWithoutLogo)) {
        if (wantsWithLogo && !hasLogo) return false
        if (wantsWithoutLogo && hasLogo) return false
      }

      if (!wantsWithLogo && !wantsWithoutLogo) return false
    }

    if (filters.website && filters.website.length > 0) {
      const hasWebsite = Boolean(brand.website)
      const wantsWithWebsite = filters.website.includes('with-website')
      const wantsWithoutWebsite = filters.website.includes('without-website')

      if (!(wantsWithWebsite && wantsWithoutWebsite)) {
        if (wantsWithWebsite && !hasWebsite) return false
        if (wantsWithoutWebsite && hasWebsite) return false
      }

      if (!wantsWithWebsite && !wantsWithoutWebsite) return false
    }

    return true
  })
}

export function resolveStatusLabel(status?: string | null) {
  if (!status) return 'Aktif'
  return status === 'aktif' ? 'Aktif' : 'Tidak Aktif'
}
