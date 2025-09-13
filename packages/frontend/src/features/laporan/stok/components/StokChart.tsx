import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Package, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import { StokItem } from '../types/stok'

interface StokChartProps {
  data: StokItem[]
}

export function StokChart({ data }: StokChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value)
  }

  const dataByCategory = data.reduce((acc, item) => {
    if (!acc[item.kategori]) {
      acc[item.kategori] = {
        kategori: item.kategori,
        totalStok: 0,
        totalNilai: 0,
        produkCount: 0
      }
    }
    acc[item.kategori].totalStok += item.jumlahStok
    acc[item.kategori].totalNilai += item.nilaiStok
    acc[item.kategori].produkCount += 1
    return acc
  }, {} as Record<string, { kategori: string; totalStok: number; totalNilai: number; produkCount: number }>)

  const categoryData = Object.values(dataByCategory).sort((a, b) => b.totalNilai - a.totalNilai)

  const statusData = [
    { name: 'Tersedia', value: data.filter(item => item.statusStok === 'tersedia').length, color: '#10b981' },
    { name: 'Stok Sedikit', value: data.filter(item => item.statusStok === 'sedikit').length, color: '#f59e0b' },
    { name: 'Habis', value: data.filter(item => item.statusStok === 'habis').length, color: '#ef4444' },
    { name: 'Berlebih', value: data.filter(item => item.statusStok === 'berlebih').length, color: '#3b82f6' }
  ].filter(item => item.value > 0)

  const topProducts = [...data]
    .sort((a, b) => b.nilaiStok - a.nilaiStok)
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Nilai Stok per Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="kategori" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Total Nilai']}
                labelFormatter={(label) => `Kategori: ${label}`}
              />
              <Bar dataKey="totalNilai" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Distribusi Status Stok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Produk dengan Nilai Stok Tertinggi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{product.namaProduk}</div>
                    <div className="text-xs text-gray-500">{product.kategori}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 text-sm">
                    {formatCurrency(product.nilaiStok)}
                  </div>
                  <div className="text-xs text-gray-500">{product.jumlahStok} {product.satuan}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Produk Memerlukan Perhatian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data
              .filter(item => item.statusStok === 'habis' || item.statusStok === 'sedikit')
              .map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={product.statusStok === 'habis' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {product.statusStok === 'habis' ? 'Habis' : 'Stok Sedikit'}
                    </Badge>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{product.namaProduk}</div>
                      <div className="text-xs text-gray-500">{product.supplier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600 text-sm">
                      {product.jumlahStok} {product.satuan}
                    </div>
                    <div className="text-xs text-gray-500">
                      Update: {new Date(product.terakhirDiperbarui).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            {data.filter(item => item.statusStok === 'habis' || item.statusStok === 'sedikit').length === 0 && (
              <div className="text-center py-4">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Semua produk memiliki stok yang memadai</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}