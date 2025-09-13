import React from 'react'
import { Button } from "@/core/components/ui/button"
import { Plus } from 'lucide-react'

interface Props {
  totalCount: number
  filteredCount: number
}

export function RefundHeader({ totalCount, filteredCount }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Retur Penjualan</h1>
      <p className="text-sm text-gray-600">Kelola pengembalian barang dan dana dari transaksi penjualan</p>
    </div>
  )
}

export function RefundTableHeader({ totalCount, filteredCount }: Props) {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">
        Daftar Retur ({filteredCount} dari {totalCount})
      </h3>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Retur Baru
      </Button>
    </div>
  )
}