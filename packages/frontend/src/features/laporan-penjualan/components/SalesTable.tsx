import { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { SaleRecord } from '../types'
import { Button } from '@/core/components/ui/button'

type Props = {
  data: SaleRecord[]
}

const PAGE_SIZE = 10

export function SalesTable({ data }: Props) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return data.slice(start, start + PAGE_SIZE)
  }, [data, page])

  const totals = useMemo(() => {
    return data.reduce(
      (acc, d) => {
        acc.omzet += d.total
        acc.diskon += d.discount
        acc.tax += d.tax
        return acc
      },
      { omzet: 0, diskon: 0, tax: 0 },
    )
  }, [data])

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((s) => (
              <TableRow key={s.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{s.code}</TableCell>
                <TableCell>{s.date}</TableCell>
                <TableCell>{s.cashier}</TableCell>
                <TableCell>{s.customer || '-'}</TableCell>
                <TableCell>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{s.payment}</span>
                </TableCell>
                <TableCell>
                  <span className={`rounded px-2 py-0.5 text-xs ${
                    s.status === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : s.status === 'VOID'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>{s.status}</span>
                </TableCell>
                <TableCell className="text-right">Rp{s.total.toLocaleString('id-ID')}</TableCell>
              </TableRow>
            ))}
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-8">Tidak ada data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          Total: <span className="font-medium">Rp{totals.omzet.toLocaleString('id-ID')}</span> • Diskon: Rp{totals.diskon.toLocaleString('id-ID')} • Pajak: Rp{totals.tax.toLocaleString('id-ID')}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <div className="text-xs text-gray-600">Hal {page} / {totalPages}</div>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  )
}

