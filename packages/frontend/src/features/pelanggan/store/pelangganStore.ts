import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UIPelanggan, PelangganStats, PelangganTransactionHistory, PelangganPoinLog, PelangganSegmentation, PelangganLoyaltyReport } from '@/features/pelanggan/types/pelanggan'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type PelangganState = {
  items: UIPelanggan[]
  page: number
  limit: number
  totalPages: number
  total: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  typeFilter?: 'reguler' | 'vip' | 'member' | 'wholesale'
  statusFilter?: 'aktif' | 'nonaktif' | 'blacklist'
}

type PelangganActions = {
  setSearch: (v: string) => void
  setTypeFilter: (type?: 'reguler' | 'vip' | 'member' | 'wholesale') => void
  setStatusFilter: (status?: 'aktif' | 'nonaktif' | 'blacklist') => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createPelanggan: (data: (Partial<UIPelanggan> & { nama: string }) & { targetTenantId?: string; targetStoreId?: string; applyToAllTenants?: boolean; applyToAllStores?: boolean }) => Promise<void>
  updatePelanggan: (id: string, data: Partial<UIPelanggan> & { nama: string }) => Promise<void>
  deletePelanggan: (id: string) => Promise<void>
  getPelangganStats: (id: string) => Promise<PelangganStats>
  getTransactionHistory: (id: string, limit?: number) => Promise<PelangganTransactionHistory[]>
  getPointsHistory: (id: string, limit?: number) => Promise<PelangganPoinLog[]>
  getActivePelanggan: () => Promise<UIPelanggan[]>
  getSegmentation: () => Promise<PelangganSegmentation[]>
  getLoyaltyReport: (limit?: number) => Promise<PelangganLoyaltyReport[]>
  adjustPoints: (id: string, adjustment: number, reason: string, transaksi_id?: string) => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/pelanggan`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapResponseData(js: any): { pelanggan: UIPelanggan[]; total?: number; totalPages?: number } {
  if (Array.isArray(js?.data)) {
    return { pelanggan: js.data as UIPelanggan[] }
  }
  if (js?.data?.pelanggan) {
    return { pelanggan: js.data.pelanggan as UIPelanggan[], total: js.data.total, totalPages: js.data.totalPages }
  }
  return { pelanggan: [] }
}

export const usePelangganStore = create<PelangganState & PelangganActions>()(
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
    setTypeFilter: (type) => set({ typeFilter: type }),
    setStatusFilter: (status) => set({ statusFilter: status }),

    search: async (query: string) => {
      if (!query.trim()) {
        set({ items: [] })
        return
      }

      set({ loading: true, error: undefined })
      try {
        const params = new URLSearchParams({
          search: query.trim(),
          limit: '20',
          page: '1'
        })

        const res = await fetch(`${API_BASE}?${params}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mencari pelanggan')

        const { pelanggan } = mapResponseData(js)
        set({ items: pelanggan, loading: false })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan', items: [] })
      }
    },

    loadFirst: async () => {
      set({ loading: true, error: undefined, page: 1 })
      try {
        const { search, typeFilter, statusFilter, limit } = get()
        const params = new URLSearchParams({
          page: '1',
          limit: limit.toString(),
          ...(search && { search }),
          ...(typeFilter && { tipe: typeFilter }),
          ...(statusFilter && { status: statusFilter })
        })

        const res = await fetch(`${API_BASE}?${params}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat pelanggan')

        const { pelanggan } = mapResponseData(js)
        const pagination = js.pagination || {}

        set({
          items: pelanggan,
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
        const { search, typeFilter, statusFilter, limit } = get()
        const params = new URLSearchParams({
          page: (page + 1).toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(typeFilter && { tipe: typeFilter }),
          ...(statusFilter && { status: statusFilter })
        })

        const res = await fetch(`${API_BASE}?${params}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat pelanggan')

        const { pelanggan } = mapResponseData(js)
        const pagination = js.pagination || {}

        set({
          items: [...get().items, ...pelanggan],
          page: page + 1,
          hasNext: (page + 1) < (pagination.totalPages || 1),
          loading: false
        })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
      }
    },

    createPelanggan: async (data) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat pelanggan')
      const created: UIPelanggan = js.data
      set({ items: [created, ...get().items] })
    },

    updatePelanggan: async (id, data) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate pelanggan')
      set({ items: get().items.map((p) => (p.id === id ? { ...p, ...data } as UIPelanggan : p)) })
    },

    deletePelanggan: async (id) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus pelanggan')
      set({ items: get().items.filter((p) => p.id !== id) })
    },

    getPelangganStats: async (id) => {
      const res = await fetch(`${API_BASE}/${id}/stats`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat statistik pelanggan')
      return js.data as PelangganStats
    },

    getTransactionHistory: async (id, limit = 50) => {
      const params = new URLSearchParams({ limit: limit.toString() })
      const res = await fetch(`${API_BASE}/${id}/transactions?${params}`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat riwayat transaksi')
      return js.data as PelangganTransactionHistory[]
    },

    getPointsHistory: async (id, limit = 50) => {
      const params = new URLSearchParams({ limit: limit.toString() })
      const res = await fetch(`${API_BASE}/${id}/points-history?${params}`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat riwayat poin')
      return js.data as PelangganPoinLog[]
    },

    getActivePelanggan: async () => {
      const res = await fetch(`${API_BASE}/active`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat pelanggan aktif')
      return js.data as UIPelanggan[]
    },

    getSegmentation: async () => {
      const res = await fetch(`${API_BASE}/segmentation`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat segmentasi pelanggan')
      return js.data as PelangganSegmentation[]
    },

    getLoyaltyReport: async (limit = 100) => {
      const params = new URLSearchParams({ limit: limit.toString() })
      const res = await fetch(`${API_BASE}/loyalty-report?${params}`, { headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat laporan loyalitas')
      return js.data as PelangganLoyaltyReport[]
    },

    adjustPoints: async (id, adjustment, reason, transaksi_id) => {
      const res = await fetch(`${API_BASE}/${id}/adjust-points`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ adjustment, reason, transaksi_id }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menyesuaikan poin')

      // Refresh the customer data to show updated points
      const customer = get().items.find(p => p.id === id)
      if (customer) {
        const updatedCustomer = { ...customer, saldo_poin: customer.saldo_poin + adjustment }
        set({ items: get().items.map((p) => (p.id === id ? updatedCustomer : p)) })
      }
    },
  }))
)

export type { PelangganActions }

