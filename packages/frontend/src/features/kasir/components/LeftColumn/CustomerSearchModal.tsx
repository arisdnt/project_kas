import { useState, useEffect, useRef } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Badge } from '@/core/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Search, User, Phone, Mail, MapPin, X } from 'lucide-react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { UIPelanggan } from '@/features/pelanggan/types/pelanggan'

interface CustomerSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerSearchModal({ open, onOpenChange }: CustomerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UIPelanggan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { items, search } = usePelangganStore()
  const { setPelanggan, pelanggan } = useKasirStore()

  // Auto focus when modal opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open])

  // Search customers with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true)
      try {
        await search(searchQuery)
        // Filter results from store
        const filtered = items.filter(customer =>
          customer.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.telepon?.includes(searchQuery) ||
          customer.id.includes(searchQuery)
        )
        setSearchResults(filtered.slice(0, 20)) // Limit to 20 results
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error searching customers:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, search, items])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handleSelectCustomer(searchResults[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, searchResults, onOpenChange])

  const handleSelectCustomer = async (customer: UIPelanggan) => {
    try {
      await setPelanggan({
        id: customer.id,
        nama: customer.nama
      })

      // Close modal and reset
      setSearchQuery('')
      setSearchResults([])
      setSelectedIndex(-1)
      onOpenChange(false)
    } catch (error) {
      console.error('Error selecting customer:', error)
    }
  }

  const handleClearCustomer = async () => {
    try {
      await setPelanggan(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error clearing customer:', error)
    }
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-purple-100 text-purple-700'
      case 'member': return 'bg-blue-100 text-blue-700'
      case 'wholesale': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCustomerType = (type: string) => {
    switch (type) {
      case 'vip': return 'VIP'
      case 'member': return 'Member'
      case 'wholesale': return 'Wholesale'
      default: return 'Reguler'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pilih Pelanggan
          </DialogTitle>
          <DialogDescription>
            Cari dan pilih pelanggan untuk transaksi ini. Ketik nama, email, atau nomor telepon.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Current Selected Customer */}
          {pelanggan && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Pelanggan saat ini: {pelanggan.nama}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCustomer}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan... (nama, email, telepon)"
              className="pl-10"
              autoComplete="off"
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-gray-600">Mencari pelanggan...</span>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <div className="text-sm">Pelanggan tidak ditemukan</div>
                <div className="text-xs text-gray-400 mt-1">
                  Coba dengan kata kunci yang berbeda
                </div>
              </div>
            ) : searchQuery ? (
              <div className="space-y-2">
                {searchResults.map((customer, index) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm ${
                      index === selectedIndex
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">
                            {customer.nama}
                          </span>
                          <Badge className={`text-xs ${getCustomerTypeColor(customer.tipe)}`}>
                            {formatCustomerType(customer.tipe)}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          {customer.telepon && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{customer.telepon}</span>
                            </div>
                          )}
                          {customer.alamat && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{customer.alamat}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-xs text-gray-500">ID: {customer.id.slice(-8)}</div>
                        {customer.poin_saldo && customer.poin_saldo > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Poin: {customer.poin_saldo.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Ketik untuk mencari pelanggan</div>
                <div className="text-xs mt-1">
                  Minimal 2 karakter untuk memulai pencarian
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Tutup
            </Button>
            {!pelanggan && (
              <Button
                onClick={handleClearCustomer}
                className="flex-1"
                variant="secondary"
              >
                Gunakan Pelanggan Umum
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}