import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UISupplier, SupplierStats, SupplierPurchaseHistory, SupplierProduct } from '@/features/supplier/types/supplier'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type SupplierState = {
  items: UISupplier[]
  page: number
  limit: number
  totalPages: number
  total: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  statusFilter?: 'aktif' | 'nonaktif' | 'blacklist'
}

type SupplierActions = {
  setSearch: (v: string) => void
  setStatusFilter: (status?: 'aktif' | 'nonaktif' | 'blacklist') => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createSupplier: (data: (Partial<UISupplier> & { nama: string }) & { targetTenantId?: string; targetStoreId?: string; applyToAllTenants?: boolean; applyToAllStores?: boolean }) => Promise<void>
  updateSupplier: (id: string, data: Partial<UISupplier> & { nama: string }) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
  getSupplierStats: (id: string) => Promise<SupplierStats>
  getSupplierHistory: (id: string, limit?: number) => Promise<SupplierPurchaseHistory[]>
  getSupplierProducts: (id: string) => Promise<SupplierProduct[]>
  getActiveSuppliers: () => Promise<UISupplier[]>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/supplier`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapResponseData(js: any): { suppliers: UISupplier[]; total?: number; totalPages?: number } {
  if (Array.isArray(js?.data)) {
    return { suppliers: js.data as UISupplier[] }
  }
  if (js?.data?.suppliers) {
    return { suppliers: js.data.suppliers as UISupplier[], total: js.data.total, totalPages: js.data.totalPages }
  }
  return { suppliers: [] }
}

export const useSupplierStore = create<SupplierState & SupplierActions>()(
  devtools((set, get) => ({
    items: [],
    page: 1,
    limit: 25,
    totalPages: 1,
    total: 0,
    hasNext: false,
    loading: false,
    search: '',

    setSearch: (v) => set({ search: v }),
    setStatusFilter: (status) => set({ statusFilter: status }),

    loadFirst: async () => {
      set({ loading: true, error: undefined, page: 1 })
      try {
        const { search, statusFilter, limit } = get()
        const params = new URLSearchParams({
          page: '1',
          limit: limit.toString(),
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter })
        })

        const res = await fetch(`${API_BASE}/search?${params}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat supplier')

        const { suppliers } = mapResponseData(js)
        const pagination = js.pagination || {}

        set({
          items: suppliers,
          page: 1,
          total: pagination.total || 0,
          totalPages: pagination.totalPages || 1,
          hasNext: (pagination.totalPages || 1) > 1,
          loading: false
        })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
      }
    },

    loadNext: async () => {
      const { page, totalPages, loading, hasNext } = get()
      if (loading || !hasNext || page >= totalPages) return

      set({ loading: true })
      try {
        const { search, statusFilter, limit } = get()
        const params = new URLSearchParams({
          page: (page + 1).toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter })
        })

        const res = await fetch(`${API_BASE}/search?${params}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat supplier')

        const { suppliers } = mapResponseData(js)
        const pagination = js.pagination || {}

        set({
          items: [...get().items, ...suppliers],
          page: page + 1,
          hasNext: (page + 1) < (pagination.totalPages || 1),
          loading: false
        })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
      }
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
        body: JSON.stringify(data),
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

    getSupplierStats: async (id) => {
      const res = await fetch(`${API_BASE}/${id}/stats`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat statistik supplier')
      return js.data as SupplierStats
    },

    getSupplierHistory: async (id, limit = 50) => {
      const params = new URLSearchParams({ limit: limit.toString() })
      const res = await fetch(`${API_BASE}/${id}/history?${params}`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat riwayat pembelian')
      return js.data as SupplierPurchaseHistory[]
    },

    getSupplierProducts: async (id) => {
      const res = await fetch(`${API_BASE}/${id}/products`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat produk supplier')
      return js.data as SupplierProduct[]
    },

    getActiveSuppliers: async () => {
      const res = await fetch(`${API_BASE}/active`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat supplier aktif')
      return js.data as UISupplier[]
    },
  }))
)

export type { UISupplier }

