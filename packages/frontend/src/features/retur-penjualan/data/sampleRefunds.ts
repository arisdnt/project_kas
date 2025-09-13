import type { RefundTransaction } from '../types'

export function generateSampleRefunds(count: number = 20): RefundTransaction[] {
  const cashiers = ['Andi', 'Budi', 'Citra', 'Dewi']
  const customers = ['Pelanggan A', 'Pelanggan B', 'Pelanggan C', '']
  const paymentMethods: Array<'CASH' | 'CARD' | 'QRIS' | 'TRANSFER'> = ['CASH', 'CARD', 'QRIS', 'TRANSFER']
  const statuses: Array<'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'> = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']
  const reasons = ['Barang rusak', 'Tidak sesuai pesanan', 'Kelebihan stok', 'Kualitas tidak baik', 'Salah pengiriman']
  
  const products = [
    { id: 1, name: 'Indomie Goreng', sku: 'IND001', price: 3000, unit: 'pcs' },
    { id: 2, name: 'Teh Botol', sku: 'TB001', price: 5000, unit: 'botol' },
    { id: 3, name: 'Susu Ultra', sku: 'SU001', price: 8000, unit: 'karton' },
    { id: 4, name: 'Rinso', sku: 'RIN001', price: 15000, unit: 'pcs' },
    { id: 5, name: 'Mie Sedap', sku: 'MS001', price: 2800, unit: 'pcs' }
  ]

  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    
    const originalCode = `TRX${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    const refundCode = `RFN${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const cashier = cashiers[Math.floor(Math.random() * cashiers.length)]
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    
    const lineCount = Math.floor(Math.random() * 3) + 1
    const lines = Array.from({ length: lineCount }, (_, j) => {
      const product = products[Math.floor(Math.random() * products.length)]
      const qty = Math.floor(Math.random() * 5) + 1
      const reason = reasons[Math.floor(Math.random() * reasons.length)]
      
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        qty,
        unit: product.unit,
        price: product.price,
        reason,
        total: product.price * qty
      }
    })
    
    const refundAmount = lines.reduce((sum, line) => sum + line.total, 0)
    
    return {
      id: i + 1,
      code: refundCode,
      originalTransactionCode: originalCode,
      originalTransactionId: Math.floor(Math.random() * 1000) + 1,
      date: date.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      cashier,
      customer: customer || undefined,
      paymentMethod,
      status,
      refundAmount,
      lines,
      notes: status === 'REJECTED' ? 'Ditolak karena alasan tertentu' : undefined,
      processedBy: status !== 'PENDING' ? cashier : undefined,
      processedAt: status !== 'PENDING' ? date.toISOString() : undefined
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'PROCESSED':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusText(status: string): string {
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