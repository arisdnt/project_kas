import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'

export type RestockItem = {
  id: number
  nama: string
  sku?: string
  qty: number
  hargaBeli: number
}

type PembelianState = {
  items: RestockItem[]
}

type PembelianActions = {
  clear: () => void
  addProduct: (p: UIProduk) => void
  addByBarcode: (kode: string) => void
  inc: (id: number) => void
  dec: (id: number) => void
  setQty: (id: number, qty: number) => void
  setHargaBeli: (id: number, harga: number) => void
  remove: (id: number) => void
}

export const usePembelianStore = create<PembelianState & PembelianActions>()(
  devtools((set, get) => ({
    items: [],

    clear: () => set({ items: [] }),

    addProduct: (p: UIProduk) => {
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
              qty: 1,
              hargaBeli: Number(p.hargaBeli || 0),
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
    setHargaBeli: (id: number, harga: number) =>
      set({ items: get().items.map((x) => (x.id === id ? { ...x, hargaBeli: Math.max(0, Number(harga) || 0) } : x)) }),
    remove: (id: number) => set({ items: get().items.filter((x) => x.id !== id) }),
  }))
)

export function usePembelianTotals() {
  const { items } = usePembelianStore()
  const subtotal = items.reduce((sum, it) => sum + it.hargaBeli * it.qty, 0)
  return { subtotal, itemCount: items.length }
}

