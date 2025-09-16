import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ProductFormData } from '@/core/components/ui/product-edit-sidebar'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'
import { masterDataService, Category, Brand, Supplier } from '../services/masterDataService'

type UIProduk = {
  id: number
  nama: string
  sku?: string
  kategori?: { id?: string; nama: string }
  brand?: { id?: string; nama: string }
  supplier?: { id?: string; nama: string }
  harga?: number
  hargaBeli?: number
  marginPersen?: number
  stok?: number
  dibuatPada?: string
  diperbaruiPada?: string
}

type ProdukListResponse = {
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

const API_BASE = `${config.api.url}:${config.api.port}/api/produk`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapProdukDto(p: any): UIProduk {
  const inv = Array.isArray(p.inventaris) && p.inventaris.length > 0 ? p.inventaris[0] : undefined
  return {
    id: p.id,
    nama: p.nama,
    // backend uses `kode` for SKU; keep compatibility with older `sku`
    sku: p.kode ?? p.sku ?? undefined,
    kategori: p.kategori ? { id: p.kategori.id, nama: p.kategori.nama } : undefined,
    brand: p.brand ? { id: p.brand.id, nama: p.brand.nama } : undefined,
    supplier: p.supplier ? { id: p.supplier.id, nama: p.supplier.nama } : undefined,
    harga: p.harga_jual != null ? Number(p.harga_jual) : (inv?.harga_jual_toko != null ? Number(inv.harga_jual_toko) : undefined),
    hargaBeli: p.harga_beli != null ? Number(p.harga_beli) : undefined,
    marginPersen: p.margin_persen != null ? Number(p.margin_persen) : undefined,
    stok: inv?.stok_tersedia != null ? Number(inv.stok_tersedia) : undefined,
    dibuatPada: p.dibuat_pada || p.dibuatPada,
    diperbaruiPada: p.diperbarui_pada || p.diperbaruiPada,
  }
}

type Filters = { kategoriId?: string; brandId?: string; supplierId?: string }

type ProdukState = {
  items: UIProduk[]
  page: number
  limit: number
  hasNext: boolean
  loading: boolean
  error?: string
  search: string
  filters: Filters
  // Abort controller for in-flight requests (to keep results fresh)
  currentAbort?: AbortController
  // Master data
  categories: Category[]
  brands: Brand[]
  suppliers: Supplier[]
  masterDataLoading: boolean
}

type ProdukActions = {
  reset: () => void
  setSearch: (v: string) => void
  setFilters: (f: Filters) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createProduk: (data: ProductFormData) => Promise<void>
  updateProduk: (id: number, data: ProductFormData) => Promise<void>
  deleteProduk: (id: number) => Promise<void>
  upsertFromRealtime: (p: UIProduk) => void
  removeFromRealtime: (id: number) => void
  // Master data actions
  loadMasterData: () => Promise<void>
  getDefaultCategoryId: () => string
  getDefaultBrandId: () => string
  getDefaultSupplierId: () => string
}

export const useProdukStore = create<ProdukState & ProdukActions>()(
  devtools((set, get) => ({
    items: [],
    page: 1,
    limit: 25,
    hasNext: true,
    loading: false,
    search: '',
    filters: {},
    categories: [],
    brands: [],
    suppliers: [],
    masterDataLoading: false,

    reset: () => set({ items: [], page: 1, hasNext: true, error: undefined }),
    setSearch: (v) => set({ search: v }),
    setFilters: (f) => set({ filters: f }),

    loadFirst: async () => {
      // Abort previous request if any
      const prev = get().currentAbort
      if (prev) {
        try { prev.abort() } catch {}
      }
      const ctrl = new AbortController()
      // Clear items immediately to indicate new search/filter is applied
      set({ loading: true, page: 1, error: undefined, currentAbort: ctrl, items: [] })
      await fetchPage(1, set, get, ctrl)
    },

    loadNext: async () => {
      const { loading, hasNext, page } = get()
      if (loading || !hasNext) return
      // Abort previous request if any (we're starting a new page fetch)
      const prev = get().currentAbort
      if (prev) {
        try { prev.abort() } catch {}
      }
      const ctrl = new AbortController()
      set({ loading: true, currentAbort: ctrl })
      await fetchPage(page + 1, set, get, ctrl)
    },

    createProduk: async (data: ProductFormData) => {
      // Create produk with proper API schema
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nama: data.nama,
          kode: data.kode,
          deskripsi: data.deskripsi || undefined,
          satuan: data.satuan || 'pcs',
          harga_beli: Number(data.hargaBeli) || 0,
          harga_jual: Number(data.hargaJual) || 0,
          stok_minimum: 0,
          // Use actual master data IDs
          kategori_id: get().getDefaultCategoryId(),
          brand_id: get().getDefaultBrandId(),
          supplier_id: get().getDefaultSupplierId(),
          is_aktif: 1,
          is_dijual_online: false,
          pajak_persen: 0,
          margin_persen: 0,
          berat: 0
        }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat produk')
      const created = js.data

      // Update stock if provided
      if (data.stok && data.stok > 0) {
        await fetch(`${API_BASE}/${created.id}/inventory`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            jumlah: Number(data.stok)
          }),
        })
      }

      // Optimistically prepend to list
      const ui = mapProdukDto(created)
      set({ items: [ui, ...get().items] })
    },

    updateProduk: async (id: number, data: ProductFormData) => {
      // Update produk with proper API schema
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          nama: data.nama,
          kode: data.kode,
          deskripsi: data.deskripsi || undefined,
          satuan: data.satuan || 'pcs',
          harga_beli: Number(data.hargaBeli) || 0,
          harga_jual: Number(data.hargaJual) || 0
        }),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate produk')

      // Update stock if provided
      if (data.stok !== undefined) {
        await fetch(`${API_BASE}/${id}/inventory`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            jumlah: Number(data.stok)
          }),
        })
      }

      // Update list locally
      set({
        items: get().items.map((it) =>
          it.id === id
            ? {
                ...it,
                nama: data.nama,
                sku: data.kode,
                harga: Number(data.hargaJual) || 0,
                hargaBeli: Number(data.hargaBeli) || undefined,
                stok: Number(data.stok) || 0,
              }
            : it,
        ),
      })
    },

    deleteProduk: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus produk')
      set({ items: get().items.filter((x) => x.id !== id) })
    },

    upsertFromRealtime: (p: UIProduk) => {
      const { items, search, filters } = get()
      const exists = items.find((x) => x.id === p.id)
      if (exists) {
        set({ items: items.map((x) => (x.id === p.id ? { ...x, ...p } : x)) })
      } else {
        // Only insert if it matches current search/filters
        if (matchesSearchFilters(p, search, filters)) {
          set({ items: [p, ...items] })
        }
      }
    },

    removeFromRealtime: (id: number) => {
      set({ items: get().items.filter((x) => x.id !== id) })
    },

    // Master data functions
    loadMasterData: async () => {
      set({ masterDataLoading: true })
      try {
        const [categories, brands, suppliers] = await Promise.all([
          masterDataService.getCategories(),
          masterDataService.getBrands(),
          masterDataService.getSuppliers()
        ])
        set({ categories, brands, suppliers, masterDataLoading: false })
      } catch (error: any) {
        console.error('Error loading master data:', error)
        set({ masterDataLoading: false })
      }
    },

    getDefaultCategoryId: () => {
      const { categories } = get()
      return categories.length > 0 ? categories[0].id : '00000000-0000-0000-0000-000000000001'
    },

    getDefaultBrandId: () => {
      const { brands } = get()
      return brands.length > 0 ? brands[0].id : '00000000-0000-0000-0000-000000000001'
    },

    getDefaultSupplierId: () => {
      const { suppliers } = get()
      return suppliers.length > 0 ? suppliers[0].id : '00000000-0000-0000-0000-000000000001'
    },
  }))
)

function matchesSearchFilters(p: UIProduk, search: string, filters: Filters): boolean {
  // Match search on name or SKU (case-insensitive)
  const s = (search || '').trim().toLowerCase()
  if (s) {
    const hay = `${p.nama ?? ''} ${(p.sku ?? '').toString()}`.toLowerCase()
    if (!hay.includes(s)) return false
  }
  if (filters.kategoriId && p.kategori?.id && filters.kategoriId !== p.kategori.id) return false
  if (filters.brandId && p.brand?.id && filters.brandId !== p.brand.id) return false
  if (filters.supplierId && p.supplier?.id && filters.supplierId !== p.supplier.id) return false
  return true
}

async function fetchPage(
  page: number,
  set: (partial: Partial<ProdukState>) => void,
  get: () => ProdukState,
  ctrl?: AbortController,
) {
  const { limit, search, filters } = get()
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)
  if (filters.kategoriId) params.set('kategori_id', filters.kategoriId)
  if (filters.brandId) params.set('brand_id', filters.brandId)
  if (filters.supplierId) params.set('supplier_id', filters.supplierId)

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`, {
      headers: authHeaders(),
      signal: ctrl?.signal,
    })
    const js: ProdukListResponse = await res.json()
    if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat produk')
    const newItems = (js.data || []).map(mapProdukDto)
    const hasNext = Boolean(js.pagination?.hasNextPage ?? (js.pagination ? page < (js.pagination.totalPages || 1) : false))
    set({
      items: page === 1 ? newItems : [...get().items, ...newItems],
      page,
      hasNext,
      loading: false,
    })
  } catch (e: any) {
    // Ignore abort errors; a new request is in-flight
    if (e?.name === 'AbortError') return
    set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
  }
}

export type { UIProduk, Filters }
