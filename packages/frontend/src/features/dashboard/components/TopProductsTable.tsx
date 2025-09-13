import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

interface TopProduct {
  sku: string;
  nama: string;
  qty: number;
  pendapatan: number;
}

const sampleTop: TopProduct[] = [
  { sku: 'SKU-001', nama: 'Kopi Arabika 200g', qty: 86, pendapatan: 2580000 },
  { sku: 'SKU-114', nama: 'Teh Melati 50s', qty: 72, pendapatan: 1296000 },
  { sku: 'SKU-207', nama: 'Gula 1kg', qty: 68, pendapatan: 952000 },
  { sku: 'SKU-332', nama: 'Susu UHT 1L', qty: 55, pendapatan: 1210000 },
  { sku: 'SKU-415', nama: 'Mi Instan Ayam Bawang', qty: 51, pendapatan: 204000 },
];

export function TopProductsTable() {
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
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Nama</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleTop.map((p) => (
                <tr key={p.sku} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">{p.sku}</td>
                  <td className="px-3 py-2 text-gray-700">{p.nama}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{p.qty}</td>
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
