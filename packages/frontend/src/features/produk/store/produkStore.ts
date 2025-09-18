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
  satuan?: string
  status?: string
  isOnline?: boolean
  deskripsi?: string
  stokMinimum?: number
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
    sku: p.kode,
    kategori: p.kategori_nama ? { nama: p.kategori_nama } : undefined,
    brand: p.brand_nama ? { nama: p.brand_nama } : undefined,
    supplier: p.supplier_nama ? { nama: p.supplier_nama } : undefined,
    harga: p.harga_jual != null ? Number(p.harga_jual) : (inv?.harga_jual_toko != null ? Number(inv.harga_jual_toko) : undefined),
    hargaBeli: p.harga_beli != null ? Number(p.harga_beli) : undefined,
    marginPersen: p.margin_persen != null ? Number(p.margin_persen) : undefined,
    stok: inv?.stok_tersedia != null ? Number(inv.stok_tersedia) : undefined,
    satuan: p.satuan,
    status: p.is_aktif ? 'aktif' : 'tidak aktif',
    isOnline: p.is_dijual_online,
    deskripsi: p.deskripsi,
    stokMinimum: p.stok_minimum,
    dibuatPada: p.dibuat_pada || p.dibuatPada,
    diperbaruiPada: p.diperbarui_pada || p.diperbaruiPada,
  }
}

type Filters = { kategoriFilter?: string; brandFilter?: string; supplierFilter?: string }

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
  createCategory: (data: any) => Promise<void>
  createBrand: (data: any) => Promise<void>
  createSupplier: (data: any) => Promise<void>
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
      const p = fetchPage(1, set, get, ctrl).finally(() => { (get() as any)._inflightFirst = null; (get() as any)._lastFirst = Date.now() })
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
      const p = fetchPage(page + 1, set, get, ctrl).finally(() => { (get() as any)._inflightNext = null })
      ;(get() as any)._inflightNext = p
      return p
    },

    createProduk: async (data: any) => {
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
          // Use selected kategori and brand IDs or defaults
          kategori_id: data.kategoriId || get().getDefaultCategoryId(),
          brand_id: data.brandId || get().getDefaultBrandId(),
          supplier_id: get().getDefaultSupplierId(),
          is_aktif: data.status === 'aktif' ? 1 : 0,
          is_dijual_online: false,
          pajak_persen: 0,
          margin_persen: 0,
          berat: 0,
          // Scope fields (optional) - hanya akan diinterpretasi backend jika endpoint mendukung
          ...(data.targetTenantId ? { targetTenantId: data.targetTenantId } : {}),
          ...(data.targetStoreId ? { targetStoreId: data.targetStoreId } : {}),
          ...(data.applyToAllTenants ? { applyToAllTenants: true } : {}),
          ...(data.applyToAllStores ? { applyToAllStores: true } : {}),
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

    // Create master data functions
    createCategory: async (data: any) => {
      const res = await fetch(`${config.api.url}:${config.api.port}/api/produk/categories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Failed to create category')

      // Reload master data to get updated list
      await get().loadMasterData()
      return js.data
    },

    createBrand: async (data: any) => {
      const res = await fetch(`${config.api.url}:${config.api.port}/api/produk/brands`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Failed to create brand')

      // Reload master data to get updated list
      await get().loadMasterData()
      return js.data
    },

    createSupplier: async (data: any) => {
      const res = await fetch(`${config.api.url}:${config.api.port}/api/produk/suppliers`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Failed to create supplier')

      // Reload master data to get updated list
      await get().loadMasterData()
      return js.data
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
  if (filters.kategoriFilter && p.kategori?.nama !== filters.kategoriFilter) return false
  if (filters.brandFilter && p.brand?.nama !== filters.brandFilter) return false
  if (filters.supplierFilter && p.supplier?.nama !== filters.supplierFilter) return false
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
  if (filters.kategoriFilter) params.set('kategori_nama', filters.kategoriFilter)
  if (filters.brandFilter) params.set('brand_nama', filters.brandFilter)
  if (filters.supplierFilter) params.set('supplier_nama', filters.supplierFilter)

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
