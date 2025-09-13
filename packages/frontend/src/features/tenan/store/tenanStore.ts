import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '@/core/lib/api'
import { Tenan, CreateTenanDto, UpdateTenanDto } from '@/features/tenan/types/tenan'

type TenanState = {
  all: Tenan[]
  items: Tenan[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
}

type TenanActions = {
  setSearch: (v: string) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createTenan: (payload: CreateTenanDto) => Promise<void>
  updateTenan: (id: string, payload: UpdateTenanDto) => Promise<void>
  deleteTenan: (id: string) => Promise<void>
}

// Local fallback when API is not available
const mockTenan: Tenan[] = [
  {
    id: 'ten-001',
    nama: 'Default Tenant',
    email: 'admin@kasir.com',
    telepon: '081234567890',
    alamat: 'Jakarta, Indonesia',
    status: 'aktif',
    paket: 'enterprise',
    max_toko: 10,
    max_pengguna: 50,
    dibuat_pada: new Date().toISOString(),
    diperbarui_pada: new Date().toISOString(),
  },
]

function filterAndSlice(all: Tenan[], search: string, page: number, limit: number) {
  const q = search.trim().toLowerCase()
  const filtered = q
    ? all.filter(
        (t) =>
          t.nama.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          (t.telepon || '').toLowerCase().includes(q) ||
          (t.alamat || '').toLowerCase().includes(q)
      )
    : all
  const start = 0
  const end = page * limit
  const slice = filtered.slice(start, end)
  const hasNext = end < filtered.length
  return { slice, hasNext }
}

export const useTenanStore = create<TenanState & TenanActions>()(
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
        // Try API first
        const data = await api.get<{ success?: boolean; data?: Tenan[]; tenants?: Tenan[] }>(
          '/tenants'
        )
        const list: Tenan[] = (data as any)?.data || (data as any)?.tenants || []
        const all = list.length ? list : mockTenan
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext, loading: false })
      } catch {
        // Fallback to mock when API is unavailable
        const all = mockTenan
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext, loading: false })
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

    createTenan: async (payload: CreateTenanDto) => {
      try {
        const data = await api.post<{ success?: boolean; data?: Tenan; tenant?: Tenan }>(
          '/tenants',
          payload
        )
        const created: Tenan = (data as any)?.data || (data as any)?.tenant
        if (!created) throw new Error('Response tidak valid')
        const all = [created, ...get().all]
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext })
      } catch (e) {
        // If API missing, emulate creation locally for UX continuity
        const local: Tenan = {
          id: `local-${Date.now()}`,
          nama: payload.nama,
          email: payload.email,
          telepon: payload.telepon,
          alamat: payload.alamat,
          status: payload.status || 'aktif',
          paket: payload.paket || 'basic',
          max_toko: payload.max_toko ?? 1,
          max_pengguna: payload.max_pengguna ?? 5,
          dibuat_pada: new Date().toISOString(),
          diperbarui_pada: new Date().toISOString(),
        }
        const all = [local, ...get().all]
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext })
        // Re-throw to let UI show a toast about offline mode if needed
        throw e
      }
    },

    updateTenan: async (id: string, payload: UpdateTenanDto) => {
      try {
        const data = await api.put<{ success?: boolean; data?: Tenan; tenant?: Tenan }>(
          `/tenants/${id}`,
          payload
        )
        const updated: Tenan = (data as any)?.data || (data as any)?.tenant
        if (!updated) throw new Error('Response tidak valid')
        const all = get().all.map((t) => (t.id === id ? { ...t, ...updated } : t))
        const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit)
        set({ all, items: slice, hasNext })
      } catch (e) {
        // Optimistic local update when API missing
        const all = get().all.map((t) => (t.id === id ? { ...t, ...payload, diperbarui_pada: new Date().toISOString() } as Tenan : t))
        const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit)
        set({ all, items: slice, hasNext })
        throw e
      }
    },

    deleteTenan: async (id: string) => {
      try {
        await api.delete(`/tenants/${id}`)
        const all = get().all.filter((t) => t.id !== id)
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext })
      } catch (e) {
        // Local delete fallback
        const all = get().all.filter((t) => t.id !== id)
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext })
        throw e
      }
    },
  }))
)

export type { Tenan }

