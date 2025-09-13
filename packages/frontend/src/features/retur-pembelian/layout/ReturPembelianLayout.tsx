import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { ReturPembelianTable } from '../components/ReturPembelianTable'
import { ReturPembelianForm } from '../components/ReturPembelianForm'
import { ReturPembelianDetail } from '../components/ReturPembelianDetail'
import { useReturPembelianStore } from '../store/returPembelianStore'
import { ShoppingBag, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

interface ReturPembelianLayoutProps {
  children?: React.ReactNode
}

export function ReturPembelianLayout({ children }: ReturPembelianLayoutProps) {
  const {
    isFormOpen,
    isDetailOpen,
    setFormOpen,
    setDetailOpen,
    editingItem,
    selectedId,
    loading,
    items
  } = useReturPembelianStore()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retur Pembelian</h1>
            <p className="text-sm text-gray-600">Kelola retur barang dari pembelian supplier</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Retur Baru
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-4">
        {/* Table Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Daftar Retur Pembelian</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari retur..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ReturPembelianTable />
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <ReturPembelianForm
          isOpen={isFormOpen}
          onClose={() => {
            setFormOpen(false)
            useReturPembelianStore.getState().setEditingItem(null)
          }}
          editingItem={editingItem}
        />
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedId && (
        <ReturPembelianDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setDetailOpen(false)
            useReturPembelianStore.getState().setSelectedId(null)
          }}
          id={selectedId}
        />
      )}
    </div>
  )
}