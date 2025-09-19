import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu"
import { LaporanHarianDrawer, LaporanHarianDrawerContent, LaporanHarianDrawerHeader, LaporanHarianDrawerTitle } from '../components/LaporanHarianDrawer'
import { LaporanHarianForm, LaporanHarianFormData } from '../components/LaporanHarianForm'
import { LaporanHarianAccessPlaceholder } from '../components/LaporanHarianAccessPlaceholder'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import {
  Plus,
  Edit2,
  Eye,
  Trash2,
  MoreHorizontal,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  FileText,
  Download,
  Printer,
  Clock,
  Search
} from 'lucide-react'
import { LaporanHarian, LaporanHarianStats, LaporanHarianFilters } from '../types'

// Sample data generator
const generateSampleLaporan = (count: number): LaporanHarian[] => {
  const laporan: LaporanHarian[] = []
  const today = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const baseAmount = Math.random() * 5000000 + 1000000
    const profit = baseAmount * (0.2 + Math.random() * 0.3)

    laporan.push({
      id: i + 1,
      tanggal: date.toISOString().split('T')[0],
      total_transaksi: Math.floor(Math.random() * 100 + 20),
      total_penjualan: baseAmount,
      total_profit: profit,
      total_pelanggan: Math.floor(Math.random() * 50 + 10),
      produk_terlaris: ['Kopi Susu', 'Roti Bakar', 'Es Teh', 'Nasi Goreng', 'Ayam Geprek'][Math.floor(Math.random() * 5)],
      jam_tersibuk: ['12:00-13:00', '18:00-19:00', '19:00-20:00', '13:00-14:00'][Math.floor(Math.random() * 4)],
      metode_pembayaran_populer: ['Cash', 'QRIS', 'Debit', 'E-Wallet'][Math.floor(Math.random() * 4)],
      rata_rata_transaksi: baseAmount / (Math.random() * 100 + 20),
      total_diskon: baseAmount * 0.05,
      total_pajak: baseAmount * 0.1,
      total_retur: Math.random() > 0.7 ? baseAmount * 0.02 : 0,
      stok_rendah: Math.floor(Math.random() * 5),
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    })
  }

  return laporan
}

export function LaporanHarianPage() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [laporan] = useState<LaporanHarian[]>(() => generateSampleLaporan(30))
  const [filteredLaporan, setFilteredLaporan] = useState<LaporanHarian[]>([])
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanHarian | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view')
  const [editing, setEditing] = useState<LaporanHarianFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<LaporanHarianFilters>({
    status: 'ALL',
    range: '30d',
    query: ''
  })

  // Calculate stats
  const stats = useMemo((): LaporanHarianStats => {
    const today = new Date().toISOString().split('T')[0]
    const todayLaporan = laporan.find(l => l.tanggal === today)

    return {
      total_laporan: laporan.length,
      rata_rata_penjualan: laporan.reduce((sum, l) => sum + l.total_penjualan, 0) / laporan.length,
      pertumbuhan_hari_ini: todayLaporan ?
        (todayLaporan.total_penjualan / (laporan[1]?.total_penjualan || 1) - 1) * 100 : 0,
      transaksi_hari_ini: todayLaporan?.total_transaksi || 0
    }
  }, [laporan])

  // Filter laporan
  useEffect(() => {
    let filtered = [...laporan]

    // Date range filter
    const today = new Date()
    let fromDate: Date | null = null

    switch (filters.range) {
      case 'today':
        fromDate = new Date(today)
        break
      case '7d':
        fromDate = new Date(today)
        fromDate.setDate(today.getDate() - 6)
        break
      case '30d':
        fromDate = new Date(today)
        fromDate.setDate(today.getDate() - 29)
        break
    }

    if (fromDate) {
      const fromStr = fromDate.toISOString().split('T')[0]
      const toStr = today.toISOString().split('T')[0]
      filtered = filtered.filter(l => l.tanggal >= fromStr && l.tanggal <= toStr)
    }

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(l =>
        l.tanggal.includes(query) ||
        l.produk_terlaris.toLowerCase().includes(query) ||
        l.jam_tersibuk.includes(query) ||
        l.metode_pembayaran_populer.toLowerCase().includes(query)
      )
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

    setFilteredLaporan(filtered)
  }, [laporan, filters, searchTerm])

  const openCreate = () => {
    setEditing({
      tanggal: new Date().toISOString().split('T')[0],
      catatan: ''
    })
    setSelectedLaporan(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (laporan: LaporanHarian) => {
    setSelectedLaporan(laporan)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (laporan: LaporanHarian) => {
    setSelectedLaporan(laporan)
    setEditing({
      tanggal: laporan.tanggal,
      catatan: ''
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: LaporanHarianFormData) => {
    setSaving(true)
    try {
      if (selectedLaporan) {
        // Update existing laporan
        console.log('Updating laporan:', selectedLaporan.id, data)
        toast({ title: 'Laporan harian diperbarui' })
      } else {
        // Create new laporan
        console.log('Creating laporan:', data)
        toast({ title: 'Laporan harian berhasil digenerate' })
      }
      setDrawerOpen(false)
      setSelectedLaporan(null)
      setEditing(null)
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return
    console.log('Deleting laporan:', id)
    toast({ title: 'Laporan harian dihapus' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Harian</h1>
          <p className="text-gray-600 mt-1">Ringkasan aktivitas harian, transaksi, dan performa toko</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Laporan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Laporan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_laporan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata Penjualan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.rata_rata_penjualan).replace('Rp', 'Rp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pertumbuhan Hari Ini</p>
                <p className={`text-2xl font-bold ${stats.pertumbuhan_hari_ini >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.pertumbuhan_hari_ini > 0 ? '+' : ''}{stats.pertumbuhan_hari_ini.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.transaksi_hari_ini}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari tanggal, produk, jam tersibuk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.range}
            onValueChange={(value: any) => setFilters(prev => ({ ...prev, range: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="7d">7 Hari Terakhir</SelectItem>
              <SelectItem value="30d">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Laporan List */}
      <div className="grid gap-4">
        {filteredLaporan.length === 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Laporan</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tidak ada laporan yang sesuai dengan pencarian.' : 'Belum ada laporan harian yang dibuat.'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredLaporan.map((laporanItem) => (
            <Card key={laporanItem.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(laporanItem.tanggal)}
                        </h3>
                        <p className="text-sm text-gray-500">Laporan Harian</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Transaksi</p>
                        <p className="font-medium">{laporanItem.total_transaksi.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Penjualan</p>
                        <p className="font-medium text-green-600">{formatCurrency(laporanItem.total_penjualan)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Profit</p>
                        <p className="font-medium text-blue-600">{formatCurrency(laporanItem.total_profit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pelanggan</p>
                        <p className="font-medium">{laporanItem.total_pelanggan}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Jam tersibuk: {laporanItem.jam_tersibuk}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Terlaris: {laporanItem.produk_terlaris}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {laporanItem.metode_pembayaran_populer}
                      </Badge>
                      {laporanItem.stok_rendah > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {laporanItem.stok_rendah} stok rendah
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                          <span className="sr-only">Buka menu aksi</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onView(laporanItem)}
                          className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(laporanItem)}
                          className="cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:bg-amber-50 focus:text-amber-700"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => console.log('Download laporan:', laporanItem.id)}
                          className="cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50 focus:bg-green-50 focus:text-green-700"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => console.log('Print laporan:', laporanItem.id)}
                          className="cursor-pointer text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus:bg-purple-50 focus:text-purple-700"
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(laporanItem.id)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Drawer */}
      <LaporanHarianDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <LaporanHarianDrawerContent className="!w-[60vw] !max-w-none">
          <LaporanHarianDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'create' ? 'bg-green-100 text-green-600' :
                  drawerMode === 'edit' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {drawerMode === 'create' ? (
                    <Plus className="h-5 w-5" />
                  ) : drawerMode === 'edit' ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <LaporanHarianDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Generate Laporan Harian' :
                   drawerMode === 'edit' ? 'Edit Laporan Harian' : 'Detail Laporan Harian'}
                </LaporanHarianDrawerTitle>
              </div>
            </div>
          </LaporanHarianDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selectedLaporan ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Laporan Tanggal</p>
                      <p className="text-lg font-semibold">{formatDate(selectedLaporan.tanggal)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Total Transaksi</p>
                        <p className="text-gray-700 font-medium">{selectedLaporan.total_transaksi.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Total Penjualan</p>
                        <p className="text-gray-700 font-medium">{formatCurrency(selectedLaporan.total_penjualan)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Total Profit</p>
                        <p className="text-gray-700 font-medium">{formatCurrency(selectedLaporan.total_profit)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Total Pelanggan</p>
                        <p className="text-gray-700 font-medium">{selectedLaporan.total_pelanggan.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                      <BarChart3 className="h-4 w-4" />
                      Analisis Performa
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-blue-900">Produk Terlaris</p>
                            <p className="text-blue-700">{selectedLaporan.produk_terlaris}</p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">Jam Tersibuk</p>
                            <p className="text-blue-700">{selectedLaporan.jam_tersibuk}</p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">Pembayaran Populer</p>
                            <p className="text-blue-700">{selectedLaporan.metode_pembayaran_populer}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-900">Rata-rata Transaksi</p>
                          <p className="text-green-700">{formatCurrency(selectedLaporan.rata_rata_transaksi)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-900">Total Diskon</p>
                          <p className="text-green-700">{formatCurrency(selectedLaporan.total_diskon)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-900">Total Pajak</p>
                          <p className="text-green-700">{formatCurrency(selectedLaporan.total_pajak)}</p>
                        </div>
                      </div>
                    </div>

                    {(selectedLaporan.total_retur > 0 || selectedLaporan.stok_rendah > 0) && (
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {selectedLaporan.total_retur > 0 && (
                            <div>
                              <p className="font-medium text-amber-900">Total Retur</p>
                              <p className="text-amber-700">{formatCurrency(selectedLaporan.total_retur)}</p>
                            </div>
                          )}
                          {selectedLaporan.stok_rendah > 0 && (
                            <div>
                              <p className="font-medium text-amber-900">Produk Stok Rendah</p>
                              <p className="text-amber-700">{selectedLaporan.stok_rendah} item</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => console.log('Download laporan:', selectedLaporan.id)}
                    variant="outline"
                    className="px-5 py-2 h-10 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => onEdit(selectedLaporan)}
                    className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Laporan
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <LaporanHarianAccessPlaceholder />
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setDrawerOpen(false)}
                      className="px-6 py-2 h-10 border-gray-300 hover:bg-gray-50"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              ) : (
                <LaporanHarianForm
                  value={editing}
                  editingLaporan={selectedLaporan}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelectedLaporan(null)
                    setEditing(null)
                  }}
                  isLoading={saving}
                  isCreate={drawerMode === 'create'}
                />
              )
            )}
          </div>
        </LaporanHarianDrawerContent>
      </LaporanHarianDrawer>
    </div>
  )
}