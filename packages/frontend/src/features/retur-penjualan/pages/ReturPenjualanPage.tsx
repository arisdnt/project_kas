import React, { useMemo, useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { RefundFilterBar } from '../components/RefundFilterBar'
import { RefundStatsCards } from '../components/RefundStatsCards'
import { RefundTable } from '../components/RefundTable'
import { RefundHeader, RefundTableHeader } from '../components/RefundHeader'
import { useRefundActions } from '../components/RefundActions'
import { RefundDetailDialog } from '../components/RefundDetailDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog"
import type { RefundTransaction, RefundFilters, RefundStats } from '../types'
import { generateSampleRefunds } from '../data/sampleRefunds'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <RefundHeader />

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
          />
          
          <RefundTable
            refunds={filtered}
            onView={(refund) => {
              setSelectedRefund(refund)
              setIsDialogOpen(true)
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onProcess={handleProcess}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detail Retur Penjualan</DialogTitle>
          </DialogHeader>
          
          {selectedRefund && (
            <RefundDetailDialog
              refund={selectedRefund}
              isProcessing={isProcessing}
              onApprove={(id) => {
                handleApprove(id)
                setIsDialogOpen(false)
              }}
              onReject={(id) => {
                handleReject(id)
                setIsDialogOpen(false)
              }}
              onProcess={(id) => {
                handleProcess(id)
                setIsDialogOpen(false)
              }}
              onClose={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReturPenjualanPage