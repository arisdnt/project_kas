import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/core/components/ui/table'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Package, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import { StokItem, SortField, SortDirection } from '../types/stok'

interface StokTableProps {
  data: StokItem[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onViewDetail: (item: StokItem) => void
  onEdit: (item: StokItem) => void
}

export function StokTable({ 
  data, 
  sortField, 
  sortDirection, 
  onSort, 
  onViewDetail, 
  onEdit 
}: StokTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      tersedia: { variant: 'default' as const, label: 'Tersedia', className: 'bg-green-100 text-green-800' },
      sedikit: { variant: 'secondary' as const, label: 'Stok Sedikit', className: 'bg-yellow-100 text-yellow-800' },
      habis: { variant: 'destructive' as const, label: 'Habis', className: '' },
      berlebih: { variant: 'outline' as const, label: 'Berlebih', className: '' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.tersedia
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleSort = (field: SortField) => {
    onSort(field)
  }

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Daftar Stok Produk
          <Badge variant="outline" className="ml-auto">
            {data.length} produk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('namaProduk')}
                >
                  <div className="flex items-center gap-1">
                    Produk
                    {getSortIcon('namaProduk')}
                  </div>
                </TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('jumlahStok')}
                >
                  <div className="flex items-center gap-1">
                    Stok
                    {getSortIcon('jumlahStok')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('nilaiStok')}
                >
                  <div className="flex items-center gap-1">
                    Nilai Stok
                    {getSortIcon('nilaiStok')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('hargaJual')}
                >
                  <div className="flex items-center gap-1">
                    Harga Jual
                    {getSortIcon('hargaJual')}
                  </div>
                </TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('terakhirDiperbarui')}
                >
                  <div className="flex items-center gap-1">
                    Terakhir Update
                    {getSortIcon('terakhirDiperbarui')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{item.namaProduk}</span>
                      <span className="text-sm text-gray-500">SKU: {item.sku}</span>
                      <span className="text-xs text-gray-400">{item.brand}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.kategori}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        item.jumlahStok === 0 ? 'text-red-600' :
                        item.jumlahStok <= 10 ? 'text-yellow-600' :
                        'text-gray-900'
                      }`}>
                        {item.jumlahStok} {item.satuan}
                      </span>
                      {item.jumlahStok <= 10 && item.jumlahStok > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {item.jumlahStok === 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.nilaiStok)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.hargaJual)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{item.lokasi}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.statusStok)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(item.terakhirDiperbarui)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada data stok yang ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba ubah filter pencarian Anda</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}