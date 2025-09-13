import { SaleTransaction } from '../types'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/core/components/ui/table'
import { Button } from '@/core/components/ui/button'

type Props = {
  transactions: SaleTransaction[]
  onPrint: (trxId: number) => void
}

export function MovementTable({ transactions, onPrint }: Props) {
  const rows = transactions.flatMap((t) =>
    t.lines.map((l, idx) => ({
      key: `${t.id}-${idx}`,
      trxId: t.id,
      code: t.code,
      date: t.date,
      time: t.time,
      cashier: t.cashier,
      payment: t.payment,
      status: t.status,
      product: l.productName,
      sku: l.sku,
      qty: l.qty,
      unit: l.unit,
      price: l.price,
      discount: l.discount,
      tax: l.tax,
      total: l.total,
    })),
  )

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Kasir</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-right">Diskon</TableHead>
            <TableHead className="text-right">Pajak</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.key} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">{r.code}</TableCell>
              <TableCell>{r.date}</TableCell>
              <TableCell>{r.time}</TableCell>
              <TableCell>{r.cashier}</TableCell>
              <TableCell>{r.product}</TableCell>
              <TableCell>{r.sku || '-'}</TableCell>
              <TableCell className="text-right">{r.qty} {r.unit}</TableCell>
              <TableCell className="text-right">Rp{r.price.toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right">{r.discount ? `Rp${r.discount.toLocaleString('id-ID')}` : '-'}</TableCell>
              <TableCell className="text-right">{r.tax ? `Rp${r.tax.toLocaleString('id-ID')}` : '-'}</TableCell>
              <TableCell className="text-right">Rp{r.total.toLocaleString('id-ID')}</TableCell>
              <TableCell><span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{r.payment}</span></TableCell>
              <TableCell>
                <span className={`rounded px-2 py-0.5 text-xs ${
                  r.status === 'PAID'
                    ? 'bg-green-100 text-green-700'
                    : r.status === 'VOID'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>{r.status}</span>
              </TableCell>
              <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => onPrint(r.trxId)}>Struk</Button></TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={14} className="text-center text-sm text-gray-500 py-8">Tidak ada data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

