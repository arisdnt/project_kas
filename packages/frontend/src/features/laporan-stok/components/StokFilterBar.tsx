import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/core/components/ui/select'
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download,
  Calendar,
  Package,
  Building,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { StokFilter } from '../types/stok'

interface StokFilterBarProps {
  filters: StokFilter
  onFiltersChange: (filters: StokFilter) => void
  onReset: () => void
  onExport: () => void
  loading?: boolean
}

export function StokFilterBar({ 
  filters, 
  onFiltersChange, 
  onReset, 
  onExport, 
  loading = false 
}: StokFilterBarProps) {
  const updateFilters = (updates: Partial<StokFilter>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const addCategoryFilter = (kategori: string) => {
    if (kategori && !filters.kategori.includes(kategori)) {
      updateFilters({ kategori: [...filters.kategori, kategori] })
    }
  }

  const removeCategoryFilter = (kategori: string) => {
    updateFilters({ kategori: filters.kategori.filter(k => k !== kategori) })
  }

  const addBrandFilter = (brand: string) => {
    if (brand && !filters.brand.includes(brand)) {
      updateFilters({ brand: [...filters.brand, brand] })
    }
  }

  const removeBrandFilter = (brand: string) => {
    updateFilters({ brand: filters.brand.filter(b => b !== brand) })
  }

  const toggleStatusFilter = (status: string) => {
    updateFilters({ 
      statusStok: filters.statusStok.includes(status) 
        ? filters.statusStok.filter(s => s !== status)
        : [...filters.statusStok, status]
    })
  }

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Laporan Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700">
              Pencarian Produk
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Cari nama produk atau SKU..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status Stok</Label>
            <div className="flex flex-wrap gap-2">
              {['tersedia', 'sedikit', 'habis', 'berlebih'].map((status) => (
                <Badge
                  key={status}
                  variant={filters.statusStok.includes(status) ? "default" : "outline"}
                  className={`cursor-pointer text-xs capitalize ${
                    filters.statusStok.includes(status) 
                      ? status === 'habis' ? 'bg-red-500 hover:bg-red-600' :
                        status === 'sedikit' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        status === 'berlebih' ? 'bg-blue-500 hover:bg-blue-600' :
                        'bg-green-500 hover:bg-green-600'
                      : ''
                  }`}
                  onClick={() => toggleStatusFilter(status)}
                >
                  {status === 'tersedia' ? 'Tersedia' :
                   status === 'sedikit' ? 'Stok Sedikit' :
                   status === 'habis' ? 'Habis' :
                   'Berlebih'}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Kategori</Label>
            <Select onValueChange={addCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Makanan">Makanan</SelectItem>
                <SelectItem value="Minuman">Minuman</SelectItem>
                <SelectItem value="Sembako">Sembako</SelectItem>
                <SelectItem value="Perawatan Tubuh">Perawatan Tubuh</SelectItem>
                <SelectItem value="Bumbu Dapur">Bumbu Dapur</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.kategori.map((kategori) => (
                <Badge
                  key={kategori}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => removeCategoryFilter(kategori)}
                >
                  {kategori} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Brand</Label>
            <Select onValueChange={addBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indomie">Indomie</SelectItem>
                <SelectItem value="Sosro">Sosro</SelectItem>
                <SelectItem value="Lifebuoy">Lifebuoy</SelectItem>
                <SelectItem value="Raja Lele">Raja Lele</SelectItem>
                <SelectItem value="Bimoli">Bimoli</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.brand.map((brand) => (
                <Badge
                  key={brand}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => removeBrandFilter(brand)}
                >
                  {brand} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.kategori.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Package className="h-3 w-3 mr-1" />
                {filters.kategori.length} kategori
              </Badge>
            )}
            {filters.brand.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Building className="h-3 w-3 mr-1" />
                {filters.brand.length} brand
              </Badge>
            )}
            {filters.statusStok.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {filters.statusStok.length} status
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onExport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}