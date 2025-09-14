import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { TransaksiTerbaru } from '@/features/dashboard/services/dashboardService';

interface RecentTransactionsTableProps {
  data?: TransaksiTerbaru[];
}

// Data dummy sebagai fallback
const sampleTxns: TransaksiTerbaru[] = [
  { id: 'TRX-001245', nomorTransaksi: 'TRX-001245', tanggal: '2024-01-15T10:21:00Z', total: 245000, status: 'selesai', metodeBayar: 'qris', namaPelanggan: 'Umum' },
  { id: 'TRX-001244', nomorTransaksi: 'TRX-001244', tanggal: '2024-01-15T10:18:00Z', total: 510000, status: 'selesai', metodeBayar: 'kartu', namaPelanggan: 'Budi' },
  { id: 'TRX-001243', nomorTransaksi: 'TRX-001243', tanggal: '2024-01-15T10:11:00Z', total: 75000, status: 'selesai', metodeBayar: 'tunai' },
  { id: 'TRX-001242', nomorTransaksi: 'TRX-001242', tanggal: '2024-01-15T09:59:00Z', total: 120000, status: 'batal', metodeBayar: 'tunai' },
  { id: 'TRX-001241', nomorTransaksi: 'TRX-001241', tanggal: '2024-01-15T09:51:00Z', total: 335000, status: 'selesai', metodeBayar: 'qris', namaPelanggan: 'Sari' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'batal': 'bg-red-50 text-red-700 border-red-200',
    'refund': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  const displayStatus = status === 'selesai' ? 'Berhasil' : status === 'batal' ? 'Batal' : status === 'refund' ? 'Refund' : status;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>{displayStatus}</span>;
}

// Fungsi untuk format waktu
function formatWaktu(tanggal: string): string {
  const date = new Date(tanggal);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Fungsi untuk format metode bayar
function formatMetodeBayar(metode: string): string {
  const map: Record<string, string> = {
    'tunai': 'Tunai',
    'kartu': 'Kartu',
    'qris': 'QRIS',
    'transfer': 'Transfer'
  };
  return map[metode] || metode;
}

export function RecentTransactionsTable({ data }: RecentTransactionsTableProps) {
  const transaksiData = data && data.length > 0 ? data : sampleTxns;
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
              {transaksiData.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">{t.nomorTransaksi}</td>
                  <td className="px-3 py-2 text-gray-700">{formatWaktu(t.tanggal)}</td>
                  <td className="px-3 py-2 text-gray-700">-</td>
                  <td className="px-3 py-2 text-gray-700">{t.namaPelanggan || 'Umum'}</td>
                  <td className="px-3 py-2 text-gray-700">{formatMetodeBayar(t.metodeBayar)}</td>
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
