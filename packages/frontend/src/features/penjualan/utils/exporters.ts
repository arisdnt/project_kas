import { SaleTransaction } from '../types'

export function exportMovementCSV(txs: SaleTransaction[], filename = 'pergerakan-penjualan.csv') {
  const header = ['Kode', 'Tanggal', 'Waktu', 'Kasir', 'Produk', 'SKU', 'Qty', 'Harga', 'Diskon', 'Pajak', 'Total', 'Metode', 'Status']
  const rows = txs.flatMap((t) => t.lines.map((l) => [
    t.code, t.date, t.time || '', t.cashier, l.productName, l.sku || '', l.qty, l.price, l.discount, l.tax, l.total, t.payment, t.status,
  ]))
  const csv = [header, ...rows]
    .map((arr) => arr.map((x) => (typeof x === 'string' && x.includes(',') ? `"${x}"` : String(x))).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

