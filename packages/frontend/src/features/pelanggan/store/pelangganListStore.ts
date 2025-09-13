import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useAuthStore } from '@/core/store/authStore'
import { UIPelanggan } from '@/features/pelanggan/store/pelangganStore'
import { config } from '@/core/config'

type PelangganListState = {
  items: UIPelanggan[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
}

type PelangganListActions = {
  setSearch: (v: string) => void
  reset: () => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/pelanggan`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

type Store = PelangganListState & PelangganListActions

export const usePelangganListStore = create<Store>()(
  devtools((set, get) => ({
    items: [],
    page: 1,
    limit: 25,
    hasNext: true,
    loading: false,
    search: '',

    setSearch: (v) => set({ search: v }),
    reset: () => set({ items: [], page: 1, hasNext: true, error: undefined }),

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
  }))
)

async function fetchPage(
  page: number,
  set: (partial: Partial<PelangganListState>) => void,
  get: () => PelangganListState,
) {
  const { limit, search } = get()
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`, { headers: authHeaders() })
    const js = await res.json()
    if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat pelanggan')
    const newItems: UIPelanggan[] = js.data || []
    const hasNext = Boolean(js.pagination?.page < js.pagination?.totalPages)
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

export type { PelangganListActions, PelangganListState }

