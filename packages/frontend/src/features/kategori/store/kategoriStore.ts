import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UIKategori } from '@/features/kategori/types/kategori'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type KategoriState = {
  all: UIKategori[]
  items: UIKategori[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
}

type KategoriActions = {
  setSearch: (v: string) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createKategori: (nama: string) => Promise<void>
  updateKategori: (id: number, nama: string) => Promise<void>
  deleteKategori: (id: number) => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/produk/kategori`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function filterAndSlice(all: UIKategori[], search: string, page: number, limit: number) {
  const q = search.trim().toLowerCase()
  const filtered = q ? all.filter((k) => k.nama.toLowerCase().includes(q)) : all
  const start = 0
  const end = page * limit
  const slice = filtered.slice(start, end)
  const hasNext = end < filtered.length
  return { slice, hasNext }
}

export const useKategoriStore = create<KategoriState & KategoriActions>()(
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
        // backend returns all kategori (no pagination). cache in `all` then slice locally
        const res = await fetch(API_BASE, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat kategori')
        const all: UIKategori[] = (js.data || [])
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
      // slice already contains all up to `nextPage * limit`
      set({ items: slice, page: nextPage, hasNext: nextHas, loading: false })
    },

    createKategori: async (nama: string) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nama }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat kategori')
      const created: UIKategori = js.data
      const all = [created, ...get().all]
      const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
      set({ all, items: slice, page: 1, hasNext })
    },

    updateKategori: async (id: number, nama: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id, nama }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate kategori')
      const all = get().all.map((k) => (k.id === id ? { ...k, nama } : k))
      const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit)
      set({ all, items: slice, hasNext })
    },

    deleteKategori: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus kategori')
      const all = get().all.filter((k) => k.id !== id)
      const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
      set({ all, items: slice, page: 1, hasNext })
    },
  }))
)

export type { UIKategori }
