import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent } from '@/core/components/ui/card'
import { UIKategori, ProductByCategory } from '@/features/kategori/types/kategori'
import { useKategoriStore } from '@/features/kategori/store/kategoriStore'
import { Search, Package, Barcode, DollarSign, Archive } from 'lucide-react'
function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

type Props = {
  kategori: UIKategori | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductsByCategoryModal({ kategori, open, onOpenChange }: Props) {
  const { getProductsByCategory } = useKategoriStore()
  const [products, setProducts] = useState<ProductByCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const loadProducts = async (pageNum: number = 1, searchQuery: string = '') => {
    if (!kategori) return

    setLoading(true)
    try {
      const result = await getProductsByCategory(kategori.id, {
        page: pageNum,
        limit: 20,
        search: searchQuery
      })

      if (pageNum === 1) {
        setProducts(result.data)
      } else {
        setProducts(prev => [...prev, ...result.data])
      }

      setPage(pageNum)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
    } catch (error: any) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && kategori) {
      setProducts([])
      setPage(1)
      setSearch('')
      loadProducts(1, '')
    }
  }, [open, kategori])

  const handleSearch = (value: string) => {
    setSearch(value)
    setProducts([])
    setPage(1)
    loadProducts(1, value)
  }

  const loadMore = () => {
    if (page < totalPages && !loading) {
      loadProducts(page + 1, search)
    }
  }

  if (!kategori) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produk dalam Kategori: {kategori.nama}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Summary */}
          <div className="text-sm text-gray-600">
            {loading && page === 1 ? (
              <span>Memuat produk...</span>
            ) : (
              <span>
                Menampilkan {products.length} dari {total} produk
              </span>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto">
            {products.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Tidak ada produk dalam kategori ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Product Image */}
                        {product.gambar_url ? (
                          <img
                            src={product.gambar_url}
                            alt={product.nama}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        {/* Product Info */}
                        <div>
                          <h4 className="font-medium text-sm line-clamp-2">{product.nama}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Barcode className="h-3 w-3 mr-1" />
                              {product.kode}
                            </Badge>
                          </div>
                        </div>

                        {/* Price & Stock */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Harga Jual</span>
                            <span className="font-medium text-sm text-green-600">
                              {formatCurrency(product.harga_jual)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Stok</span>
                            <div className="flex items-center gap-1">
                              <Archive className="h-3 w-3 text-gray-400" />
                              <span className="text-sm font-medium">
                                {product.total_stok} {product.satuan}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Brand & Supplier */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Brand: {product.brand_nama}</div>
                          <div>Supplier: {product.supplier_nama}</div>
                        </div>

                        {/* Status */}
                        <div className="flex gap-2">
                          <Badge variant={product.is_aktif ? 'default' : 'secondary'} className="text-xs">
                            {product.is_aktif ? 'Aktif' : 'Non-aktif'}
                          </Badge>
                          {product.is_dijual_online && (
                            <Badge variant="outline" className="text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Loading skeleton for pagination */}
            {loading && page > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="w-full h-32 bg-gray-200 rounded-md mb-3" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {page < totalPages && !loading && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="min-w-32"
                >
                  Muat Lebih Banyak
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}