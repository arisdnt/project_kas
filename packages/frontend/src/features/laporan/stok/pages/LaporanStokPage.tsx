import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { 
  Download, 
  Filter, 
  RefreshCw,
  Package,
  TrendingUp,
  BarChart3,
  Eye,
  FileText
} from 'lucide-react'
import { StokSummaryCards } from '../components/StokSummaryCards'
import { StokFilterBar } from '../components/StokFilterBar'
import { StokTable } from '../components/StokTable'
import { StokChart } from '../components/StokChart'
import { StokItem, StokSummary, StokFilter, SortField, SortDirection } from '../types/stok'
import { sampleStokData, sampleStokSummary } from '../data/sampleStok'

export function LaporanStokPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [sortField, setSortField] = useState<SortField>('namaProduk')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  const [filters, setFilters] = useState<StokFilter>({
    kategori: [],
    brand: [],
    supplier: [],
    statusStok: [],
    lokasi: [],
    dateRange: {
      start: null,
      end: null
    },
    searchQuery: ''
  })

  const summary: StokSummary = sampleStokSummary

  const filteredData = useMemo(() => {
    let filtered = [...sampleStokData]

    if (filters.searchQuery) {
      filtered = filtered.filter(item =>
        item.namaProduk.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }

    if (filters.kategori.length > 0) {
      filtered = filtered.filter(item => filters.kategori.includes(item.kategori))
    }

    if (filters.brand.length > 0) {
      filtered = filtered.filter(item => filters.brand.includes(item.brand))
    }

    if (filters.statusStok.length > 0) {
      filtered = filtered.filter(item => filters.statusStok.includes(item.statusStok))
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [filters, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleFiltersChange = (newFilters: StokFilter) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      kategori: [],
      brand: [],
      supplier: [],
      statusStok: [],
      lokasi: [],
      dateRange: {
        start: null,
        end: null
      },
      searchQuery: ''
    })
  }

  const handleExport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleViewDetail = (item: StokItem) => {
    console.log('View detail:', item)
  }

  const handleEdit = (item: StokItem) => {
    console.log('Edit item:', item)
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">Laporan Stok</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor dan analisis persediaan produk</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Laporan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full space-y-6">
          {/* Summary Cards */}
          <StokSummaryCards summary={summary} />

          {/* Filter Section */}
          <StokFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            onExport={handleExport}
            loading={loading}
          />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="overview" className="text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="table" className="text-sm">
                  <Package className="h-4 w-4 mr-2" />
                  Daftar Stok
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="w-full">
              <StokChart data={filteredData} />
            </TabsContent>

            <TabsContent value="table" className="w-full">
              <StokTable
                data={filteredData}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
              />
            </TabsContent>
          </Tabs>

          {/* Quick Stats Footer */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistik Cepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Total Nilai Stok</span>
                  <span className="font-semibold text-blue-600">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(summary.totalNilaiStok)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Produk Tersedia</span>
                  <span className="font-semibold text-green-600">
                    {summary.totalProduk - summary.produkHabis}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700">Perlu Restock</span>
                  <span className="font-semibold text-yellow-600">
                    {summary.produkHabis + summary.produkSedikit}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Rata-rata Nilai</span>
                  <span className="font-semibold text-purple-600">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(summary.totalNilaiStok / summary.totalProduk)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}