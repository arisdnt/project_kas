import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Receipt, DollarSign, Percent, TrendingUp } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/core/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import {
  PajakMatauangDrawer,
  PajakMatauangDrawerContent,
  PajakMatauangDrawerHeader,
  PajakMatauangDrawerTitle,
  PajakMatauangDrawerDescription,
} from '../components/PajakMatauangDrawer'
import { PajakMatauangForm } from '../components/PajakMatauangForm'
import { PajakMatauangAccessPlaceholder } from '../components/PajakMatauangAccessPlaceholder'
import {
  PajakSetting,
  MatauangSetting,
  PajakMatauangStats,
  PajakMatauangFilters,
  PajakMatauangFilterType,
  PajakMatauangFilterStatus,
  CreatePajakRequest,
  CreateMatauangRequest
} from '../types'

export function PajakMatauangPage() {
  const [selectedTab, setSelectedTab] = useState<'pajak' | 'mata_uang'>('pajak')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedItem, setSelectedItem] = useState<PajakSetting | MatauangSetting | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<PajakMatauangFilters>({
    type: 'ALL',
    status: 'ALL',
    query: ''
  })

  // Sample data - replace with actual API calls
  const [pajakData] = useState<PajakSetting[]>([
    {
      id: 1,
      nama: 'PPN',
      persentase: 11,
      deskripsi: 'Pajak Pertambahan Nilai untuk semua produk',
      aktif: true,
      default: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      nama: 'PPh 22',
      persentase: 0.45,
      deskripsi: 'Pajak Penghasilan untuk impor barang',
      aktif: true,
      default: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      nama: 'PPN Makanan',
      persentase: 11,
      deskripsi: 'PPN khusus untuk kategori makanan dan minuman',
      aktif: false,
      default: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ])

  const [matauangData] = useState<MatauangSetting[]>([
    {
      id: 1,
      kode: 'IDR',
      nama: 'Rupiah Indonesia',
      simbol: 'Rp',
      format_tampilan: 'before',
      pemisah_desimal: ',',
      pemisah_ribuan: '.',
      jumlah_desimal: 0,
      aktif: true,
      default: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      kode: 'USD',
      nama: 'Dollar Amerika',
      simbol: '$',
      format_tampilan: 'before',
      pemisah_desimal: '.',
      pemisah_ribuan: ',',
      jumlah_desimal: 2,
      aktif: true,
      default: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      kode: 'EUR',
      nama: 'Euro',
      simbol: '€',
      format_tampilan: 'after',
      pemisah_desimal: ',',
      pemisah_ribuan: '.',
      jumlah_desimal: 2,
      aktif: false,
      default: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ])

  const stats: PajakMatauangStats = {
    total_pajak: pajakData.length,
    pajak_aktif: pajakData.filter(p => p.aktif).length,
    total_mata_uang: matauangData.length,
    mata_uang_aktif: matauangData.filter(m => m.aktif).length
  }

  // Check user access - replace with actual permission check
  const userLevel = 4 // Replace with actual user level from auth store
  const hasAccess = userLevel >= 3

  const filteredPajakData = useMemo(() => {
    return pajakData.filter(pajak => {
      const matchesQuery = filters.query === '' ||
        pajak.nama.toLowerCase().includes(filters.query.toLowerCase()) ||
        pajak.deskripsi?.toLowerCase().includes(filters.query.toLowerCase())

      const matchesStatus = filters.status === 'ALL' ||
        (filters.status === 'AKTIF' && pajak.aktif) ||
        (filters.status === 'NONAKTIF' && !pajak.aktif)

      return matchesQuery && matchesStatus
    })
  }, [pajakData, filters])

  const filteredMatauangData = useMemo(() => {
    return matauangData.filter(matauang => {
      const matchesQuery = filters.query === '' ||
        matauang.nama.toLowerCase().includes(filters.query.toLowerCase()) ||
        matauang.kode.toLowerCase().includes(filters.query.toLowerCase())

      const matchesStatus = filters.status === 'ALL' ||
        (filters.status === 'AKTIF' && matauang.aktif) ||
        (filters.status === 'NONAKTIF' && !matauang.aktif)

      return matchesQuery && matchesStatus
    })
  }, [matauangData, filters])

  const handleCreate = () => {
    setSelectedItem(null)
    setDrawerMode('create')
    setIsDrawerOpen(true)
  }

  const handleView = (item: PajakSetting | MatauangSetting) => {
    setSelectedItem(item)
    setDrawerMode('view')
    setIsDrawerOpen(true)
  }

  const handleEdit = (item: PajakSetting | MatauangSetting) => {
    setSelectedItem(item)
    setDrawerMode('edit')
    setIsDrawerOpen(true)
  }

  const handleDelete = async (item: PajakSetting | MatauangSetting) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedTab === 'pajak' ? 'pajak' : 'mata uang'} "${selectedTab === 'pajak' ? (item as PajakSetting).nama : (item as MatauangSetting).nama}"?`)) {
      try {
        setIsLoading(true)
        // API call to delete item
        console.log('Deleting item:', item)
        // Refresh data after deletion
      } catch (error) {
        console.error('Error deleting item:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleStatus = async (item: PajakSetting | MatauangSetting) => {
    try {
      setIsLoading(true)
      // API call to toggle status
      console.log('Toggling status for item:', item)
      // Refresh data after update
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: CreatePajakRequest | CreateMatauangRequest) => {
    try {
      setIsLoading(true)
      if (drawerMode === 'create') {
        // API call to create new item
        console.log('Creating new item:', data)
      } else {
        // API call to update item
        console.log('Updating item:', data)
      }
      setIsDrawerOpen(false)
      // Refresh data after operation
    } catch (error) {
      console.error('Error saving item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: MatauangSetting) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: currency.jumlah_desimal,
      maximumFractionDigits: currency.jumlah_desimal
    }).format(amount)

    const withCustomSeparators = formatted
      .replace(/,/g, '|||TEMP|||')
      .replace(/\./g, currency.pemisah_ribuan)
      .replace(/\|\|\|TEMP\|\|\|/g, currency.pemisah_desimal)

    return currency.format_tampilan === 'before'
      ? `${currency.simbol}${withCustomSeparators}`
      : `${withCustomSeparators} ${currency.simbol}`
  }

  if (!hasAccess) {
    return <PajakMatauangAccessPlaceholder />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pajak & Mata Uang</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan tarif pajak dan mata uang untuk transaksi
          </p>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tambah {selectedTab === 'pajak' ? 'Pajak' : 'Mata Uang'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pajak</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pajak}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pajak_aktif} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mata Uang</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_mata_uang}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mata_uang_aktif} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Pajak</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pajakData.length > 0
                ? (pajakData.reduce((sum, p) => sum + p.persentase, 0) / pajakData.length).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              dari {stats.total_pajak} pajak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((stats.pajak_aktif + stats.mata_uang_aktif) / (stats.total_pajak + stats.total_mata_uang)) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              pengaturan aktif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'pajak' | 'mata_uang')}>
        <div className="flex flex-col sm:flex-row gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="pajak" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Pajak
            </TabsTrigger>
            <TabsTrigger value="mata_uang" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Mata Uang
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Cari ${selectedTab === 'pajak' ? 'pajak' : 'mata uang'}...`}
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as PajakMatauangFilterStatus }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="NONAKTIF">Non-aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="pajak" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pajak</TableHead>
                  <TableHead>Persentase</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[50px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPajakData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {filters.query || filters.status !== 'ALL'
                          ? 'Tidak ada pajak yang sesuai dengan filter'
                          : 'Belum ada data pajak'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPajakData.map((pajak) => (
                    <TableRow key={pajak.id}>
                      <TableCell className="font-medium">{pajak.nama}</TableCell>
                      <TableCell>{pajak.persentase}%</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {pajak.deskripsi || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pajak.aktif ? 'default' : 'secondary'}>
                          {pajak.aktif ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pajak.default && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(pajak)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(pajak)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(pajak)}>
                              {pajak.aktif ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Non-aktifkan
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(pajak)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="mata_uang" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[50px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatauangData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {filters.query || filters.status !== 'ALL'
                          ? 'Tidak ada mata uang yang sesuai dengan filter'
                          : 'Belum ada data mata uang'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMatauangData.map((matauang) => (
                    <TableRow key={matauang.id}>
                      <TableCell className="font-mono font-medium">{matauang.kode}</TableCell>
                      <TableCell>{matauang.nama}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Simbol: {matauang.format_tampilan === 'before' ? 'Depan' : 'Belakang'}</div>
                          <div className="text-muted-foreground">
                            Desimal: {matauang.jumlah_desimal}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(123456.78, matauang)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={matauang.aktif ? 'default' : 'secondary'}>
                          {matauang.aktif ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {matauang.default && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(matauang)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(matauang)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(matauang)}>
                              {matauang.aktif ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Non-aktifkan
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(matauang)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawer */}
      <PajakMatauangDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <PajakMatauangDrawerContent size="sixty">
          <PajakMatauangDrawerHeader>
            <PajakMatauangDrawerTitle>
              {drawerMode === 'create'
                ? `Tambah ${selectedTab === 'pajak' ? 'Pajak' : 'Mata Uang'}`
                : drawerMode === 'edit'
                ? `Edit ${selectedTab === 'pajak' ? 'Pajak' : 'Mata Uang'}`
                : `Detail ${selectedTab === 'pajak' ? 'Pajak' : 'Mata Uang'}`
              }
            </PajakMatauangDrawerTitle>
            <PajakMatauangDrawerDescription>
              {selectedTab === 'pajak'
                ? 'Kelola pengaturan tarif pajak untuk transaksi penjualan'
                : 'Kelola pengaturan mata uang dan format tampilan'
              }
            </PajakMatauangDrawerDescription>
          </PajakMatauangDrawerHeader>

          <PajakMatauangForm
            isOpen={isDrawerOpen}
            mode={drawerMode}
            type={selectedTab}
            initialData={selectedItem}
            onSubmit={handleSubmit}
            onCancel={() => setIsDrawerOpen(false)}
            isLoading={isLoading}
          />
        </PajakMatauangDrawerContent>
      </PajakMatauangDrawer>
    </div>
  )
}