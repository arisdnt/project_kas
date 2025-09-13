import { SaleTransaction } from '../types'

function pad(n: number) { return n < 10 ? `0${n}` : String(n) }

export function generateSampleTransactions(days = 14, count = 24): SaleTransaction[] {
  const cashiers = ['Andi', 'Budi', 'Citra', 'Dewi']
  const products = [
    { id: 1, name: 'Mi Instan Ayam', sku: 'MI-AYM', price: 3500 },
    { id: 2, name: 'Air Mineral 600ml', sku: 'AM-600', price: 4500 },
    { id: 3, name: 'Teh Botol 350ml', sku: 'TB-350', price: 6000 },
    { id: 4, name: 'Gula 1kg', sku: 'GL-1KG', price: 14500 },
    { id: 5, name: 'Kopi Sachet', sku: 'KOP-SCH', price: 2500 },
  ]
  const payments = ['CASH', 'QRIS', 'DEBIT', 'TRANSFER'] as const
  const statuses = ['PAID', 'PAID', 'PAID', 'VOID'] as const

  const now = new Date()
  const txs: SaleTransaction[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(now)
    const back = Math.floor(Math.random() * days)
    d.setDate(now.getDate() - back)
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const time = `${pad(Math.floor(Math.random() * 12) + 9)}:${pad(Math.floor(Math.random() * 60))}`
    const lineCount = 1 + Math.floor(Math.random() * 4)
    const lines = Array.from({ length: lineCount }).map(() => {
      const p = products[Math.floor(Math.random() * products.length)]
      const qty = 1 + Math.floor(Math.random() * 5)
      const disc = Math.random() < 0.2 ? Math.round(p.price * qty * 0.05) : 0
      const tax = Math.round((p.price * qty - disc) * 0.11)
      const total = p.price * qty - disc + tax
      return { productId: p.id, productName: p.name, sku: p.sku, qty, unit: 'pcs', price: p.price, discount: disc, tax, total }
    })
    txs.push({
      id: 2000 + i,
      code: `S-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(i % 100)}`,
      date,
      time,
      cashier: cashiers[Math.floor(Math.random() * cashiers.length)],
      customer: Math.random() < 0.5 ? 'Umum' : 'Member',
      payment: payments[Math.floor(Math.random() * payments.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lines,
    })
  }
  return txs.sort((a, b) => (a.date === b.date ? (a.time! < b.time! ? 1 : -1) : a.date < b.date ? 1 : -1))
}

