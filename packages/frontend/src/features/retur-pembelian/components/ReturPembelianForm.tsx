import React, { useEffect, useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Card, CardContent } from '@/core/components/ui/card'
import { useReturPembelianStore } from '../store/returPembelianStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { usePembelianStore } from '@/features/pembelian/store/pembelianStore'
import { useSupplierStore } from '@/features/supplier/store/supplierStore'
import { ReturPembelianItem, ReturPembelianFormData } from '../types/returPembelian'
import { ReturFormBasicFields } from './ReturFormBasicFields'
import { ReturProductSelection } from './ReturProductSelection'
import { Calendar, User, AlertTriangle, Package } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReturPembelianFormProps {
  isOpen: boolean
  onClose: () => void
  editingItem?: ReturPembelianItem | null
}

export function ReturPembelianForm({ isOpen, onClose, editingItem }: ReturPembelianFormProps) {
  const {
    addItem,
    updateItem,
    loading,
    error,
    setError
  } = useReturPembelianStore()

  const {
    items: produkItems,
    loading: produkLoading,
    search: searchProduk,
    loadFirst: loadProdukFirst
  } = useProdukStore()

  const {
    items: pembelianItems,
    loading: pembelianLoading
  } = usePembelianStore()

  const {
    items: supplierItems,
    loading: supplierLoading
  } = useSupplierStore()

  const [formData, setFormData] = useState<ReturPembelianFormData>({
    id_pembelian: 0,
    id_produk: 0,
    jumlah: 1,
    alasan: ''
  })

  const [selectedPembelian, setSelectedPembelian] = useState<any>(null)
  const [selectedProduk, setSelectedProduk] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingItem) {
      setFormData({
        id_pembelian: editingItem.id_pembelian,
        id_produk: editingItem.id_produk,
        jumlah: editingItem.jumlah,
        alasan: editingItem.alasan
      })
      
      // Find and set selected items
      const pembelian = pembelianItems.find(p => p.id === editingItem.id_pembelian)
      const produk = produkItems.find(p => p.id === editingItem.id_produk)
      
      setSelectedPembelian(pembelian)
      setSelectedProduk(produk)
    } else {
      setFormData({
        id_pembelian: 0,
        id_produk: 0,
        jumlah: 1,
        alasan: ''
      })
      setSelectedPembelian(null)
      setSelectedProduk(null)
    }
  }, [editingItem, pembelianItems, produkItems])

  useEffect(() => {
    if (isOpen && produkItems.length === 0 && !produkLoading) {
      loadProdukFirst().catch(() => {})
    }
  }, [isOpen, produkItems.length, produkLoading, loadProdukFirst])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.id_pembelian) {
      errors.id_pembelian = 'Pembelian harus dipilih'
    }

    if (!formData.id_produk) {
      errors.id_produk = 'Produk harus dipilih'
    }

    if (!formData.jumlah || formData.jumlah <= 0) {
      errors.jumlah = 'Jumlah harus lebih dari 0'
    }

    if (!formData.alasan.trim()) {
      errors.alasan = 'Alasan retur harus diisi'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      const selectedProdukData = produkItems.find(p => p.id === formData.id_produk)
      if (!selectedProdukData) {
        setError('Produk tidak ditemukan')
        return
      }

      const submitData = {
        ...formData,
        harga_beli: selectedProdukData.harga_beli || 0,
        total: (selectedProdukData.harga_beli || 0) * formData.jumlah,
        status: 'pending' as const
      }

      if (editingItem) {
        await updateItem(editingItem.id, submitData)
      } else {
        await addItem(submitData as any)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  const handlePembelianChange = (pembelianId: number) => {
    const pembelian = pembelianItems.find(p => p.id === pembelianId)
    setSelectedPembelian(pembelian)
    setFormData(prev => ({ ...prev, id_pembelian: pembelianId }))
  }

  const handleProdukChange = (produkId: number) => {
    const produk = produkItems.find(p => p.id === produkId)
    setSelectedProduk(produk)
    setFormData(prev => ({ ...prev, id_produk: produkId }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editingItem ? 'Edit Retur Pembelian' : 'Retur Pembelian Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Pembelian Selection */}
          <div className="space-y-2">
            <Label htmlFor="pembelian">Pembelian</Label>
            <Select
              value={formData.id_pembelian?.toString() || ''}
              onValueChange={(value) => handlePembelianChange(parseInt(value))}
            >
              <SelectTrigger className={validationErrors.id_pembelian ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih pembelian" />
              </SelectTrigger>
              <SelectContent>
                {pembelianItems.map((pembelian) => (
                  <SelectItem key={pembelian.id} value={pembelian.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{pembelian.nomor_faktur}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {format(new Date(pembelian.tanggal), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.id_pembelian && (
              <p className="text-sm text-red-600">{validationErrors.id_pembelian}</p>
            )}
          </div>

          {/* Selected Pembelian Info */}
          {selectedPembelian && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">{selectedPembelian.nomor_faktur}</div>
                    <div className="text-sm text-blue-700">
                      Supplier: {selectedPembelian.supplier?.nama || '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-700">
                      {format(new Date(selectedPembelian.tanggal), 'dd MMM yyyy', { locale: id })}
                    </div>
                    <div className="font-medium text-blue-900">
                      {formatCurrency(selectedPembelian.total || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Selection */}
          <ReturProductSelection
            produkItems={produkItems}
            selectedProduk={selectedProduk}
            onProdukChange={handleProdukChange}
            validationErrors={validationErrors}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Basic Fields */}
          <ReturFormBasicFields
            formData={formData}
            onFormDataChange={setFormData}
            validationErrors={validationErrors}
            selectedProduk={selectedProduk}
            selectedPembelian={selectedPembelian}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}