import React, { useMemo, useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { RefundFilterBar } from '../components/RefundFilterBar'
import { RefundStatsCards } from '../components/RefundStatsCards'
import { RefundTable } from '../components/RefundTable'
import { RefundHeader, RefundTableHeader } from '../components/RefundHeader'
import { useRefundActions } from '../components/RefundActions'
import { ReturPenjualanDrawer, ReturPenjualanDrawerContent, ReturPenjualanDrawerHeader, ReturPenjualanDrawerTitle } from '../components/ReturPenjualanDrawer'
import { ReturPenjualanForm, ReturPenjualanFormData } from '../components/ReturPenjualanForm'
import { ReturPenjualanAccessPlaceholder } from '../components/ReturPenjualanAccessPlaceholder'
import type { RefundTransaction, RefundFilters, RefundStats } from '../types'
import { generateSampleRefunds } from '../data/sampleRefunds'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Edit2, Eye, RotateCcw, Hash, Calendar, User, CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

const cashiers = ['Andi', 'Budi', 'Citra', 'Dewi']

function withinRange(date: string, from?: string, to?: string): boolean {
  if (!from && !to) return true
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

export function ReturPenjualanPage() {
  const [refunds] = useState<RefundTransaction[]>(() => generateSampleRefunds(25))
  const [selectedRefund, setSelectedRefund] = useState<RefundTransaction | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view')
  const [editing, setEditing] = useState<ReturPenjualanFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const { toast } = useToast()
  const { user } = useAuthStore()
  
  const today = new Date()
  const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  
  const [filters, setFilters] = useState<RefundFilters>({ 
    status: 'ALL', 
    range: '7d', 
    payment: 'ALL' as any 
  })

  // Calculate normalized filters with date range
  const normalized = useMemo(() => {
    if (filters.range !== 'custom') {
      let from: string | undefined
      if (filters.range === 'today') from = dateStr(today)
      if (filters.range === '7d') { 
        const d = new Date(today); 
        d.setDate(today.getDate() - 6); 
        from = dateStr(d) 
      }
      if (filters.range === '30d') { 
        const d = new Date(today); 
        d.setDate(today.getDate() - 29); 
        from = dateStr(d) 
      }
      return { ...filters, from, to: dateStr(today) }
    }
    return filters
  }, [filters])

  // Filter refunds based on filters
  const filtered = useMemo(() => {
    return refunds.filter((refund) => {
      // Date range filter
      if (!withinRange(refund.date, normalized.from, normalized.to)) return false
      
      // Status filter
      if (normalized.status !== 'ALL' && refund.status !== normalized.status) return false
      
      // Cashier filter
      if (normalized.cashier && refund.cashier !== normalized.cashier) return false
      
      // Payment method filter
      if (normalized.payment && normalized.payment !== 'ALL' && refund.paymentMethod !== normalized.payment) return false
      
      // Search query
      if (normalized.query) {
        const q = normalized.query.toLowerCase()
        const matches = 
          refund.code.toLowerCase().includes(q) ||
          refund.originalTransactionCode.toLowerCase().includes(q) ||
          refund.customer?.toLowerCase().includes(q) ||
          refund.lines.some(line => 
            line.productName.toLowerCase().includes(q) ||
            (line.sku && line.sku.toLowerCase().includes(q))
          )
        if (!matches) return false
      }
      
      return true
    })
  }, [refunds, normalized])

  // Calculate stats
  const stats = useMemo((): RefundStats => {
    const pending = filtered.filter(r => r.status === 'PENDING').length
    const approved = filtered.filter(r => r.status === 'APPROVED').length
    const rejected = filtered.filter(r => r.status === 'REJECTED').length
    const total = filtered.reduce((sum, r) => sum + r.refundAmount, 0)
    
    return {
      totalRefunds: filtered.length,
      pendingRefunds: pending,
      approvedRefunds: approved,
      rejectedRefunds: rejected,
      totalRefundAmount: total,
      averageRefundAmount: filtered.length > 0 ? total / filtered.length : 0
    }
  }, [filtered])

  // Get action handlers
  const {
    handleApprove,
    handleReject,
    handleProcess,
    handleExport,
    handlePrint: handlePrintReport
  } = useRefundActions({
    refunds,
    filteredRefunds: filtered,
    filters: normalized,
    stats,
    onProcessingChange: setIsProcessing
  })

  const openCreate = () => {
    setEditing({
      originalTransactionId: '',
      notes: '',
      status: 'PENDING',
      lines: []
    })
    setSelectedRefund(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (refund: RefundTransaction) => {
    setSelectedRefund(refund)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (refund: RefundTransaction) => {
    setSelectedRefund(refund)
    setEditing({
      originalTransactionId: refund.originalTransactionId.toString(),
      notes: refund.notes || '',
      status: refund.status,
      lines: refund.lines
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: ReturPenjualanFormData) => {
    setSaving(true)
    try {
      if (selectedRefund) {
        // Update existing refund
        console.log('Updating refund:', selectedRefund.id, data)
        toast({ title: 'Retur penjualan diperbarui' })
      } else {
        // Create new refund
        console.log('Creating refund:', data)
        toast({ title: 'Retur penjualan dibuat' })
      }
      setDrawerOpen(false)
      setSelectedRefund(null)
      setEditing(null)
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PROCESSED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'PROCESSED':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu'
      case 'APPROVED':
        return 'Disetujui'
      case 'REJECTED':
        return 'Ditolak'
      case 'PROCESSED':
        return 'Diproses'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <RefundHeader onCreateRetur={openCreate} />

      {/* Stats Cards */}
      <RefundStatsCards stats={stats} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <RefundFilterBar
            filters={normalized}
            cashiers={cashiers}
            onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
            onExport={handleExport}
            onPrint={handlePrintReport}
          />
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardContent className="p-0">
          <RefundTableHeader
            totalCount={refunds.length}
            filteredCount={filtered.length}
            onCreateRetur={openCreate}
          />
          
          <RefundTable
            refunds={filtered}
            onView={onView}
            onApprove={handleApprove}
            onReject={handleReject}
            onProcess={handleProcess}
          />
        </CardContent>
      </Card>

      {/* Drawer */}
      <ReturPenjualanDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <ReturPenjualanDrawerContent className="!w-[50vw] !max-w-none">
          <ReturPenjualanDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
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
                <ReturPenjualanDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Buat Retur Penjualan' :
                   drawerMode === 'edit' ? 'Edit Retur Penjualan' : 'Detail Retur Penjualan'}
                </ReturPenjualanDrawerTitle>
              </div>
            </div>
          </ReturPenjualanDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selectedRefund ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kode Retur</p>
                      <p className="text-lg font-semibold">{selectedRefund.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Transaksi Asli</p>
                        <p className="text-gray-700">{selectedRefund.originalTransactionCode}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tanggal Retur</p>
                        <p className="text-gray-700">{new Date(selectedRefund.date).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kasir</p>
                        <p className="text-gray-700">{selectedRefund.cashier}</p>
                      </div>
                    </div>
                    {selectedRefund.customer && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Pelanggan</p>
                          <p className="text-gray-700">{selectedRefund.customer}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${getStatusBadge(selectedRefund.status)}`}>
                      {getStatusIcon(selectedRefund.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedRefund.status)}`}>
                        {getStatusLabel(selectedRefund.status)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                      <CreditCard className="h-4 w-4" />
                      Informasi Pembayaran
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Metode Pembayaran</p>
                          <p className="text-gray-700">{selectedRefund.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Jumlah Retur</p>
                          <p className="text-gray-700 font-medium">{formatCurrency(selectedRefund.refundAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Items */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                      <RotateCcw className="h-4 w-4" />
                      Item Retur
                    </div>

                    <div className="space-y-2">
                      {selectedRefund.lines.map((line, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-blue-900">{line.productName}</p>
                              <p className="text-blue-700">{line.sku && `SKU: ${line.sku}`}</p>
                            </div>
                            <div>
                              <p className="text-blue-700">Qty: {line.qty} {line.unit}</p>
                              <p className="text-blue-700">@ {formatCurrency(line.price)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-blue-900">{formatCurrency(line.total)}</p>
                              <p className="text-xs text-blue-600">{line.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Retur:</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedRefund.refundAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRefund.notes && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Catatan</p>
                        <p className="text-gray-700">{selectedRefund.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Processing Information */}
                  {(selectedRefund.processedBy || selectedRefund.processedAt) && (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      {selectedRefund.processedBy && (
                        <div>
                          <p className="text-sm text-gray-500">Diproses Oleh</p>
                          <p className="text-sm font-medium">{selectedRefund.processedBy}</p>
                        </div>
                      )}
                      {selectedRefund.processedAt && (
                        <div>
                          <p className="text-sm text-gray-500">Waktu Pemrosesan</p>
                          <p className="text-sm font-medium">{new Date(selectedRefund.processedAt).toLocaleString('id-ID')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                  >
                    Tutup
                  </Button>
                  {selectedRefund.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => onEdit(selectedRefund)}
                        className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Status
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedRefund.id)}
                        className="px-5 py-2 h-10 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <ReturPenjualanAccessPlaceholder />
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
                <ReturPenjualanForm
                  value={editing}
                  editingRetur={selectedRefund}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelectedRefund(null)
                    setEditing(null)
                  }}
                  isLoading={saving}
                  isCreate={drawerMode === 'create'}
                />
              )
            )}
          </div>
        </ReturPenjualanDrawerContent>
      </ReturPenjualanDrawer>
    </div>
  )
}

export default ReturPenjualanPage