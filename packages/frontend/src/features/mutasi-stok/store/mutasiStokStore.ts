import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

export type UIMutasiStok = {
  id: number
  idProduk: number
  namaProduk: string
  sku?: string
  jenisMutasi: 'masuk' | 'keluar'
  jumlah: number
  keterangan?: string
  tanggalMutasi: string
  stokSebelum: number
  stokSesudah: number
  kategori?: {
    id: number
    nama: string
  }
  brand?: {
    id: number
    nama: string
  }
  dibuatOleh?: string
  dibuatPada: string
  diperbaruiOleh?: string
  diperbaruiPada?: string
}

type MutasiStokResponse = {
  id: number
  id_produk: number
  jenis_mutasi: 'masuk' | 'keluar'
  jumlah: number
  keterangan?: string
  tanggal_mutasi: string
  stok_sebelum: number
  stok_sesudah: number
  dibuat_oleh?: string
  dibuat_pada: string
  diperbarui_oleh?: string
  diperbarui_pada?: string
  produk: {
    id: number
    nama_produk: string
    sku?: string
    kategori?: {
      id: number
      nama: string
    }
    brand?: {
      id: number
      nama: string
    }
  }
}

type Range = { min?: number; max?: number }
type DateRange = { from?: string; to?: string }

type Filters = {
  kategori?: string[]
  brand?: string[]
  jenisMutasi?: ('masuk' | 'keluar' | 'all')[]
  jumlah?: Range
  tanggal?: DateRange
}

type MutasiStokState = {
  items: UIMutasiStok[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  filters: Filters
  totalCount: number
  currentAbort?: AbortController
  lastUpdatedAt?: number
  recentlyTouched: Record<number, number>
}

type MutasiStokActions = {
  reset: () => void
  setSearch: (v: string) => void
  setFilters: (update: Partial<Filters>, options?: { replace?: boolean }) => void
  loadMutasiStok: () => Promise<void>
  loadNext: () => Promise<void>
  createMutasiStok: (data: any) => Promise<void>
  updateMutasiStok: (id: number, data: any) => Promise<void>
  deleteMutasiStok: (id: number) => Promise<void>
  upsertFromRealtime: (p: UIMutasiStok) => void
  removeFromRealtime: (id: number) => void
  markRecentlyTouched: (id: number) => void
}

const API_BASE = `${config.api.url}:${config.api.port}/api/mutasi-stok`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapMutasiStokDto(item: MutasiStokResponse): UIMutasiStok {
  return {
    id: item.id,
    idProduk: item.id_produk,
    namaProduk: item.produk.nama_produk,
    sku: item.produk.sku,
    jenisMutasi: item.jenis_mutasi,
    jumlah: item.jumlah,
    keterangan: item.keterangan,
    tanggalMutasi: item.tanggal_mutasi,
    stokSebelum: item.stok_sebelum,
    stokSesudah: item.stok_sesudah,
    kategori: item.produk.kategori,
    brand: item.produk.brand,
    dibuatOleh: item.dibuat_oleh,
    dibuatPada: item.dibuat_pada,
    diperbaruiOleh: item.diperbarui_oleh,
    diperbaruiPada: item.diperbarui_pada,
  }
}

function matchesSearchFilters(item: UIMutasiStok, search: string, filters: Filters): boolean {
  // Match search on product name or SKU (case-insensitive)
  const s = (search || '').trim().toLowerCase()
  if (s) {
    const hay = `${item.namaProduk ?? ''} ${(item.sku ?? '').toString()}`.toLowerCase()
    if (!hay.includes(s)) return false
  }

  if (filters.kategori && filters.kategori.length > 0) {
    if (!filters.kategori.includes(item.kategori?.nama ?? '')) return false
  }

  if (filters.brand && filters.brand.length > 0) {
    if (!filters.brand.includes(item.brand?.nama ?? '')) return false
  }

  if (filters.jenisMutasi && filters.jenisMutasi.length > 0) {
    if (!filters.jenisMutasi.includes('all') && !filters.jenisMutasi.includes(item.jenisMutasi)) return false
  }

  if (filters.jumlah) {
    const jumlah = item.jumlah ?? 0
    if (typeof filters.jumlah.min === 'number' && jumlah < filters.jumlah.min) return false
    if (typeof filters.jumlah.max === 'number' && jumlah > filters.jumlah.max) return false
  }

  if (filters.tanggal && (filters.tanggal.from || filters.tanggal.to)) {
    const tanggalMutasi = item.tanggalMutasi
    if (!tanggalMutasi) return false
    const mutationDate = new Date(tanggalMutasi)
    if (filters.tanggal.from) {
      const fromDate = new Date(filters.tanggal.from)
      if (mutationDate < fromDate) return false
    }
    if (filters.tanggal.to) {
      const toDate = new Date(filters.tanggal.to)
      if (mutationDate > toDate) return false
    }
  }

  return true
}

async function fetchPage(
  page: number,
  set: (partial: Partial<MutasiStokState>) => void,
  get: () => MutasiStokState,
  ctrl?: AbortController,
) {
  const { limit, search, filters } = get()
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)
  if (filters.kategori && filters.kategori.length === 1) params.set('kategoriId', filters.kategori[0])
  if (filters.brand && filters.brand.length === 1) params.set('brandId', filters.brand[0])
  if (filters.jenisMutasi && filters.jenisMutasi.length === 1 && filters.jenisMutasi[0] !== 'all') {
    params.set('jenisMutasi', filters.jenisMutasi[0])
  }

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`, {
      headers: authHeaders(),
      signal: ctrl?.signal,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const js = await res.json()
    if (!js.success) throw new Error(js.message || 'Gagal memuat data mutasi stok')

    const data = js.data?.data || []
    const newItems = data.map(mapMutasiStokDto)
    const hasNext = Boolean(js.data?.hasNext ?? false)
    const totalCount = js.data?.total ?? 0

    set({
      items: page === 1 ? newItems : [...get().items, ...newItems],
      page,
      hasNext,
      loading: false,
      totalCount,
      lastUpdatedAt: Date.now(),
    })
  } catch (e: any) {
    // Ignore abort errors; a new request is in-flight
    if (e?.name === 'AbortError') return
    set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
  }
}

export const useMutasiStokStore = create<MutasiStokState & MutasiStokActions>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        page: 1,
        limit: 25,
        hasNext: true,
        loading: false,
        search: '',
        filters: {},
        totalCount: 0,
        recentlyTouched: {},

        reset: () => set({
          items: [],
          page: 1,
          hasNext: true,
          error: undefined,
          totalCount: 0,
          recentlyTouched: {},
        }),

        setSearch: (v) => set({ search: v }),

        setFilters: (update, options) =>
          set(({ filters }) => ({
            filters: options?.replace
              ? ({ ...update } as Filters)
              : ({
                  ...filters,
                  ...update,
                } as Filters),
          })),

        loadMutasiStok: async () => {
          const state: any = get() as any
          const now = Date.now()
          if (state._inflightFirst) {
            return state._inflightFirst
          }
          if (state._lastFirst && (now - state._lastFirst < 700)) {
            return
          }
          const prev = get().currentAbort
          if (prev) { try { prev.abort() } catch {} }
          const ctrl = new AbortController()
          set({ loading: true, page: 1, error: undefined, currentAbort: ctrl, items: [] })
          const p = fetchPage(1, set, get, ctrl).finally(() => {
            (get() as any)._inflightFirst = null;
            (get() as any)._lastFirst = Date.now()
          })
          ;(get() as any)._inflightFirst = p
          return p
        },

        loadNext: async () => {
          const { loading, hasNext, page } = get()
          if (loading || !hasNext) return
          const state: any = get() as any
          if (state._inflightNext) return state._inflightNext
          const prev = get().currentAbort
          if (prev) { try { prev.abort() } catch {} }
          const ctrl = new AbortController()
          set({ loading: true, currentAbort: ctrl })
          const p = fetchPage(page + 1, set, get, ctrl).finally(() => {
            (get() as any)._inflightNext = null
          })
          ;(get() as any)._inflightNext = p
          return p
        },

        createMutasiStok: async (data: any) => {
          const res = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
          })
          const js = await res.json()
          if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat mutasi stok')

          // Reload data to get updated list
          await get().loadMutasiStok()
        },

        updateMutasiStok: async (id: number, data: any) => {
          const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
          })
          const js = await res.json()
          if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate mutasi stok')

          // Mark as recently touched and reload data
          get().markRecentlyTouched(id)
          await get().loadMutasiStok()
        },

        deleteMutasiStok: async (id: number) => {
          const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
          })
          const js = await res.json()
          if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus mutasi stok')

          set({ items: get().items.filter((x) => x.id !== id) })
        },

        upsertFromRealtime: (item: UIMutasiStok) => {
          const { items, search, filters } = get()
          const exists = items.find((x) => x.id === item.id)
          if (exists) {
            set({ items: items.map((x) => (x.id === item.id ? { ...x, ...item } : x)) })
          } else {
            // Only insert if it matches current search/filters
            if (matchesSearchFilters(item, search, filters)) {
              set({ items: [item, ...items] })
            }
          }
        },

        removeFromRealtime: (id: number) => {
          set({ items: get().items.filter((x) => x.id !== id) })
        },

        markRecentlyTouched: (id: number) => {
          set({
            recentlyTouched: {
              ...get().recentlyTouched,
              [id]: Date.now(),
            },
          })
        },
      }),
      {
        name: 'mutasi-stok-store-new',
        partialize: (state) => ({
          search: state.search,
          filters: state.filters,
        }),
      }
    )
  )
)

export type { Filters }