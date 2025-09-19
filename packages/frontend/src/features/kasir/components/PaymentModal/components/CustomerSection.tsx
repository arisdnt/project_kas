import * as React from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Search, X } from 'lucide-react'
import { Customer } from '../types'
import { useCustomerSearch } from '../hooks/useCustomerSearch'

interface CustomerSectionProps {
  customer: Customer | null
  onCustomerChange: (customer: Customer | null) => void
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  onCustomerChange
}) => {
  const {
    searchState,
    setQuery,
    setShowDropdown,
    selectCustomer,
    clearSearch,
    handleKeyDown
  } = useCustomerSearch()

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    const customer = selectCustomer(selectedCustomer)
    onCustomerChange(customer)
  }

  const handleClearCustomer = () => {
    onCustomerChange(null)
    clearSearch()
  }

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selectedCustomer = handleKeyDown(e)
    if (selectedCustomer) {
      handleSelectCustomer(selectedCustomer)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Pelanggan</h3>
          <p className="text-sm text-slate-500">
            Opsional, cantumkan data pelanggan untuk referensi laporan.
          </p>
        </div>
        {customer && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearCustomer}
            className="h-8 w-8 text-slate-500 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-inset ring-slate-200/60">
        <div className="font-medium text-slate-900">
          {customer ? customer.nama || 'Umum' : 'Umum'}
        </div>
        {customer && (
          <div className="mt-1 text-xs text-slate-500">
            {[(customer as any).email, (customer as any).telepon]
              .filter(Boolean)
              .join(' • ')}
          </div>
        )}
      </div>

      <div className="relative">
        <label className="text-sm font-medium text-slate-700">Cari Pelanggan</label>
        <div className="mt-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchState.query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDownWrapper}
              placeholder="Nama, email, atau nomor telepon"
              className="h-11 rounded-xl border-slate-300 bg-white/80 pl-10"
            />
          </div>
        </div>
        {searchState.showDropdown && searchState.query && (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
            {searchState.loading && (
              <div className="px-4 py-3 text-sm text-slate-500">Memuat...</div>
            )}
            {!searchState.loading && searchState.results.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500">Tidak ada hasil</div>
            )}
            {!searchState.loading &&
              searchState.results.map((customer, idx) => (
                <button
                  key={customer.id}
                  type="button"
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                    idx === searchState.selectedIndex
                      ? 'bg-slate-100 text-slate-900'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div>
                    <div className="font-medium">{customer.nama || '-'}</div>
                    <div className="text-xs text-slate-500">
                      {[customer.email, customer.telepon].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}