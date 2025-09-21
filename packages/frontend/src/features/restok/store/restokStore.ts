import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore';

export type RestokItem = {
  id: string; // Changed from number to string (UUID compatible)
  nama: string;
  sku?: string;
  qty: number;
  hargaBeli: number;
};

type RestokState = {
  items: RestokItem[];
};

type RestokActions = {
  clear: () => void;
  addProduct: (p: UIProduk) => void;
  addByBarcode: (kode: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setHargaBeli: (id: string, harga: number) => void;
  remove: (id: string) => void;
};

export const useRestokStore = create<RestokState & RestokActions>()(
  devtools(
    persist(
      (set, get) => ({
    items: [],

    clear: () => set({ items: [] }),

    addProduct: (p: UIProduk) => {
      const exists = get().items.find((x) => x.id === p.id.toString());
      if (exists) {
        set({ items: get().items.map((x) => (x.id === p.id.toString() ? { ...x, qty: x.qty + 1 } : x)) });
      } else {
        set({
          items: [
            ...get().items,
            {
              id: p.id.toString(), // Ensure string conversion
              nama: p.nama,
              sku: p.sku,
              qty: 1,
              hargaBeli: Number(p.hargaBeli || 0),
            },
          ],
        });
      }
    },

    addByBarcode: (kode: string) => {
      const { items: produkItems } = useProdukStore.getState();
      const found = produkItems.find(
        (x) => x.sku && x.sku.toLowerCase() === kode.trim().toLowerCase()
      );
      if (found) {
        get().addProduct(found);
      }
    },

    inc: (id: string) => set({ items: get().items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) }),
    dec: (id: string) =>
      set({
        items: get().items
          .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
          .filter((x) => x.qty > 0),
      }),
    setQty: (id: string, qty: number) =>
      set({ items: get().items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.floor(qty) || 1) } : x)) }),
    setHargaBeli: (id: string, harga: number) =>
      set({ items: get().items.map((x) => (x.id === id ? { ...x, hargaBeli: Math.max(0, Number(harga) || 0) } : x)) }),
    remove: (id: string) => set({ items: get().items.filter((x) => x.id !== id) }),
      }),
      {
        name: 'restok-cart-storage',
      }
    )
  )
);

export function useRestokTotals() {
  const { items } = useRestokStore();
  const subtotal = items.reduce((sum, it) => sum + it.hargaBeli * it.qty, 0);
  return { subtotal, itemCount: items.length };
}
