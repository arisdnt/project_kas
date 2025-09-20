import { Aggregates, Filters, SaleRecord } from '../types'

export function exportCSV(rows: SaleRecord[], filename = 'laporan-penjualan.csv') {
  const header = ['Kode', 'Tanggal', 'Kasir', 'Pelanggan', 'Metode', 'Status', 'Total', 'Diskon', 'Pajak']
  const lines = rows.map((r) => [r.code, r.date, r.cashier, r.customer || '', r.payment, r.status, r.total, r.discount, r.tax])
  const csv = [header, ...lines]
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

export function printSales(rows: SaleRecord[], agg: Aggregates, filters: Filters) {
  const w = window.open('', '_blank')
  if (!w) return
  const { omzet, transaksi, rataRata, diskon } = agg
  const style = `
    <style>
      body{font-family: ui-sans-serif, system-ui, -apple-system; padding:16px;}
      h1{font-size:18px;margin:0 0 8px}
      .muted{color:#6b7280;font-size:12px;margin-bottom:12px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #e5e7eb;padding:6px;text-align:left}
      tfoot td{font-weight:600}
    </style>
  `
  const range = filters.range === 'custom' ? `${filters.from} s/d ${filters.to}` : filters.range
  const html = `
    <html><head><title>Laporan Penjualan</title>${style}</head>
    <body>
      <h1>Laporan Penjualan</h1>
      <div class="muted">Rentang: ${range} • Kasir: ${filters.cashier || 'Semua'} • Metode: ${filters.payment || 'ALL'}</div>
      <table>
        <thead><tr>
          <th>Kode</th><th>Tanggal</th><th>Kasir</th><th>Pelanggan</th><th>Metode</th><th>Status</th><th>Total</th>
        </tr></thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr><td>${r.code}</td><td>${r.date}</td><td>${r.cashier}</td><td>${r.customer || ''}</td><td>${r.payment}</td><td>${r.status}</td><td>Rp${r.total.toLocaleString('id-ID')}</td></tr>`,
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr><td colspan="6">Omzet</td><td>Rp${omzet.toLocaleString('id-ID')}</td></tr>
          <tr><td colspan="6">Transaksi</td><td>${transaksi}</td></tr>
          <tr><td colspan="6">Rata-Rata</td><td>Rp${Math.round(rataRata).toLocaleString('id-ID')}</td></tr>
          <tr><td colspan="6">Diskon</td><td>Rp${diskon.toLocaleString('id-ID')}</td></tr>
        </tfoot>
      </table>
      <script>window.onload = () => window.print()</script>
    </body></nhtml>
  `
  w.document.write(html)
  w.document.close()
}

