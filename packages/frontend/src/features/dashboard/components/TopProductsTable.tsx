import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { ProdukTerlaris } from '@/features/dashboard/services/dashboardService';

interface TopProductsTableProps {
  data?: ProdukTerlaris[];
  loading?: boolean;
}

export function TopProductsTable({ data, loading }: TopProductsTableProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Memuat produk terlaris...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Tidak ada data produk terlaris</p>
              <p className="text-sm mt-1">Data akan muncul setelah ada penjualan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
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
              {data.map((p) => (
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
