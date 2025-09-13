import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'

const BASE = `${config.api.url}:${config.api.port}/api/dokumen`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export interface DokumenItem {
  id: string // Changed from number to string for UUID support
  kunci_objek: string
  nama_file_asli: string
  ukuran_file: number
  tipe_mime: string
  kategori: 'produk' | 'dokumen' | 'umum'
  status: 'aktif' | 'dihapus' | 'arsip'
  id_transaksi?: number
  deskripsi?: string
  diupload_oleh: number
  tanggal_upload: string
  tanggal_diperbarui: string
}

export interface DokumenListResponse {
  success: boolean
  data: {
    items: DokumenItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateDokumenRequest {
  status: 'aktif' | 'dihapus' | 'arsip'
  kunci_objek: string
  nama_file_asli: string
  ukuran_file: number
  tipe_mime: string
  kategori: 'produk' | 'dokumen' | 'umum'
  id_transaksi?: number
  deskripsi?: string
}

export interface UpdateDokumenRequest {
  nama_file_asli?: string
  kategori?: 'produk' | 'dokumen' | 'umum'
  status?: 'aktif' | 'dihapus' | 'arsip'
  id_transaksi?: number
  deskripsi?: string
}

export const dokumenService = {
  async getList(params?: {
    page?: number
    limit?: number
    kategori?: string
    status?: string
    search?: string
  }): Promise<DokumenListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.kategori) searchParams.set('kategori', params.kategori)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)

    const url = `${BASE}?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async getById(id: string): Promise<{ success: boolean; data: DokumenItem }> {
    const response = await fetch(`${BASE}/${id}`, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async create(data: CreateDokumenRequest): Promise<{ success: boolean; data: DokumenItem }> {
    const response = await fetch(BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async update(id: string, data: UpdateDokumenRequest): Promise<{ success: boolean; data: DokumenItem }> {
    const response = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async getFileUrl(id: string): Promise<{ success: boolean; data: { url: string } }> {
    const response = await fetch(`${BASE}/${id}/url`, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  getStreamUrl(id: string): string {
    // Same-origin API for streaming; components can fetch with Authorization
    return `${BASE}/${id}/stream`
  }
}
