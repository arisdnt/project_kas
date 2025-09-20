import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { TrendingUp, TrendingDown, AlertTriangle, Package, DollarSign, BarChart3 } from 'lucide-react'
import { StokSummary } from '../types/stok'

interface StokSummaryCardsProps {
  summary: StokSummary
}

export function StokSummaryCards({ summary }: StokSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Total Produk</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{summary.totalProduk}</div>
          <p className="text-xs text-gray-500 mt-1">Jenis produk aktif</p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Total Nilai Stok</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalNilaiStok)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Nilai total persediaan</p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Status Stok</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Habis</span>
              <Badge variant="destructive" className="text-xs">
                {summary.produkHabis}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sedikit</span>
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                {summary.produkSedikit}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Berlebih</span>
              <Badge variant="outline" className="text-xs">
                {summary.produkBerlebih}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Kategori Teratas</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {summary.kategoriTersering.slice(0, 2).map((kategori, index) => (
              <div key={kategori} className="flex items-center text-sm">
                <span className="text-gray-600 truncate">{kategori}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}