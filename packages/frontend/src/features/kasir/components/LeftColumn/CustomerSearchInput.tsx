import { useState, useRef, useEffect } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Search, X, User } from 'lucide-react'
import { UIPelanggan } from '@/features/pelanggan/types/pelanggan'
import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'

interface CustomerSearchInputProps {
  selectedCustomer: { id: string; nama: string } | UIPelanggan | null
  onCustomerSelect: (customer: UIPelanggan | null) => void
  onSearchModalOpen: () => void
}

export function CustomerSearchInput({
  selectedCustomer,
  onCustomerSelect,
  onSearchModalOpen
}: CustomerSearchInputProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<UIPelanggan[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuthStore()

  const searchCustomers = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        limit: '10',
        status: 'aktif'
      })

      const response = await fetch(`${config.api.url}:${config.api.port}/api/pelanggan?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const customers = data.data?.pelanggan || data.data || []
          setSuggestions(customers.slice(0, 8)) // Limit to 8 suggestions
        }
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(true)

    // If input is cleared, reset to general customer
    if (!value.trim()) {
      onCustomerSelect(null)
    }
  }

  const handleCustomerSelect = (customer: UIPelanggan) => {
    onCustomerSelect(customer)
    setQuery(customer.nama)
    setIsOpen(false)
    setSuggestions([])
  }

  const handleClear = () => {
    setQuery('')
    onCustomerSelect(null)
    setIsOpen(false)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow clicking on suggestions
    setTimeout(() => setIsOpen(false), 200)
  }

  // Update query when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer?.nama) {
      setQuery(selectedCustomer.nama)
      setIsOpen(false) // Close dropdown when customer is set externally
    } else {
      setQuery('')
    }
  }, [selectedCustomer?.id, selectedCustomer?.nama])

  // display text is derived directly in JSX when needed

  return (
    <div className="relative min-w-[200px]">
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Cari pelanggan... [Alt+P]"
          className="pl-10 pr-20 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          autoComplete="off"
          data-customer-search
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSearchModalOpen}
            className="h-6 px-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            title="Pencarian Lanjutan"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Customer info display */}
      {!isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 truncate">
          {selectedCustomer ? (
            <span className="text-blue-600 font-medium">
              {(selectedCustomer as UIPelanggan).kode ?
                `${(selectedCustomer as UIPelanggan).kode} - ${(selectedCustomer as UIPelanggan).tipe}` +
                ((selectedCustomer as UIPelanggan).telepon ? ` | ${(selectedCustomer as UIPelanggan).telepon}` : '')
                :
                `ID: ${selectedCustomer.id}`
              }
            </span>
          ) : (
            <span>Tidak ada pelanggan terpilih</span>
          )}
        </div>
      )}

      {/* Autocomplete dropdown */}
      {isOpen && (query.length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Mencari pelanggan...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {customer.nama}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{customer.kode}</span>
                        <span className="capitalize">{customer.tipe}</span>
                        {customer.telepon && (
                          <span>{customer.telepon}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-2">
                      {customer.saldo_poin > 0 && (
                        <span>{customer.saldo_poin} pts</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                {suggestions.length >= 8 && 'Tampil 8 dari banyak hasil. '}
                Klik tombol cari untuk pencarian lanjutan.
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Tidak ada pelanggan ditemukan untuk "{query}"
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSearchModalOpen}
                  className="text-xs"
                >
                  Cari dengan pencarian lanjutan
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              Ketik minimal 2 karakter untuk mencari
            </div>
          )}
        </div>
      )}
    </div>
  )
}