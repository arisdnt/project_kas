import type { RefundTransaction, RefundFilters, RefundStats } from '../types'
import { formatCurrency, getStatusText } from '../data/sampleRefunds'

export function handleExportCSV(refunds: RefundTransaction[], filters: RefundFilters) {
  const csvContent = [
    ['Kode Retur', 'Transaksi Asli', 'Tanggal', 'Kasir', 'Pelanggan', 'Status', 'Nilai Retur'],
    ...refunds.map(r => [
      r.code,
      r.originalTransactionCode,
      r.date,
      r.cashier,
      r.customer || '',
      getStatusText(r.status),
      r.refundAmount.toString()
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `retur-penjualan-${filters.from || 'semua'}-${filters.to || 'sekarang'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function handlePrint(refunds: RefundTransaction[], filters: RefundFilters, stats: RefundStats) {
  const printContent = `
    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">Laporan Retur Penjualan</h2>
    <p style="margin-bottom: 8px;">Periode: ${filters.from || 'Semua'} - ${filters.to || 'Sekarang'}</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Kode Retur</th>
          <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Tanggal</th>
          <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Kasir</th>
          <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Status</th>
          <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Nilai</th>
        </tr>
      </thead>
      <tbody>
        ${refunds.map(r => `
          <tr>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">${r.code}</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">${r.date}</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">${r.cashier}</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">${getStatusText(r.status)}</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatCurrency(r.refundAmount)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background-color: #f9fafb;">
          <td colspan="4" style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Total:</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatCurrency(stats.totalRefundAmount)}</td>
        </tr>
      </tfoot>
    </table>
  `
  
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Retur Penjualan</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            @media print { body { margin: 10px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}