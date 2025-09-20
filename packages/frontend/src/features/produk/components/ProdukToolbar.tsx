import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Checkbox } from '@/core/components/ui/checkbox'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'

type Props = {
  onCreate: () => void
}

export function ProdukToolbar({ onCreate }: Props) {
  const {
    items,
    categories,
    brands,
    suppliers,
    filters,
    setSearch,
    setFilters,
    loadFirst,
  } = useProdukStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const categoryOptions = useMemo(() => {
    const master = categories.map((c) => c.nama).filter(Boolean)
    if (master.length > 0) return Array.from(new Set(master)) as string[]
    return Array.from(
      new Set(
        items
          .map((item) => item.kategori?.nama)
          .filter((nama): nama is string => Boolean(nama)),
      ),
    )
  }, [categories, items])

  const brandOptions = useMemo(() => {
    const master = brands.map((b) => b.nama).filter(Boolean)
    if (master.length > 0) return Array.from(new Set(master)) as string[]
    return Array.from(
      new Set(
        items
          .map((item) => item.brand?.nama)
          .filter((nama): nama is string => Boolean(nama)),
      ),
    )
  }, [brands, items])

  const supplierOptions = useMemo(() => {
    const master = suppliers.map((s) => s.nama).filter(Boolean)
    if (master.length > 0) return Array.from(new Set(master)) as string[]
    return Array.from(
      new Set(
        items
          .map((item) => item.supplier?.nama)
          .filter((nama): nama is string => Boolean(nama)),
      ),
    )
  }, [suppliers, items])

  const toolbarHasFilter = Boolean(
    (filters.kategori && filters.kategori.length > 0) ||
      (filters.brand && filters.brand.length > 0) ||
      (filters.supplier && filters.supplier.length > 0) ||
      (filters.status && filters.status.length > 0),
  )

  // Debounced global search synced dengan store & backend
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setTimeout(() => {
      setSearch(query)
      loadFirst()
    }, 250)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst, isAuthenticated])

  const handleClear = () => {
    setQuery('')
  }

  const toggleArrayFilter = (current: string[] | undefined, value: string, nextChecked: boolean) => {
    const next = new Set(current ?? [])
    if (nextChecked) {
      next.add(value)
    } else {
      next.delete(value)
    }
    const arr = Array.from(next)
    return arr.length > 0 ? arr : undefined
  }

  const handleCategoryToggle = (value: string, checked: boolean) => {
    setFilters({ kategori: toggleArrayFilter(filters.kategori, value, checked) })
  }

  const handleBrandToggle = (value: string, checked: boolean) => {
    setFilters({ brand: toggleArrayFilter(filters.brand, value, checked) })
  }

  const handleSupplierToggle = (value: string, checked: boolean) => {
    setFilters({ supplier: toggleArrayFilter(filters.supplier, value, checked) })
  }

  const handleStatusToggle = (value: 'aktif' | 'tidak aktif', checked: boolean) => {
    const next = toggleArrayFilter(filters.status as string[] | undefined, value, checked) as
      | ('aktif' | 'tidak aktif')[]
      | undefined
    setFilters({ status: next })
  }

  const handleResetFilters = () => {
    setFilters({}, { replace: true })
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 md:flex-nowrap">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Cari nama produk atau kode"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 rounded-lg border-slate-200 pl-9 text-[13px]"
          aria-label="Cari produk"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
            aria-label="Kosongkan pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Popover.Root open={filterOpen} onOpenChange={setFilterOpen}>
        <Popover.Trigger asChild>
          <Button
            variant={toolbarHasFilter ? 'secondary' : 'outline'}
            size="sm"
            className="h-9 gap-2 rounded-lg px-3 text-[13px]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="end"
            className="z-50 w-[320px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="space-y-4 text-[12px] text-slate-600">
              {categoryOptions.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Kategori</p>
                  <div className="mt-2 max-h-28 space-y-1 overflow-auto pr-1">
                    {categoryOptions.map((nama) => {
                      const id = `kategori-${nama}`
                      return (
                        <label
                          key={nama}
                          htmlFor={id}
                          className="flex items-center gap-2 rounded px-1 py-1 hover:bg-slate-50"
                        >
                          <Checkbox
                            id={id}
                            checked={filters.kategori?.includes(nama) ?? false}
                            onCheckedChange={(checked) =>
                              handleCategoryToggle(
                                nama,
                                Boolean(checked),
                              )
                            }
                          />
                          <span className="truncate">{nama}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {brandOptions.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Brand</p>
                  <div className="mt-2 max-h-24 space-y-1 overflow-auto pr-1">
                    {brandOptions.map((nama) => {
                      const id = `brand-${nama}`
                      return (
                        <label
                          key={nama}
                          htmlFor={id}
                          className="flex items-center gap-2 rounded px-1 py-1 hover:bg-slate-50"
                        >
                          <Checkbox
                            id={id}
                            checked={filters.brand?.includes(nama) ?? false}
                            onCheckedChange={(checked) =>
                              handleBrandToggle(
                                nama,
                                Boolean(checked),
                              )
                            }
                          />
                          <span className="truncate">{nama}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {supplierOptions.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Supplier</p>
                  <div className="mt-2 max-h-24 space-y-1 overflow-auto pr-1">
                    {supplierOptions.map((nama) => {
                      const id = `supplier-${nama}`
                      return (
                        <label
                          key={nama}
                          htmlFor={id}
                          className="flex items-center gap-2 rounded px-1 py-1 hover:bg-slate-50"
                        >
                          <Checkbox
                            id={id}
                            checked={filters.supplier?.includes(nama) ?? false}
                            onCheckedChange={(checked) =>
                              handleSupplierToggle(
                                nama,
                                Boolean(checked),
                              )
                            }
                          />
                          <span className="truncate">{nama}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-2 space-y-1">
                  {(['aktif', 'tidak aktif'] as const).map((status) => {
                    const id = `status-${status}`
                    return (
                      <label
                        key={status}
                        htmlFor={id}
                        className="flex items-center gap-2 rounded px-1 py-1 hover:bg-slate-50"
                      >
                        <Checkbox
                          id={id}
                          checked={filters.status?.includes(status) ?? false}
                          onCheckedChange={(checked) =>
                            handleStatusToggle(status, Boolean(checked))
                          }
                        />
                        <span className="capitalize">{status.replace('-', ' ')}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-[12px] text-slate-500"
                  onClick={() => {
                    handleResetFilters()
                  }}
                >
                  Reset filter
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px]"
                  onClick={() => setFilterOpen(false)}
                >
                  Selesai
                </Button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Button onClick={onCreate} size="sm" className="h-9 gap-2 rounded-lg px-3 text-[13px]">
        <Plus className="h-4 w-4" />
        Tambah Produk
      </Button>
    </div>
  )
}
