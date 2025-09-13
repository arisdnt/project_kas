import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UIBrand } from '@/features/brand/types/brand'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type BrandState = {
  all: UIBrand[]
  items: UIBrand[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
}

type BrandActions = {
  setSearch: (v: string) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createBrand: (nama: string) => Promise<void>
  updateBrand: (id: number, nama: string) => Promise<void>
  deleteBrand: (id: number) => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/produk/brand`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function filterAndSlice(all: UIBrand[], search: string, page: number, limit: number) {
  const q = search.trim().toLowerCase()
  const filtered = q ? all.filter((b) => b.nama.toLowerCase().includes(q)) : all
  const start = 0
  const end = page * limit
  const slice = filtered.slice(start, end)
  const hasNext = end < filtered.length
  return { slice, hasNext }
}

export const useBrandStore = create<BrandState & BrandActions>()(
  devtools((set, get) => ({
    all: [],
    items: [],
    page: 1,
    limit: 25,
    hasNext: true,
    loading: false,
    search: '',

    setSearch: (v) => set({ search: v }),

    loadFirst: async () => {
      set({ loading: true, error: undefined, page: 1 })
      try {
        const res = await fetch(API_BASE, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat brand')
        const all: UIBrand[] = (js.data || [])
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext, loading: false })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
      }
    },

    loadNext: async () => {
      const { loading, hasNext, page, all, limit, search } = get()
      if (loading || !hasNext) return
      set({ loading: true })
      const nextPage = page + 1
      const { slice, hasNext: nextHas } = filterAndSlice(all, search, nextPage, limit)
      set({ items: slice, page: nextPage, hasNext: nextHas, loading: false })
    },

    createBrand: async (nama: string) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nama }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat brand')
      const created: UIBrand = js.data
      const all = [created, ...get().all]
      const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
      set({ all, items: slice, page: 1, hasNext })
    },

    updateBrand: async (id: number, nama: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id, nama }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate brand')
      const all = get().all.map((b) => (b.id === id ? { ...b, nama } : b))
      const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit)
      set({ all, items: slice, hasNext })
    },

    deleteBrand: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus brand')
      const all = get().all.filter((b) => b.id !== id)
      const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
      set({ all, items: slice, page: 1, hasNext })
    },
  }))
)

export type { UIBrand }

