import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type UIInventaris = {
  id: number
  id_produk: number
  nama_produk: string
  sku?: string
  kategori?: { id?: number; nama: string }
  brand?: { id?: number; nama: string }
  supplier?: { id?: number; nama: string }
  harga?: number
  harga_beli?: number
  jumlah?: number
  dibuat_pada?: string
  diperbarui_pada?: string
}

type InventarisListResponse = {
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

const API_BASE = `${config.api.url}:${config.api.port}/api/inventaris`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapInventarisDto(p: any): UIInventaris {
  return {
    id: p.id,
    id_produk: p.id_produk,
    nama_produk: p.produk?.nama || p.nama_produk || '-',
    sku: p.produk?.sku || p.sku || undefined,
    kategori: p.produk?.kategori ? { id: p.produk.kategori.id, nama: p.produk.kategori.nama } : undefined,
    brand: p.produk?.brand ? { id: p.produk.brand.id, nama: p.produk.brand.nama } : undefined,
    supplier: p.produk?.supplier ? { id: p.produk.supplier.id, nama: p.produk.supplier.nama } : undefined,
    harga: p.harga != null ? Number(p.harga) : undefined,
    harga_beli: p.harga_beli != null ? Number(p.harga_beli) : undefined,
    jumlah: p.jumlah != null ? Number(p.jumlah) : undefined,
    dibuat_pada: p.dibuat_pada,
    diperbarui_pada: p.diperbarui_pada,
  }
}

type Filters = { kategoriId?: number; brandId?: number; supplierId?: number; stockFilter?: 'ALL' | 'LOW' | 'OUT' }

type InventarisState = {
  items: UIInventaris[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  filters: Filters
}

type InventarisActions = {
  reset: () => void
  setSearch: (v: string) => void
  setFilters: (f: Filters) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  updateInventaris: (id: number, data: any) => Promise<void>
  deleteInventaris: (id: number) => Promise<void>
  upsertFromRealtime: (p: UIInventaris) => void
  removeFromRealtime: (id: number) => void
}

export const useInventarisStore = create<InventarisState & InventarisActions>()(
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

    updateInventaris: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id, ...data }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate inventaris')
      
      set({
        items: get().items.map((it) =>
          it.id === id
            ? {
                ...it,
                jumlah: data.jumlah !== undefined ? Number(data.jumlah) : it.jumlah,
                harga: data.harga !== undefined ? Number(data.harga) : it.harga,
                harga_beli: data.harga_beli !== undefined ? Number(data.harga_beli) : it.harga_beli,
              }
            : it,
        ),
      })
    },

    deleteInventaris: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus inventaris')
      set({ items: get().items.filter((x) => x.id !== id) })
    },

    upsertFromRealtime: (p: UIInventaris) => {
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
  set: (partial: Partial<InventarisState>) => void,
  get: () => InventarisState,
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
    const res = await fetch(`${API_BASE}?${params.toString()}`, {
      headers: authHeaders(),
    })
    const js: InventarisListResponse = await res.json()
    if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat inventaris')
    const newItems = (js.data || []).map(mapInventarisDto)
    
    // Apply client-side stock filter
    let filteredItems = newItems
    if (filters.stockFilter === 'LOW') {
      filteredItems = newItems.filter(item => (item.jumlah ?? 0) > 0 && (item.jumlah ?? 0) < 10)
    } else if (filters.stockFilter === 'OUT') {
      filteredItems = newItems.filter(item => (item.jumlah ?? 0) <= 0)
    }
    
    const hasNext = Boolean(js.pagination?.hasNextPage ?? (js.pagination ? page < (js.pagination.totalPages || 1) : false))
    set({
      items: page === 1 ? filteredItems : [...get().items, ...filteredItems],
      page,
      hasNext,
      loading: false,
    })
  } catch (e: any) {
    set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
  }
}

export type { UIInventaris, Filters }