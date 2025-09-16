/**
 * Master Data Service
 * Handles kategori, brand, and supplier data for product management
 */

import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

const API_BASE = `${config.api.url}:${config.api.port}/api/produk/master`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export type MasterDataItem = {
  id: string
  nama: string
  deskripsi?: string
}

export type Category = MasterDataItem & {
  icon_url?: string
  urutan?: number
}

export type Brand = MasterDataItem & {
  logo_url?: string
  website?: string
}

export type Supplier = MasterDataItem & {
  kontak_person?: string
  telepon?: string
  email?: string
  alamat?: string
}

export const masterDataService = {
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: authHeaders(),
    })
    const js = await res.json()
    if (!res.ok || !js.success) {
      throw new Error(js.message || 'Gagal memuat kategori')
    }
    return js.data || []
  },

  async createCategory(data: { nama: string; deskripsi?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const js = await res.json()
    if (!res.ok || !js.success) {
      throw new Error(js.message || 'Gagal membuat kategori')
    }
    return js.data
  },

  async getBrands(): Promise<Brand[]> {
    const res = await fetch(`${API_BASE}/brands`, {
      headers: authHeaders(),
    })
    const js = await res.json()
    if (!res.ok || !js.success) {
      throw new Error(js.message || 'Gagal memuat brand')
    }
    return js.data || []
  },

  async createBrand(data: { nama: string; deskripsi?: string }): Promise<Brand> {
    const res = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const js = await res.json()
    if (!res.ok || !js.success) {
      throw new Error(js.message || 'Gagal membuat brand')
    }
    return js.data
  },

  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      headers: authHeaders(),
    })
    const js = await res.json()
    if (!res.ok || !js.success) {
      throw new Error(js.message || 'Gagal memuat supplier')
    }
    return js.data || []
  },

  async createSupplier(data: { nama: string; deskripsi?: string; kontak_person?: string; telepon?: string; email?: string; alamat?: string }): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const js = await res.json()
    if (!res.ok || !js.success) {
      throw new Error(js.message || 'Gagal membuat supplier')
    }
    return js.data
  }
}