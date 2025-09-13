import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { config } from '@/core/config'

export type CartItem = {
  id: number
  nama: string
  sku?: string
  harga: number
  qty: number
}

type KasirState = {
  items: CartItem[]
  taxRate: number
  bayar: number
  metode: 'TUNAI' | 'KARTU' | 'QRIS' | 'TRANSFER' | 'EWALLET'
  pelanggan?: { id: number; nama?: string | null } | null
  discountType: 'nominal' | 'percent'
  discountValue: number
}

type KasirActions = {
  clear: () => void
  addProduct: (p: UIProduk) => void
  addByBarcode: (kode: string) => void
  inc: (id: number) => void
  dec: (id: number) => void
  setQty: (id: number, qty: number) => void
  remove: (id: number) => void
  setBayar: (v: number) => void
  setMetode: (m: KasirState['metode']) => void
  setPelanggan: (p: KasirState['pelanggan']) => void
  setDiscountType: (t: KasirState['discountType']) => void
  setDiscountValue: (v: number) => void
}

export const useKasirStore = create<KasirState & KasirActions>()(
  devtools((set, get) => ({
    items: [],
    taxRate: Number(config.pajak.tarifDefault || 0),
    bayar: 0,
    metode: 'TUNAI',
    pelanggan: null,
    discountType: 'nominal',
    discountValue: 0,

    clear: () => set({ items: [], bayar: 0, pelanggan: null, metode: 'TUNAI', discountType: 'nominal', discountValue: 0 }),

    addProduct: (p: UIProduk) => {
      if (p.harga == null) return
      const exists = get().items.find((x) => x.id === p.id)
      if (exists) {
        set({ items: get().items.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x)) })
      } else {
        set({
          items: [
            ...get().items,
            {
              id: p.id,
              nama: p.nama,
              sku: p.sku,
              harga: Number(p.harga || 0),
              qty: 1,
            },
          ],
        })
      }
    },

    addByBarcode: (kode: string) => {
      const { items: produkItems } = useProdukStore.getState()
      const found = produkItems.find((x) => x.sku && x.sku.toLowerCase() === kode.trim().toLowerCase())
      if (found) {
        get().addProduct(found)
      }
      // Note: if not found, keep silent. In future, fetch by API.
    },

    inc: (id: number) => set({ items: get().items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) }),
    dec: (id: number) =>
      set({
        items: get().items
          .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
          .filter((x) => x.qty > 0),
      }),
    setQty: (id: number, qty: number) =>
      set({ items: get().items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.floor(qty) || 1) } : x)) }),
    remove: (id: number) => set({ items: get().items.filter((x) => x.id !== id) }),
    setBayar: (v: number) => set({ bayar: isFinite(v) ? Math.max(0, v) : 0 }),
    setMetode: (m) => set({ metode: m }),
    setPelanggan: (p) => set({ pelanggan: p || null }),
    setDiscountType: (t) => set({ discountType: t }),
    setDiscountValue: (v) => set({ discountValue: isFinite(v) ? Math.max(0, v) : 0 }),
  }))
)

export function useKasirTotals() {
  const { items, taxRate, bayar, metode, discountType, discountValue } = useKasirStore()
  const includeTax = config.pajak.termasukDalamHarga
  const gross = items.reduce((sum, it) => sum + it.harga * it.qty, 0)
  const discount = discountType === 'percent' ? gross * (Math.min(100, Math.max(0, discountValue)) / 100) : Math.min(gross, Math.max(0, discountValue))
  const afterDiscount = Math.max(0, gross - discount)
  let subtotal = 0
  let pajak = 0
  let total = 0
  if (includeTax) {
    total = afterDiscount
    const net = taxRate > 0 ? afterDiscount / (1 + taxRate) : afterDiscount
    pajak = Math.max(0, total - net)
    subtotal = net
  } else {
    subtotal = afterDiscount
    pajak = subtotal * taxRate
    total = subtotal + pajak
  }
  const kembalian = metode === 'TUNAI' ? Math.max(0, bayar - total) : 0
  return { subtotal, pajak, total, kembalian, taxRate, bayar, gross, discount, afterDiscount, includeTax, discountType, discountValue }
}
