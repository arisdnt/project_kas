import { PaymentMethod, SaleRecord, SaleStatus } from '../types'

const cashiers = ['Andi', 'Budi', 'Citra', 'Dewi']
const customers = ['Umum', 'Member A', 'Member B', 'Walk-in']
const payments: PaymentMethod[] = ['CASH', 'QRIS', 'DEBIT', 'TRANSFER']
const statuses: SaleStatus[] = ['PAID', 'PAID', 'PAID', 'VOID', 'REFUND']

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

export function generateSampleSales(days = 30, count = 80): SaleRecord[] {
  const today = new Date()
  const list: SaleRecord[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    const back = Math.floor(Math.random() * days)
    d.setDate(today.getDate() - back)
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const subtotal = 50000 + Math.floor(Math.random() * 450000)
    const discount = Math.floor(subtotal * [0, 0.02, 0.05][Math.floor(Math.random() * 3)])
    const tax = Math.floor((subtotal - discount) * 0.11)
    const total = subtotal - discount + tax
    const cashier = cashiers[Math.floor(Math.random() * cashiers.length)]
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const payment = payments[Math.floor(Math.random() * payments.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    list.push({
      id: 1000 + i,
      code: `TRX-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(i % 100)}`,
      date,
      cashier,
      customer,
      total,
      discount,
      tax,
      payment,
      status,
    })
  }
  // Sort desc by date for readability
  return list.sort((a, b) => (a.date < b.date ? 1 : -1))
}

