import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Search, X, RotateCcw, Plus } from 'lucide-react'
import { useBrandStore } from '@/features/brand/store/brandStore'
import { useAuthStore } from '@/core/store/authStore'
import { BrandFilters } from '@/features/brand/utils/tableUtils'
import { BrandStatusFilter } from './BrandStatusFilter'
import { LogoFilter } from './LogoFilter'
import { WebsiteFilter } from './WebsiteFilter'
import { BrandActiveFiltersDisplay } from './BrandActiveFiltersDisplay'

type Props = {
  onCreate: () => void
  filters: BrandFilters
  onFiltersChange: (filters: Partial<BrandFilters>) => void
  onResetFilters: () => void
  brandCount: number
  filteredCount: number
  logoStats: { withLogo: number; withoutLogo: number }
  websiteStats: { withWebsite: number; withoutWebsite: number }
  page: number
}

export function BrandToolbar({
  onCreate,
  filters,
  onFiltersChange,
  onResetFilters,
  brandCount,
  filteredCount,
  logoStats,
  websiteStats,
  page,
}: Props) {
  const { setSearch, loadFirst } = useBrandStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    const id = setTimeout(() => {
      setSearch(query)
      void loadFirst()
    }, 250)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst, isAuthenticated])

  const infoBadge = useMemo(() => {
    return `Menampilkan ${filteredCount} dari ${brandCount} brand`
  }, [filteredCount, brandCount])

  const handleStatusChange = (value?: ('aktif' | 'tidak aktif')[]) => {
    onFiltersChange({ status: value })
  }

  const handleLogoChange = (value?: ('with-logo' | 'without-logo')[]) => {
    onFiltersChange({ logo: value })
  }

  const handleWebsiteChange = (value?: ('with-website' | 'without-website')[]) => {
    onFiltersChange({ website: value })
  }

  const handleClearSearch = () => setQuery('')

  return (
    <div className="space-y-3">
      <div className="flex w-full items-center gap-2">
        <div className="relative w-[40%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama brand"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 w-full rounded-lg border-slate-200 pl-9 text-[13px]"
            aria-label="Cari brand"
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

        <div className="flex w-[50%] items-center gap-2">
          <div className="flex-1">
            <BrandStatusFilter value={filters.status} onChange={handleStatusChange} />
          </div>
          <div className="flex-1">
            <LogoFilter
              value={filters.logo}
              onChange={handleLogoChange}
              withLogoCount={logoStats.withLogo}
              withoutLogoCount={logoStats.withoutLogo}
            />
          </div>
          <div className="flex-1">
            <WebsiteFilter
              value={filters.website}
              onChange={handleWebsiteChange}
              withWebsiteCount={websiteStats.withWebsite}
              withoutWebsiteCount={websiteStats.withoutWebsite}
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
          <BrandActiveFiltersDisplay filters={filters} />
        </div>
      </div>
    </div>
  )
}
