import React, { useEffect, useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent } from '@/core/components/ui/card'
import { useReturPembelianStore } from '../store/returPembelianStore'
import { ReturPembelianItem } from '../types/returPembelian'
import { ReturPembelianTableRow } from './ReturPembelianTableRow'
import { Package, Calendar, User } from 'lucide-react'

export function ReturPembelianTable() {
  const {
    items,
    loading,
    error,
    selectedId,
    setSelectedId,
    setDetailOpen,
    setFormOpen,
    setEditingItem,
    sortBy,
    sortDirection,
    page,
    limit,
    total
  } = useReturPembelianStore()

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  const handleView = (item: ReturPembelianItem) => {
    setSelectedId(item.id)
    setDetailOpen(true)
  }

  const handleEdit = (item: ReturPembelianItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus retur ini?')) {
      // TODO: Implement delete API call
      console.log('Delete retur:', id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-red-600 mb-2">❌</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Belum ada data retur pembelian</p>
          <p className="text-xs text-gray-500 mt-1">Klik "Retur Baru" untuk menambahkan retur</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length && items.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <ReturPembelianTableRow
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={handleSelectItem}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-700">
          Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} data
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => useReturPembelianStore.getState().setPage(page - 1)}
          >
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => useReturPembelianStore.getState().setPage(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === Math.ceil(total / limit)}
            onClick={() => useReturPembelianStore.getState().setPage(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  )
}