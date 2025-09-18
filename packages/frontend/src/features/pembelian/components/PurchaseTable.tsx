import { PurchaseTransaction, PurchasePaymentStatus, PurchaseStatus } from '../types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/core/components/ui/table';

const formatCurrency = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.split(' ')[0] || value;
  }
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const STATUS_CLASS: Record<PurchaseStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  received: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const PAYMENT_CLASS: Record<PurchasePaymentStatus, string> = {
  belum_bayar: 'bg-amber-100 text-amber-700',
  sebagian_bayar: 'bg-blue-100 text-blue-700',
  lunas: 'bg-emerald-100 text-emerald-700',
};

const PAYMENT_LABEL: Record<PurchasePaymentStatus, string> = {
  belum_bayar: 'Belum Bayar',
  sebagian_bayar: 'Sebagian',
  lunas: 'Lunas',
};

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  draft: 'Draft',
  pending: 'Menunggu',
  received: 'Diterima',
  cancelled: 'Dibatalkan',
};

type Props = {
  transactions: PurchaseTransaction[];
};

export function PurchaseTable({ transactions }: Props) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomor</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Jatuh Tempo</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Pembeli</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">Diskon</TableHead>
            <TableHead className="text-right">Pajak</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Status Pembayaran</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((trx) => (
            <TableRow key={trx.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">{trx.nomor_transaksi}</TableCell>
              <TableCell>{formatDate(trx.tanggal)}</TableCell>
              <TableCell>{formatDate(trx.jatuh_tempo)}</TableCell>
              <TableCell>{trx.supplier_nama || '-'}</TableCell>
              <TableCell>{trx.pembeli_nama || '-'}</TableCell>
              <TableCell className="text-right">{formatCurrency(trx.subtotal)}</TableCell>
              <TableCell className="text-right">
                {trx.diskon_nominal ? formatCurrency(trx.diskon_nominal) : trx.diskon_persen ? `${trx.diskon_persen}%` : '-'}
              </TableCell>
              <TableCell className="text-right">
                {trx.pajak_nominal ? formatCurrency(trx.pajak_nominal) : trx.pajak_persen ? `${trx.pajak_persen}%` : '-'}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(trx.total)}</TableCell>
              <TableCell>
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_CLASS[trx.status]}`}>
                  {STATUS_LABEL[trx.status]}
                </span>
              </TableCell>
              <TableCell>
                <span className={`rounded px-2 py-0.5 text-xs ${PAYMENT_CLASS[trx.status_pembayaran]}`}>
                  {PAYMENT_LABEL[trx.status_pembayaran]}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500 max-w-xs truncate" title={trx.catatan || ''}>
                {trx.catatan || '-'}
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-sm text-gray-500 py-8">
                Belum ada transaksi pembelian pada periode ini
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
