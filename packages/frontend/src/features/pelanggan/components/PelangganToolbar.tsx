import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Search, X, RotateCcw, Plus } from 'lucide-react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { PelangganFilters } from '@/features/pelanggan/utils/tableUtils'
import { PelangganStatusFilter } from './PelangganStatusFilter'
import { PelangganTypeFilter } from './PelangganTypeFilter'
import { PelangganContactFilter } from './PelangganContactFilter'
import { PelangganEmailFilter } from './PelangganEmailFilter'
import { PelangganPointFilter } from './PelangganPointFilter'
import { PelangganActiveFiltersDisplay } from './PelangganActiveFiltersDisplay'

type Props = {
  onCreate: () => void
  filters: PelangganFilters
  onFiltersChange: (filters: Partial<PelangganFilters>) => void
  onResetFilters: () => void
  totalCount: number
  filteredCount: number
  contactStats: { withContact: number; withoutContact: number }
  emailStats: { withEmail: number; withoutEmail: number }
  pointStats: { withPoints: number; zeroPoints: number }
  page: number
}

export function PelangganToolbar({
  onCreate,
  filters,
  onFiltersChange,
  onResetFilters,
  totalCount,
  filteredCount,
  contactStats,
  emailStats,
  pointStats,
  page,
}: Props) {
  const { setSearch, loadFirst } = usePelangganStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query)
      void loadFirst()
    }, 250)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst])

  const infoBadge = useMemo(
    () => `Menampilkan ${filteredCount} dari ${totalCount} pelanggan`,
    [filteredCount, totalCount],
  )

  const handleStatusChange = (value?: 'all' | 'aktif' | 'nonaktif' | 'blacklist') => {
    onFiltersChange({ status: value })
  }

  const handleTypeChange = (value?: 'all' | 'reguler' | 'vip' | 'member' | 'wholesale') => {
    onFiltersChange({ tipe: value })
  }

  const handleContactChange = (value?: ('with-contact' | 'without-contact')[]) => {
    onFiltersChange({ contact: value })
  }

  const handleEmailChange = (value?: ('with-email' | 'without-email')[]) => {
    onFiltersChange({ email: value })
  }

  const handlePointChange = (value?: ('with-points' | 'zero-points')[]) => {
    onFiltersChange({ poin: value })
  }

  const handleClearSearch = () => setQuery('')

  return (
    <div className="space-y-3">
      <div className="flex w-full items-center gap-2">
        <div className="relative w-[35%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama, kode, email, atau telepon pelanggan"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 w-full rounded-lg border-slate-200 pl-9 text-[13px]"
            aria-label="Cari pelanggan"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
              aria-label="Kosongkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex w-[55%] items-center gap-2">
          <div className="flex-1">
            <PelangganStatusFilter value={filters.status} onChange={handleStatusChange} />
          </div>
          <div className="flex-1">
            <PelangganTypeFilter value={filters.tipe} onChange={handleTypeChange} />
          </div>
          <div className="flex-1">
            <PelangganContactFilter
              value={filters.contact}
              onChange={handleContactChange}
              withContactCount={contactStats.withContact}
              withoutContactCount={contactStats.withoutContact}
            />
          </div>
          <div className="flex-1">
            <PelangganEmailFilter
              value={filters.email}
              onChange={handleEmailChange}
              withEmailCount={emailStats.withEmail}
              withoutEmailCount={emailStats.withoutEmail}
            />
          </div>
          <div className="flex-1">
            <PelangganPointFilter
              value={filters.poin}
              onChange={handlePointChange}
              withPointsCount={pointStats.withPoints}
              zeroPointsCount={pointStats.zeroPoints}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-9 gap-1 rounded-lg border-red-200 px-3 text-[13px] text-red-600 hover:bg-red-50"
            aria-label="Bersihkan filter"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </Button>
        </div>

        <div className="w-[10%]">
          <Button onClick={onCreate} size="sm" className="h-9 w-full gap-1 rounded-lg px-2 text-[13px]">
            <Plus className="h-4 w-4" />
            <span className="hidden xl:inline">Tambah</span>
          </Button>
        </div>
      </div>

      <div className="flex w-full items-center gap-4">
        <div className="w-[40%]">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Halaman {page}
            </div>
            <span>{infoBadge}</span>
          </div>
        </div>
        <div className="w-[60%]">
          <PelangganActiveFiltersDisplay filters={filters} />
        </div>
      </div>
    </div>
  )
}
