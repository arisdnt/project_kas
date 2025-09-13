import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type UIStokOpname = {
  id: number
  id_produk: number
  nama_produk: string
  sku?: string
  kategori?: { id?: number; nama: string }
  brand?: { id?: number; nama: string }
  supplier?: { id?: number; nama: string }
  stok_sistem?: number
  stok_fisik?: number
  selisih?: number
  status?: 'pending' | 'completed' | 'cancelled'
  tanggal_opname?: string
  dibuat_oleh?: string
  dibuat_pada?: string
  diperbarui_pada?: string
  catatan?: string
}

type StokOpnameListResponse = {
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

const API_BASE = `${config.api.url}:${config.api.port}/api/stok-opname`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapStokOpnameDto(p: any): UIStokOpname {
  return {
    id: p.id,
    id_produk: p.id_produk,
    nama_produk: p.produk?.nama || p.nama_produk || '-',
    sku: p.produk?.sku || p.sku || undefined,
    kategori: p.produk?.kategori ? { id: p.produk.kategori.id, nama: p.produk.kategori.nama } : undefined,
    brand: p.produk?.brand ? { id: p.produk.brand.id, nama: p.produk.brand.nama } : undefined,
    supplier: p.produk?.supplier ? { id: p.produk.supplier.id, nama: p.produk.supplier.nama } : undefined,
    stok_sistem: p.stok_sistem != null ? Number(p.stok_sistem) : undefined,
    stok_fisik: p.stok_fisik != null ? Number(p.stok_fisik) : undefined,
    selisih: p.selisih != null ? Number(p.selisih) : undefined,
    status: p.status || 'pending',
    tanggal_opname: p.tanggal_opname,
    dibuat_oleh: p.dibuat_oleh,
    dibuat_pada: p.dibuat_pada,
    diperbarui_pada: p.diperbarui_pada,
    catatan: p.catatan,
  }
}

type Filters = { 
  kategoriId?: number; 
  brandId?: number; 
  supplierId?: number; 
  status?: 'all' | 'pending' | 'completed' | 'cancelled'
  tanggal?: string
}

type StokOpnameState = {
  items: UIStokOpname[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  filters: Filters
}

type StokOpnameActions = {
  reset: () => void
  setSearch: (v: string) => void
  setFilters: (f: Filters) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createStokOpname: (data: any) => Promise<void>
  updateStokOpname: (id: number, data: any) => Promise<void>
  deleteStokOpname: (id: number) => Promise<void>
  completeStokOpname: (id: number) => Promise<void>
  cancelStokOpname: (id: number) => Promise<void>
  upsertFromRealtime: (p: UIStokOpname) => void
  removeFromRealtime: (id: number) => void
}

export const useStokOpnameStore = create<StokOpnameState & StokOpnameActions>()(
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

    createStokOpname: async (data: any) => {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat stok opname')
      
      const ui = mapStokOpnameDto(js.data)
      set({ items: [ui, ...get().items] })
    },

    updateStokOpname: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate stok opname')
      
      set({
        items: get().items.map((it) =>
          it.id === id
            ? {
                ...it,
                stok_fisik: data.stok_fisik !== undefined ? Number(data.stok_fisik) : it.stok_fisik,
                selisih: data.selisih !== undefined ? Number(data.selisih) : it.selisih,
                status: data.status || it.status,
                catatan: data.catatan || it.catatan,
              }
            : it,
        ),
      })
    },

    deleteStokOpname: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus stok opname')
      set({ items: get().items.filter((x) => x.id !== id) })
    },

    completeStokOpname: async (id: number) => {
      await updateStokOpname(id, { status: 'completed' })
    },

    cancelStokOpname: async (id: number) => {
      await updateStokOpname(id, { status: 'cancelled' })
    },

    upsertFromRealtime: (p: UIStokOpname) => {
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
  set: (partial: Partial<StokOpnameState>) => void,
  get: () => StokOpnameState,
) {
  const { limit, search, filters } = get()
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)
  if (filters.kategoriId) params.set('kategori', String(filters.kategoriId))
  if (filters.brandId) params.set('brand', String(filters.brandId))
  if (filters.supplierId) params.set('supplier', String(filters.supplierId))
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.tanggal) params.set('tanggal', filters.tanggal)

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`, {
      headers: authHeaders(),
    })
    const js: StokOpnameListResponse = await res.json()
    if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat stok opname')
    const newItems = (js.data || []).map(mapStokOpnameDto)
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

export type { UIStokOpname, Filters }