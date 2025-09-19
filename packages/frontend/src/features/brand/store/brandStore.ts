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

type BrandCreateData = {
  nama: string
  deskripsi?: string
  logo_url?: string
  website?: string
  // Scope parameters
  targetTenantId?: string
  targetStoreId?: string
  applyToAllTenants?: boolean
  applyToAllStores?: boolean
}

type BrandUpdateData = {
  nama?: string
  deskripsi?: string
  logo_url?: string
  website?: string
}

type BrandActions = {
  setSearch: (v: string) => void
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  createBrand: (data: BrandCreateData) => Promise<UIBrand>
  updateBrand: (id: string, data: BrandUpdateData) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  uploadBrandImage: (brandId: string, imageFile: File) => Promise<string>
  removeBrandImage: (brandId: string) => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/produk/master/brands`
const API_BASE_ENHANCED = `${config.api.url}:${config.api.port}/api/produk/brands`

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

    createBrand: async (data: BrandCreateData): Promise<UIBrand> => {
      // Use enhanced API endpoint that supports scope operations
      const res = await fetch(API_BASE_ENHANCED, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal membuat brand')

      // Handle different response types based on scope operation
      const result = js.data

      if (result.message) {
        // Multi-tenant/multi-store operation (God user or Admin)
        console.log('Brand created with scope:', result.message)
        // Reload all data to get updated list
        await get().loadFirst()
        // For scope operations, we can't return the specific created brand
        // Return a placeholder that indicates success
        return { id: 'scope-operation', nama: 'Scope Operation', status: 'aktif' } as UIBrand
      } else {
        // Normal single brand creation
        const created: UIBrand = result
        const all = [created, ...get().all]
        const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
        set({ all, items: slice, page: 1, hasNext })
        return created
      }
    },

    updateBrand: async (id: string, data: BrandUpdateData) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal mengupdate brand')
      const all = get().all.map((b) => (b.id === id ? { ...b, ...data } : b))
      const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit)
      set({ all, items: slice, hasNext })
    },

    deleteBrand: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders() })
      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal menghapus brand')
      const all = get().all.filter((b) => b.id !== id)
      const { slice, hasNext } = filterAndSlice(all, get().search, 1, get().limit)
      set({ all, items: slice, page: 1, hasNext })
    },

    uploadBrandImage: async (brandId: string, imageFile: File): Promise<string> => {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('[BrandStore] Uploading brand image', { brandId, name: imageFile.name, size: imageFile.size, type: imageFile.type });
      const res = await fetch(`${API_BASE}/${brandId}/upload-image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const js = await res.json();
      console.log('[BrandStore] Upload response', { status: res.status, ok: res.ok, body: js });
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal upload gambar brand');

      // Update brand in store
      const updatedBrand = js.data.brand;
      const all = get().all.map((b) => (b.id === brandId ? { ...b, logo_url: updatedBrand.logo_url } : b));
      const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit);
      set({ all, items: slice, hasNext });

      return js.data.logo_url;
    },

    removeBrandImage: async (brandId: string): Promise<void> => {
      const token = useAuthStore.getState().token;
      console.log('[BrandStore] Removing brand image', { brandId });
      const res = await fetch(`${API_BASE}/${brandId}/remove-image`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const js = await res.json();
      console.log('[BrandStore] Remove response', { status: res.status, ok: res.ok, body: js });
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal hapus gambar brand');

      // Update brand in store
  const all = get().all.map((b) => (b.id === brandId ? { ...b, logo_url: undefined } : b));
      const { slice, hasNext } = filterAndSlice(all, get().search, get().page, get().limit);
      set({ all, items: slice, hasNext });
    },
  }))
)

export type { UIBrand }

