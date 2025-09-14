import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { ProdukTerlaris } from '@/features/dashboard/services/dashboardService';

interface TopProductsTableProps {
  data?: ProdukTerlaris[];
}

// Data dummy sebagai fallback
const sampleTop: ProdukTerlaris[] = [
  { id: 'SKU-001', nama: 'Kopi Arabika 200g', totalTerjual: 86, pendapatan: 2580000, hargaJual: 30000, kategori: 'Minuman' },
  { id: 'SKU-114', nama: 'Teh Melati 50s', totalTerjual: 72, pendapatan: 1296000, hargaJual: 18000, kategori: 'Minuman' },
  { id: 'SKU-207', nama: 'Gula 1kg', totalTerjual: 68, pendapatan: 952000, hargaJual: 14000, kategori: 'Sembako' },
  { id: 'SKU-332', nama: 'Susu UHT 1L', totalTerjual: 55, pendapatan: 1210000, hargaJual: 22000, kategori: 'Minuman' },
  { id: 'SKU-415', nama: 'Mi Instan Ayam Bawang', totalTerjual: 51, pendapatan: 204000, hargaJual: 4000, kategori: 'Makanan' },
];

export function TopProductsTable({ data }: TopProductsTableProps) {
  const produkData = data && data.length > 0 ? data : sampleTop;
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">Produk Terlaris</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="table-scroll-container max-h-80">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Nama</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {produkData.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">{p.id}</td>
                  <td className="px-3 py-2 text-gray-700">{p.nama}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{p.totalTerjual}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">Rp{p.pendapatan.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
