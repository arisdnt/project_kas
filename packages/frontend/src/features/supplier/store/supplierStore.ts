import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UISupplier } from '@/features/supplier/types/supplier'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type SupplierState = {
  items: UISupplier[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
}

type SupplierActions = {
  setSearch: (v: string) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createSupplier: (data: Partial<UISupplier> & { nama: string }) => Promise<void>
  updateSupplier: (id: number, data: Partial<UISupplier> & { nama: string }) => Promise<void>
  deleteSupplier: (id: number) => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/produk/supplier`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapResponseData(js: any): { suppliers: UISupplier[]; total?: number; totalPages?: number } {
  if (js?.data?.suppliers) {
    return { suppliers: js.data.suppliers as UISupplier[], total: js.data.total, totalPages: js.data.totalPages }
  }
  if (Array.isArray(js?.data)) {
    return { suppliers: js.data as UISupplier[] }
  }
  return { suppliers: [] }
}

export const useSupplierStore = create<SupplierState & SupplierActions>()(
  devtools((set, get) => ({
    items: [],
    page: 1,
    limit: 25,
    hasNext: false,
    loading: false,
    search: '',

    setSearch: (v) => set({ search: v }),

    loadFirst: async () => {
      set({ loading: true, error: undefined, page: 1 })
      try {
        const res = await fetch(`${API_BASE}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat supplier')
        const { suppliers, totalPages } = mapResponseData(js)
        const filtered = suppliers.filter((s) => s.nama.toLowerCase().includes(get().search.trim().toLowerCase()))
        set({ items: filtered, page: 1, hasNext: (totalPages ?? 1) > 1, loading: false })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
      }
    },

    loadNext: async () => {
      // Backend belum expose pagination via query di controller; graceful no-op
      set({ hasNext: false })
    },

    createSupplier: async (data) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat supplier')
      const created: UISupplier = js.data
      set({ items: [created, ...get().items] })
    },

    updateSupplier: async (id, data) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...data, id }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate supplier')
      set({ items: get().items.map((s) => (s.id === id ? { ...s, ...data } as UISupplier : s)) })
    },

    deleteSupplier: async (id) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus supplier')
      set({ items: get().items.filter((s) => s.id !== id) })
    },
  }))
)

export type { UISupplier }

