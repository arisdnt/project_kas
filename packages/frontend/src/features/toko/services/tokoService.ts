import api from '@/core/lib/api'
import { config } from '@/core/config'
import {
  Toko,
  CreateTokoDto,
  UpdateTokoDto,
  TokoConfig,
  CreateTokoConfigDto,
  UpdateTokoConfigDto,
  TokoOperatingHours,
  BulkUpdateOperatingHoursDto,
  TokoStats
} from '../types/toko'

export type InfoToko = {
  nama: string
  alamat: string
  emailKontak: string
  teleponKontak: string
}

export class TokoService {
  // Store management
  static async searchStores(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    kode?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.kode) queryParams.append('kode', params.kode)

    const response = await api.get<{
      success: boolean
      data: Toko[]
      pagination: {
        total: number
        page: number
        totalPages: number
        limit: number
      }
    }>(`/toko?${queryParams.toString()}`)

    return response
  }

  static async getActiveStores() {
    const response = await api.get<{
      success: boolean
      data: Toko[]
    }>('/toko/active')
    return response.data
  }

  static async findStoreById(id: string) {
    const response = await api.get<{
      success: boolean
      data: Toko
    }>(`/toko/${id}`)
    return response.data
  }

  static async findStoreByCode(kode: string) {
    const response = await api.get<{
      success: boolean
      data: Toko
    }>(`/toko/code/${kode}`)
    return response.data
  }

  static async getStoreWithFullInfo(id: string) {
    const response = await api.get<{
      success: boolean
      data: {
        store: Toko
        configs: TokoConfig[]
        operatingHours: TokoOperatingHours[]
        stats: TokoStats
      }
    }>(`/toko/${id}/full-info`)
    return response.data
  }

  static async createStore(data: CreateTokoDto) {
    const response = await api.post<{
      success: boolean
      data: Toko
    }>('/toko', data)
    return response.data
  }

  static async updateStore(id: string, data: UpdateTokoDto) {
    const response = await api.put<{
      success: boolean
      data: Toko
    }>(`/toko/${id}`, data)
    return response.data
  }

  static async deleteStore(id: string) {
    const response = await api.delete<{
      success: boolean
      data: { affected: number }
    }>(`/toko/${id}`)
    return response.data
  }

  // Configuration management
  static async getStoreConfigs(id: string) {
    const response = await api.get<{
      success: boolean
      data: TokoConfig[]
    }>(`/toko/${id}/configs`)
    return response.data
  }

  static async getStoreConfig(id: string, key: string) {
    const response = await api.get<{
      success: boolean
      data: TokoConfig
    }>(`/toko/${id}/configs/${key}`)
    return response.data
  }

  static async setStoreConfig(id: string, data: CreateTokoConfigDto) {
    const response = await api.post<{
      success: boolean
      data: TokoConfig
    }>(`/toko/${id}/configs`, data)
    return response.data
  }

  static async updateStoreConfig(id: string, key: string, data: UpdateTokoConfigDto) {
    const response = await api.put<{
      success: boolean
      data: TokoConfig
    }>(`/toko/${id}/configs/${key}`, data)
    return response.data
  }

  static async deleteStoreConfig(id: string, key: string) {
    const response = await api.delete<{
      success: boolean
      data: { affected: number }
    }>(`/toko/${id}/configs/${key}`)
    return response.data
  }

  // Operating hours management
  static async getOperatingHours(id: string) {
    const response = await api.get<{
      success: boolean
      data: TokoOperatingHours[]
    }>(`/toko/${id}/operating-hours`)
    return response.data
  }

  static async updateOperatingHours(id: string, data: BulkUpdateOperatingHoursDto) {
    const response = await api.put<{
      success: boolean
      data: TokoOperatingHours[]
    }>(`/toko/${id}/operating-hours`, data)
    return response.data
  }

  // Statistics
  static async getStoreStats(id: string) {
    const response = await api.get<{
      success: boolean
      data: TokoStats
    }>(`/toko/${id}/stats`)
    return response.data
  }
}

// Legacy compatibility - maps old interface to new API structure
export async function getInfoToko(): Promise<InfoToko> {
  try {
    // Try the new store API first
    const stores = await TokoService.getActiveStores()
    if (stores.length > 0) {
      const store = stores[0]
      return {
        nama: store.nama,
        alamat: store.alamat || '',
        emailKontak: store.email || '',
        teleponKontak: store.telepon || ''
      }
    }

    // Fallback to old API
    const data = await api.get<InfoToko>('/settings/info-toko')
    return data
  } catch {
    return {
      nama: config.infoToko.nama,
      alamat: config.infoToko.alamat,
      emailKontak: config.infoToko.emailKontak,
      teleponKontak: config.infoToko.teleponKontak
    }
  }
}

export async function updateInfoToko(payload: InfoToko): Promise<InfoToko> {
  try {
    // Try the new store API first
    const stores = await TokoService.getActiveStores()
    if (stores.length > 0) {
      const store = stores[0]
      const updatedStore = await TokoService.updateStore(store.id, {
        nama: payload.nama,
        alamat: payload.alamat,
        email: payload.emailKontak,
        telepon: payload.teleponKontak
      })

      return {
        nama: updatedStore.nama,
        alamat: updatedStore.alamat || '',
        emailKontak: updatedStore.email || '',
        teleponKontak: updatedStore.telepon || ''
      }
    }

    // Fallback to old API
    const data = await api.put<InfoToko>('/settings/info-toko', payload)
    return data
  } catch (err) {
    throw new Error('Endpoint penyimpanan belum tersedia. Perubahan hanya berlaku di sesi saat ini.')
  }
}

