import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ProductFormData } from '@/core/components/ui/product-edit-sidebar'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type UIProduk = {
  id: number
  nama: string
  sku?: string
  kategori?: { id?: number; nama: string }
  brand?: { id?: number; nama: string }
  supplier?: { id?: number; nama: string }
  harga?: number
  hargaBeli?: number
  stok?: number
  dibuatPada?: string
  diperbaruiPada?: string
}

type ProdukListResponse = {
  success: boolean
  data: any[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage?: boolean
  }
  message?: string
}

const API_BASE = `${config.api.url}:${config.api.port}/api/produk`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapProdukDto(p: any): UIProduk {
  const inv = Array.isArray(p.inventaris) && p.inventaris.length > 0 ? p.inventaris[0] : undefined
  return {
    id: p.id,
    nama: p.nama,
    sku: p.sku ?? undefined,
    kategori: p.kategori ? { id: p.kategori.id, nama: p.kategori.nama } : undefined,
    brand: p.brand ? { id: p.brand.id, nama: p.brand.nama } : undefined,
    supplier: p.supplier ? { id: p.supplier.id, nama: p.supplier.nama } : undefined,
    harga: inv?.harga != null ? Number(inv.harga) : undefined,
    hargaBeli: inv?.harga_beli != null ? Number(inv.harga_beli) : undefined,
    stok: inv?.jumlah != null ? Number(inv.jumlah) : undefined,
    dibuatPada: p.dibuat_pada || p.dibuatPada,
    diperbaruiPada: p.diperbarui_pada || p.diperbaruiPada,
  }
}

type Filters = { kategoriId?: number; brandId?: number; supplierId?: number }

type ProdukState = {
  items: UIProduk[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  filters: Filters
}

type ProdukActions = {
  reset: () => void
  setSearch: (v: string) => void
  setFilters: (f: Filters) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createProduk: (data: ProductFormData) => Promise<void>
  updateProduk: (id: number, data: ProductFormData) => Promise<void>
  deleteProduk: (id: number) => Promise<void>
  upsertFromRealtime: (p: UIProduk) => void
  removeFromRealtime: (id: number) => void
}

export const useProdukStore = create<ProdukState & ProdukActions>()(
  devtools((set, get) => ({
    items: [],
    page: 1,
    limit: 25,
    hasNext: true,
    loading: false,
    search: '',
    filters: {},

    reset: () => set({ items: [], page: 1, hasNext: true, error: undefined }),
    setSearch: (v) => set({ search: v }),
    setFilters: (f) => set({ filters: f }),

    loadFirst: async () => {
      set({ loading: true, page: 1, error: undefined })
      await fetchPage(1, set, get)
    },

    loadNext: async () => {
      const { loading, hasNext, page } = get()
      if (loading || !hasNext) return
      set({ loading: true })
      await fetchPage(page + 1, set, get)
    },

    createProduk: async (data: ProductFormData) => {
      // 1) Create produk
      const res = await fetch(`${API_BASE}/produk`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nama: data.nama,
          deskripsi: data.deskripsi || undefined,
          sku: data.kode,
        }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat produk')
      const created = js.data

      // 2) Upsert inventaris (harga/stok)
      await fetch(`${API_BASE}/inventaris`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          id_produk: created.id,
          jumlah: Number(data.stok) || 0,
          harga: Number(data.hargaJual) || 0,
          harga_beli: Number(data.hargaBeli) || undefined,
        }),
      })

      // 3) Optimistically prepend to list
      const ui = mapProdukDto({
        ...created,
        inventaris: [
          {
            id_produk: created.id,
            jumlah: Number(data.stok) || 0,
            harga: Number(data.hargaJual) || 0,
            harga_beli: Number(data.hargaBeli) || undefined,
          },
        ],
      })
      set({ items: [ui, ...get().items] })
    },

    updateProduk: async (id: number, data: ProductFormData) => {
      // 1) Update produk
      const res = await fetch(`${API_BASE}/produk/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          id,
          nama: data.nama,
          deskripsi: data.deskripsi || undefined,
          sku: data.kode,
        }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate produk')

      // 2) Upsert inventaris
      await fetch(`${API_BASE}/inventaris`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          id_produk: id,
          jumlah: Number(data.stok) || 0,
          harga: Number(data.hargaJual) || 0,
          harga_beli: Number(data.hargaBeli) || undefined,
        }),
      })

      // 3) Update list locally
      set({
        items: get().items.map((it) =>
          it.id === id
            ? {
                ...it,
                nama: data.nama,
                sku: data.kode,
                harga: Number(data.hargaJual) || 0,
                hargaBeli: Number(data.hargaBeli) || undefined,
                stok: Number(data.stok) || 0,
              }
            : it,
        ),
      })
    },

    deleteProduk: async (id: number) => {
      const res = await fetch(`${API_BASE}/produk/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus produk')
      set({ items: get().items.filter((x) => x.id !== id) })
    },

    upsertFromRealtime: (p: UIProduk) => {
      const exists = get().items.find((x) => x.id === p.id)
      if (exists) {
        set({ items: get().items.map((x) => (x.id === p.id ? { ...x, ...p } : x)) })
      } else {
        set({ items: [p, ...get().items] })
      }
    },

    removeFromRealtime: (id: number) => {
      set({ items: get().items.filter((x) => x.id !== id) })
    },
  }))
)

async function fetchPage(
  page: number,
  set: (partial: Partial<ProdukState>) => void,
  get: () => ProdukState,
) {
  const { limit, search, filters } = get()
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)
  if (filters.kategoriId) params.set('kategori', String(filters.kategoriId))
  if (filters.brandId) params.set('brand', String(filters.brandId))
  if (filters.supplierId) params.set('supplier', String(filters.supplierId))

  try {
    const res = await fetch(`${API_BASE}/produk?${params.toString()}`, {
      headers: authHeaders(),
    })
    const js: ProdukListResponse = await res.json()
    if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat produk')
    const newItems = (js.data || []).map(mapProdukDto)
    const hasNext = Boolean(js.pagination?.hasNextPage ?? (js.pagination ? page < (js.pagination.totalPages || 1) : false))
    set({
      items: page === 1 ? newItems : [...get().items, ...newItems],
      page,
      hasNext,
      loading: false,
    })
  } catch (e: any) {
    set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
  }
}

export type { UIProduk, Filters }

