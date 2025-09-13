import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'

// API Helper functions
const API_BASE_URL = `${config.api.url}:${config.api.port}/api`

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    } else {
      throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
    }
  }
  return response.json()
}

// API Response types
interface MutasiStokResponse {
  id: number
  id_produk: number
  jenis_mutasi: 'masuk' | 'keluar'
  jumlah: number
  keterangan: string
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
    stok: number
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

// UI-friendly type
export interface UIMutasiStok {
  id: number
  id_produk: number
  nama_produk: string
  sku?: string
  jenis_mutasi: 'masuk' | 'keluar'
  jumlah: number
  keterangan: string
  tanggal_mutasi: string
  stok_sebelum: number
  stok_sesudah: number
  kategori?: {
    id: number
    nama: string
  }
  brand?: {
    id: number
    nama: string
  }
  dibuat_oleh?: string
  dibuat_pada: string
  diperbarui_oleh?: string
  diperbarui_pada?: string
}

// Form data types
export interface MutasiStokFormData {
  id_produk: number
  jenis_mutasi: 'masuk' | 'keluar'
  jumlah: number
  keterangan?: string
  tanggal_mutasi?: string
}

// Filter types
export interface MutasiStokFilters {
  kategoriId?: number
  brandId?: number
  jenisMutasi?: 'all' | 'masuk' | 'keluar'
  tanggal?: string
}

interface MutasiStokState {
  // Data
  items: UIMutasiStok[]
  loading: boolean
  error: string | null
  
  // Pagination
  page: number
  limit: number
  total: number
  hasNext: boolean
  
  // Search & Filter
  search: string
  filters: MutasiStokFilters
  
  // Actions
  loadFirst: () => Promise<void>
  loadNext: () => Promise<void>
  setSearch: (query: string) => void
  setFilters: (filters: Partial<MutasiStokFilters>) => void
  
  // CRUD
  createMutasiStok: (data: MutasiStokFormData) => Promise<void>
  updateMutasiStok: (id: number, data: Partial<MutasiStokFormData>) => Promise<void>
  deleteMutasiStok: (id: number) => Promise<void>
  
  // Reset
  reset: () => void
}

const initialState = {
  items: [],
  loading: false,
  error: null,
  page: 1,
  limit: 20,
  total: 0,
  hasNext: false,
  search: '',
  filters: {
    kategoriId: undefined,
    brandId: undefined,
    jenisMutasi: undefined,
    tanggal: undefined
  }
}

export const useMutasiStokStore = create<MutasiStokState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Load first page
      loadFirst: async () => {
        const { search, filters, limit } = get()
        set({ loading: true, error: null, page: 1 })
        
        try {
          const params = new URLSearchParams({
            page: '1',
            limit: limit.toString()
          })
          
          if (search) params.append('search', search)
          if (filters.kategoriId) params.append('kategoriId', filters.kategoriId.toString())
          if (filters.brandId) params.append('brandId', filters.brandId.toString())
          if (filters.jenisMutasi && filters.jenisMutasi !== 'all') {
            params.append('jenisMutasi', filters.jenisMutasi)
          }
          if (filters.tanggal) params.append('tanggal', filters.tanggal)
          
          const response = await fetch(`${API_BASE_URL}/mutasi-stok?${params}`, {
            headers: getAuthHeaders()
          })
          const res = await handleResponse<{data: {data: MutasiStokResponse[], total: number, hasNext: boolean}}>(response)
          const data = res.data.data
          
          const items: UIMutasiStok[] = data.map((item: MutasiStokResponse) => ({
            id: item.id,
            id_produk: item.id_produk,
            nama_produk: item.produk.nama_produk,
            sku: item.produk.sku,
            jenis_mutasi: item.jenis_mutasi,
            jumlah: item.jumlah,
            keterangan: item.keterangan,
            tanggal_mutasi: item.tanggal_mutasi,
            stok_sebelum: item.stok_sebelum,
            stok_sesudah: item.stok_sesudah,
            kategori: item.produk.kategori,
            brand: item.produk.brand,
            dibuat_oleh: item.dibuat_oleh,
            dibuat_pada: item.dibuat_pada,
            diperbarui_oleh: item.diperbarui_oleh,
            diperbarui_pada: item.diperbarui_pada
          }))
          
          set({
            items,
            total: res.data.total,
            hasNext: res.data.hasNext,
            loading: false
          })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Gagal memuat data',
            loading: false 
          })
        }
      },
      
      // Load next page (infinite scroll)
      loadNext: async () => {
        const { page, search, filters, limit, items, hasNext } = get()
        if (!hasNext) return
        
        set({ loading: true, error: null })
        
        try {
          const nextPage = page + 1
          const params = new URLSearchParams({
            page: nextPage.toString(),
            limit: limit.toString()
          })
          
          if (search) params.append('search', search)
          if (filters.kategoriId) params.append('kategoriId', filters.kategoriId.toString())
          if (filters.brandId) params.append('brandId', filters.brandId.toString())
          if (filters.jenisMutasi && filters.jenisMutasi !== 'all') {
            params.append('jenisMutasi', filters.jenisMutasi)
          }
          if (filters.tanggal) params.append('tanggal', filters.tanggal)
          
          const response = await fetch(`${API_BASE_URL}/mutasi-stok?${params}`, {
            headers: getAuthHeaders()
          })
          const res = await handleResponse<{data: {data: MutasiStokResponse[], total: number, hasNext: boolean}}>(response)
          const data = res.data.data
          
          const newItems: UIMutasiStok[] = data.map((item: MutasiStokResponse) => ({
            id: item.id,
            id_produk: item.id_produk,
            nama_produk: item.produk.nama_produk,
            sku: item.produk.sku,
            jenis_mutasi: item.jenis_mutasi,
            jumlah: item.jumlah,
            keterangan: item.keterangan,
            tanggal_mutasi: item.tanggal_mutasi,
            stok_sebelum: item.stok_sebelum,
            stok_sesudah: item.stok_sesudah,
            kategori: item.produk.kategori,
            brand: item.produk.brand,
            dibuat_oleh: item.dibuat_oleh,
            dibuat_pada: item.dibuat_pada,
            diperbarui_oleh: item.diperbarui_oleh,
            diperbarui_pada: item.diperbarui_pada
          }))
          
          set({
            items: [...items, ...newItems],
            page: nextPage,
            total: res.data.total,
            hasNext: res.data.hasNext,
            loading: false
          })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Gagal memuat data',
            loading: false 
          })
        }
      },
      
      // Set search query
      setSearch: (query: string) => {
        set({ search: query })
      },
      
      // Set filters
      setFilters: (newFilters: Partial<MutasiStokFilters>) => {
        set({ filters: { ...get().filters, ...newFilters } })
      },
      
      // Create new mutation
      createMutasiStok: async (data: MutasiStokFormData) => {
        const { loadFirst } = get()
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/mutasi-stok`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
          })
          await handleResponse<{data: {success: boolean}}>(response)
          await loadFirst()
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Gagal membuat mutasi',
            loading: false 
          })
          throw error
        }
      },
      
      // Update mutation
      updateMutasiStok: async (id: number, data: Partial<MutasiStokFormData>) => {
        const { loadFirst } = get()
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/mutasi-stok/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
          })
          await handleResponse<{data: {success: boolean}}>(response)
          await loadFirst()
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Gagal mengupdate mutasi',
            loading: false 
          })
          throw error
        }
      },
      
      // Delete mutation
      deleteMutasiStok: async (id: number) => {
        const { loadFirst } = get()
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/mutasi-stok/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          })
          await handleResponse<{data: {success: boolean}}>(response)
          await loadFirst()
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Gagal menghapus mutasi',
            loading: false 
          })
          throw error
        }
      },
      
      // Reset state
      reset: () => {
        set(initialState)
      }
    }),
    { name: 'mutasi-stok-store' }
  )
)