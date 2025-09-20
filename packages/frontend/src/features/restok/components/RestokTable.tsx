import { useRestokStore, RestokItem } from '@/features/restok/store/restokStore';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Trash2, Minus, Plus } from 'lucide-react';

type Props = {
  items: RestokItem[];
};

export function RestokTable({ items }: Props) {
  const inc = useRestokStore((s) => s.inc);
  const dec = useRestokStore((s) => s.dec);
  const setQty = useRestokStore((s) => s.setQty);
  const setHargaBeli = useRestokStore((s) => s.setHargaBeli);
  const remove = useRestokStore((s) => s.remove);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 text-sm text-gray-600">
            <th className="text-left px-3 py-2">Produk</th>
            <th className="text-right px-3 py-2 w-44">Harga Beli</th>
            <th className="text-center px-3 py-2 w-40">Qty</th>
            <th className="text-right px-3 py-2 w-40">Total</th>
            <th className="px-2 py-2 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((it) => (
            <tr key={it.id} className="text-sm">
              <td className="px-3 py-2">
                <div className="font-medium text-gray-900">{it.nama}</div>
                <div className="text-xs text-gray-500">{it.sku || '-'}</div>
              </td>
              <td className="px-3 py-2 text-right">
                <Input
                  type="number"
                  className="text-right h-8"
                  value={String(it.hargaBeli)}
                  onChange={(e) => setHargaBeli(it.id, Number(e.target.value))}
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-center space-x-2">
                  <Button variant="secondary" className="h-7 px-2" onClick={() => dec(it.id)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    className="w-14 text-center border rounded-md py-1 text-sm"
                    value={it.qty}
                    onChange={(e) => setQty(it.id, Number(e.target.value))}
                  />
                  <Button variant="secondary" className="h-7 px-2" onClick={() => inc(it.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </td>
              <td className="px-3 py-2 text-right font-medium">{formatCurrency(it.hargaBeli * it.qty)}</td>
              <td className="px-2 py-2 text-right">
                <Button variant="destructive" className="h-8 w-8 p-0" onClick={() => remove(it.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500 text-sm" colSpan={5}>
                Daftar restok kosong. Pindai barcode atau cari produk.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

