import React from 'react'
import { useToast } from '@/core/hooks/use-toast'
import { returPenjualanService } from '../services/returPenjualanService'
import type { RefundTransaction, RefundFilters, RefundStats } from '../types'
import { formatCurrency, getStatusText } from '../data/sampleRefunds'
import { handleExportCSV, handlePrint } from '../utils/exportUtils'

interface Props {
  refunds: RefundTransaction[]
  filteredRefunds: RefundTransaction[]
  filters: RefundFilters
  stats: RefundStats
  onProcessingChange: (id: number | null) => void
}

export function useRefundActions({ refunds, filteredRefunds, filters, stats, onProcessingChange }: Props) {
  const { toast } = useToast()

  const handleApprove = async (id: number) => {
    onProcessingChange(id)
    try {
      // await returPenjualanService.approveRefund(id)
      toast({
        title: "Berhasil",
        description: "Retur telah disetujui"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyetujui retur",
        variant: "destructive"
      })
    } finally {
      onProcessingChange(null)
    }
  }

  const handleReject = async (id: number) => {
    onProcessingChange(id)
    try {
      // await returPenjualanService.rejectRefund(id)
      toast({
        title: "Berhasil",
        description: "Retur telah ditolak"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menolak retur",
        variant: "destructive"
      })
    } finally {
      onProcessingChange(null)
    }
  }

  const handleProcess = async (id: number) => {
    onProcessingChange(id)
    try {
      // await returPenjualanService.update(id, { status: 'PROCESSED' })
      toast({
        title: "Berhasil",
        description: "Retur sedang diproses"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memproses retur",
        variant: "destructive"
      })
    } finally {
      onProcessingChange(null)
    }
  }

  const handleExport = () => {
    handleExportCSV(filteredRefunds, filters)
  }

  const handlePrintReport = () => {
    handlePrint(filteredRefunds, filters, stats)
  }

  return {
    handleApprove,
    handleReject,
    handleProcess,
    handleExport,
    handlePrint: handlePrintReport
  }
}