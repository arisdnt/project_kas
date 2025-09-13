import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

interface Txn {
  id: string;
  waktu: string;
  kasir: string;
  pelanggan?: string;
  total: number;
  metode: 'Tunai' | 'Kartu' | 'QRIS';
  status: 'Berhasil' | 'Batal' | 'Refund';
}

const sampleTxns: Txn[] = [
  { id: 'TRX-001245', waktu: '10:21', kasir: 'Rani', pelanggan: 'Umum', total: 245000, metode: 'QRIS', status: 'Berhasil' },
  { id: 'TRX-001244', waktu: '10:18', kasir: 'Rani', pelanggan: 'Budi', total: 510000, metode: 'Kartu', status: 'Berhasil' },
  { id: 'TRX-001243', waktu: '10:11', kasir: 'Dika', pelanggan: 'Umum', total: 75000, metode: 'Tunai', status: 'Berhasil' },
  { id: 'TRX-001242', waktu: '09:59', kasir: 'Dika', pelanggan: 'Umum', total: 120000, metode: 'Tunai', status: 'Batal' },
  { id: 'TRX-001241', waktu: '09:51', kasir: 'Rani', pelanggan: 'Sari', total: 335000, metode: 'QRIS', status: 'Berhasil' },
];

function StatusBadge({ status }: { status: Txn['status'] }) {
  const map = {
    'Berhasil': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Batal': 'bg-red-50 text-red-700 border-red-200',
    'Refund': 'bg-amber-50 text-amber-700 border-amber-200',
  } as const;
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>{status}</span>;
}

export function RecentTransactionsTable() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="table-scroll-container max-h-80">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Waktu</th>
                <th className="px-3 py-2 font-medium">Kasir</th>
                <th className="px-3 py-2 font-medium">Pelanggan</th>
                <th className="px-3 py-2 font-medium">Metode</th>
                <th className="px-3 py-2 font-medium text-right">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleTxns.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">{t.id}</td>
                  <td className="px-3 py-2 text-gray-700">{t.waktu}</td>
                  <td className="px-3 py-2 text-gray-700">{t.kasir}</td>
                  <td className="px-3 py-2 text-gray-700">{t.pelanggan || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{t.metode}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">Rp{t.total.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
