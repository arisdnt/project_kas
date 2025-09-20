import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Search, X, RotateCcw, Plus } from 'lucide-react'
import { useSupplierStore } from '@/features/supplier/store/supplierStore'
import { SupplierFilters } from '@/features/supplier/utils/tableUtils'
import { SupplierStatusFilter } from './SupplierStatusFilter'
import { ContactFilter } from './ContactFilter'
import { EmailFilter } from './EmailFilter'
import { BankFilter } from './BankFilter'
import { SupplierActiveFiltersDisplay } from './SupplierActiveFiltersDisplay'

type Props = {
  onCreate: () => void
  filters: SupplierFilters
  onFiltersChange: (filters: Partial<SupplierFilters>) => void
  onResetFilters: () => void
  totalCount: number
  filteredCount: number
  contactStats: { withContact: number; withoutContact: number }
  emailStats: { withEmail: number; withoutEmail: number }
  bankStats: { withBank: number; withoutBank: number }
  page: number
}

export function SupplierToolbar({
  onCreate,
  filters,
  onFiltersChange,
  onResetFilters,
  totalCount,
  filteredCount,
  contactStats,
  emailStats,
  bankStats,
  page,
}: Props) {
  const { setSearch, loadFirst } = useSupplierStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query)
      void loadFirst()
    }, 250)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst])

  const infoBadge = useMemo(() => `Menampilkan ${filteredCount} dari ${totalCount} supplier`, [filteredCount, totalCount])

  const handleStatusChange = (value?: 'all' | 'aktif' | 'nonaktif' | 'blacklist') => {
    onFiltersChange({ status: value })
  }

  const handleContactChange = (value?: ('with-contact' | 'without-contact')[]) => {
    onFiltersChange({ contact: value })
  }

  const handleEmailChange = (value?: ('with-email' | 'without-email')[]) => {
    onFiltersChange({ email: value })
  }

  const handleBankChange = (value?: ('with-bank' | 'without-bank')[]) => {
    onFiltersChange({ bank: value })
  }

  const handleClearSearch = () => setQuery('')

  return (
    <div className="space-y-3">
      <div className="flex w-full items-center gap-2">
        <div className="relative w-[40%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama atau kontak supplier"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 w-full rounded-lg border-slate-200 pl-9 text-[13px]"
            aria-label="Cari supplier"
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
            <SupplierStatusFilter value={filters.status} onChange={handleStatusChange} />
          </div>
          <div className="flex-1">
            <ContactFilter
              value={filters.contact}
              onChange={handleContactChange}
              withContactCount={contactStats.withContact}
              withoutContactCount={contactStats.withoutContact}
            />
          </div>
          <div className="flex-1">
            <EmailFilter
              value={filters.email}
              onChange={handleEmailChange}
              withEmailCount={emailStats.withEmail}
              withoutEmailCount={emailStats.withoutEmail}
            />
          </div>
          <div className="flex-1">
            <BankFilter
              value={filters.bank}
              onChange={handleBankChange}
              withBankCount={bankStats.withBank}
              withoutBankCount={bankStats.withoutBank}
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
          <SupplierActiveFiltersDisplay filters={filters} />
        </div>
      </div>
    </div>
  )
}
