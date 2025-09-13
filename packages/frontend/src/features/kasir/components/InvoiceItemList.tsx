import { CartItem } from '@/features/kasir/store/kasirStore'

type Props = {
  items: CartItem[]
}

export function InvoiceItemList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="px-2 py-4 text-center text-gray-500 text-sm">
        Keranjang kosong
      </div>
    )
  }

  return (
    <div className="max-h-80 overflow-y-auto divide-y divide-dotted divide-gray-300">
      {items.map((it) => (
        <div key={it.id} className="py-2">
          {/* Baris 1: Nama (kiri) • Subtotal (kanan) */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-medium text-gray-900 truncate" title={it.nama}>{it.nama}</div>
            <div className="text-sm font-bold text-gray-900 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(it.harga * it.qty)}
            </div>
          </div>
          {/* Baris 2: SKU (kiri) • qty x harga (kanan) */}
          <div className="mt-0.5 flex items-center justify-between text-xs text-gray-600">
            <span className="font-mono truncate">{it.sku || ''}</span>
            <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {it.qty} × {formatCurrency(it.harga)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
}
