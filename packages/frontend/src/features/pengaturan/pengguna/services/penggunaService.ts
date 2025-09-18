/**
 * Service untuk API Pengguna
 * Mengelola komunikasi dengan backend API
 */

import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'

// Interface untuk data pengguna
export interface Pengguna {
  id: number
  id_toko: number
  id_peran: number
  username: string
  password_hash: string
  nama_lengkap: string
  aktif: boolean
  dibuat_pada: string
  diperbarui_pada: string
  nama_peran?: string
  nama_toko?: string
}

// Interface untuk data peran
export interface Peran {
  id: number
  nama: string
  deskripsi?: string
}

// Interface untuk request create/update pengguna
export interface CreatePenggunaRequest {
  username: string
  nama_lengkap: string
  id_peran: number
  password: string
  aktif: boolean
}

export interface UpdatePenggunaRequest {
  username?: string
  nama_lengkap?: string
  id_peran?: number
  password?: string
  aktif?: boolean
}

// Interface untuk query parameter
export interface PenggunaQuery {
  page?: number
  limit?: number
  search?: string
  id_peran?: number
  aktif?: boolean
}

// Interface untuk response API
export interface PenggunaResponse {
  success: boolean
  message: string
  data?: {
    pengguna?: Pengguna | Pengguna[]
    peran?: Peran[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// Helper function untuk membuat headers dengan authorization
const getAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Helper function untuk handle response
const handleResponse = async (response: Response): Promise<PenggunaResponse> => {
  const data = await response.json()
  
  if (!response.ok) {
    // Tangani error validasi dengan lebih baik
    if (response.status === 400 && data.errors && typeof data.errors === 'object') {
      // Buat pesan error yang lebih user-friendly
      const errorMessages = Object.entries(data.errors)
        .map(([field, message]) => {
          // Terjemahkan nama field ke bahasa Indonesia
          const fieldTranslations: Record<string, string> = {
            'nama': 'Nama',
            'username': 'Username',
            'email': 'Email',
            'peran_id': 'Peran',
            'tenant_id': 'Tenant',
            'toko_id': 'Toko',
            'password': 'Password',
            'nama_lengkap': 'Nama Lengkap',
            'id_peran': 'Peran',
            'aktif': 'Status Aktif'
          };
          
          const translatedField = fieldTranslations[field] || field;
          return `${translatedField}: ${message}`;
        })
        .join('\n');
      
      throw new Error(`Validasi gagal:\n${errorMessages}`);
    }
    
    // Error lainnya
    throw new Error(data.message || 'Terjadi kesalahan pada server')
  }
  
  return data
}

export class PenggunaService {
  private static readonly BASE_URL = `${config.api.url}:${config.api.port}/api/pengguna`
  
  /**
   * Ambil semua pengguna dengan filter dan pagination
   */
  static async getAllPengguna(query: PenggunaQuery = {}): Promise<PenggunaResponse> {
    try {
      const searchParams = new URLSearchParams()
      
      if (query.page) searchParams.append('page', query.page.toString())
      if (query.limit) searchParams.append('limit', query.limit.toString())
      if (query.search) searchParams.append('search', query.search)
      if (query.id_peran) searchParams.append('id_peran', query.id_peran.toString())
      if (query.aktif !== undefined) searchParams.append('aktif', query.aktif.toString())
      
      const url = `${this.BASE_URL}?${searchParams.toString()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return await handleResponse(response)
      
    } catch (error) {
      console.error('Error fetching pengguna:', error)
      throw error
    }
  }
  
  /**
   * Ambil pengguna berdasarkan ID
   */
  static async getPenggunaById(id: number): Promise<PenggunaResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return await handleResponse(response)
      
    } catch (error) {
      console.error('Error fetching pengguna by ID:', error)
      throw error
    }
  }
  
  /**
   * Buat pengguna baru
   */
  static async createPengguna(data: CreatePenggunaRequest): Promise<PenggunaResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return await handleResponse(response)
      
    } catch (error) {
      console.error('Error creating pengguna:', error)
      throw error
    }
  }
  
  /**
   * Update pengguna
   */
  static async updatePengguna(id: number, data: UpdatePenggunaRequest): Promise<PenggunaResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return await handleResponse(response)
      
    } catch (error) {
      console.error('Error updating pengguna:', error)
      throw error
    }
  }
  
  /**
   * Hapus pengguna
   */
  static async deletePengguna(id: number): Promise<PenggunaResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      return await handleResponse(response)
      
    } catch (error) {
      console.error('Error deleting pengguna:', error)
      throw error
    }
  }
  
  /**
   * Ambil semua peran
   */
  static async getAllPeran(): Promise<PenggunaResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/peran`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return await handleResponse(response)
      
    } catch (error) {
      console.error('Error fetching peran:', error)
      throw error
    }
  }
}