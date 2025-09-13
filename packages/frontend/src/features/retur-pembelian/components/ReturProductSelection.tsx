import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Search, Package } from 'lucide-react'

interface ReturProductSelectionProps {
  produkItems: any[]
  selectedProduk: any
  onProdukChange: (produkId: number) => void
  validationErrors: Record<string, string>
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function ReturProductSelection({
  produkItems,
  selectedProduk,
  onProdukChange,
  validationErrors,
  searchTerm,
  onSearchChange
}: ReturProductSelectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const filteredProduk = produkItems.filter(produk =>
    produk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produk.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <Label htmlFor="produk">Produk</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 mb-2"
        />
      </div>
      <Select
        value={selectedProduk?.id?.toString() || ''}
        onValueChange={(value) => onProdukChange(parseInt(value))}
      >
        <SelectTrigger className={validationErrors.id_produk ? 'border-red-500' : ''}>
          <SelectValue placeholder="Pilih produk" />
        </SelectTrigger>
        <SelectContent>
          {filteredProduk.map((produk) => (
            <SelectItem key={produk.id} value={produk.id.toString()}>
              <div className="flex items-center gap-3">
                {produk.url_gambar && (
                  <img
                    src={produk.url_gambar}
                    alt={produk.nama}
                    className="h-6 w-6 rounded object-cover"
                  />
                )}
                <div>
                  <div>{produk.nama}</div>
                  <div className="text-xs text-gray-500">{produk.sku}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {validationErrors.id_produk && (
        <p className="text-sm text-red-600">{validationErrors.id_produk}</p>
      )}

      {/* Selected Produk Info */}
      {selectedProduk && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              {selectedProduk.url_gambar && (
                <img
                  src={selectedProduk.url_gambar}
                  alt={selectedProduk.nama}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-green-900">{selectedProduk.nama}</div>
                <div className="text-sm text-green-700">SKU: {selectedProduk.sku}</div>
                <div className="text-sm font-medium text-green-800">
                  Harga Beli: {formatCurrency(selectedProduk.harga_beli || 0)}
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Stok: {selectedProduk.stok || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}