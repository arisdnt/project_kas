import { PurchaseTransaction } from '../types';

const csvEscape = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return '';
  const str = typeof value === 'number' ? value.toString() : value;
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatCurrency = (value: number) => value.toLocaleString('id-ID');

export function exportPurchaseCSV(transactions: PurchaseTransaction[], filename = 'transaksi-pembelian.csv') {
  const header = [
    'Nomor Transaksi',
    'Tanggal',
    'Jatuh Tempo',
    'Supplier',
    'Pembeli',
    'Subtotal',
    'Diskon Nominal',
    'Diskon Persen',
    'Pajak Nominal',
    'Pajak Persen',
    'Total',
    'Status',
    'Status Pembayaran',
    'Catatan'
  ];

  const rows = transactions.map((trx) => [
    csvEscape(trx.nomor_transaksi),
    csvEscape(trx.tanggal),
    csvEscape(trx.jatuh_tempo || ''),
    csvEscape(trx.supplier_nama || ''),
    csvEscape(trx.pembeli_nama || ''),
    csvEscape(formatCurrency(trx.subtotal)),
    csvEscape(formatCurrency(trx.diskon_nominal)),
    csvEscape(trx.diskon_persen),
    csvEscape(formatCurrency(trx.pajak_nominal)),
    csvEscape(trx.pajak_persen),
    csvEscape(formatCurrency(trx.total)),
    csvEscape(trx.status),
    csvEscape(trx.status_pembayaran),
    csvEscape(trx.catatan || '')
  ]);

  const csvContent = [header, ...rows].map((cols) => cols.join(',')).join('\n');
  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
