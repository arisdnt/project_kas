import api from '@/core/lib/api'
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

export class TokoApiService {
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
    }>(`/stores?${queryParams.toString()}`)

    return response
  }

  static async getActiveStores() {
    const response = await api.get<{
      success: boolean
      data: Toko[]
    }>('/stores/active')
    return response.data
  }

  static async findStoreById(id: string) {
    const response = await api.get<{
      success: boolean
      data: Toko
    }>(`/stores/${id}`)
    return response.data
  }

  static async findStoreByCode(kode: string) {
    const response = await api.get<{
      success: boolean
      data: Toko
    }>(`/stores/code/${kode}`)
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
    }>(`/stores/${id}/full-info`)
    return response.data
  }

  static async createStore(data: CreateTokoDto) {
    const response = await api.post<{
      success: boolean
      data: Toko
    }>('/stores', data)
    return response.data
  }

  static async updateStore(id: string, data: UpdateTokoDto) {
    const response = await api.put<{
      success: boolean
      data: Toko
    }>(`/stores/${id}`, data)
    return response.data
  }

  static async deleteStore(id: string) {
    const response = await api.delete<{
      success: boolean
      data: { affected: number }
    }>(`/stores/${id}`)
    return response.data
  }

  // Configuration management
  static async getStoreConfigs(id: string) {
    const response = await api.get<{
      success: boolean
      data: TokoConfig[]
    }>(`/stores/${id}/configs`)
    return response.data
  }

  static async getStoreConfig(id: string, key: string) {
    const response = await api.get<{
      success: boolean
      data: TokoConfig
    }>(`/stores/${id}/configs/${key}`)
    return response.data
  }

  static async setStoreConfig(id: string, data: CreateTokoConfigDto) {
    const response = await api.post<{
      success: boolean
      data: TokoConfig
    }>(`/stores/${id}/configs`, data)
    return response.data
  }

  static async updateStoreConfig(id: string, key: string, data: UpdateTokoConfigDto) {
    const response = await api.put<{
      success: boolean
      data: TokoConfig
    }>(`/stores/${id}/configs/${key}`, data)
    return response.data
  }

  static async deleteStoreConfig(id: string, key: string) {
    const response = await api.delete<{
      success: boolean
      data: { affected: number }
    }>(`/stores/${id}/configs/${key}`)
    return response.data
  }

  // Operating hours management
  static async getOperatingHours(id: string) {
    const response = await api.get<{
      success: boolean
      data: TokoOperatingHours[]
    }>(`/stores/${id}/operating-hours`)
    return response.data
  }

  static async updateOperatingHours(id: string, data: BulkUpdateOperatingHoursDto) {
    const response = await api.put<{
      success: boolean
      data: TokoOperatingHours[]
    }>(`/stores/${id}/operating-hours`, data)
    return response.data
  }

  // Statistics
  static async getStoreStats(id: string) {
    const response = await api.get<{
      success: boolean
      data: TokoStats
    }>(`/stores/${id}/stats`)
    return response.data
  }
}