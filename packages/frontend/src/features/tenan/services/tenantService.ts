import api from '@/core/lib/api';

export interface TenantDTO {
  id: string;
  nama: string;
  email: string;
  telepon?: string;
  alamat?: string;
  status: 'aktif' | 'nonaktif' | 'suspended';
  paket: 'basic' | 'standard' | 'premium' | 'enterprise';
  max_toko: number;
  max_pengguna: number;
  dibuat_pada?: string;
  diperbarui_pada?: string;
}

export interface TenantListResponse {
  success: boolean;
  data: TenantDTO[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
}

export interface TenantCreatePayload {
  nama: string;
  email: string;
  telepon?: string;
  alamat?: string;
  status?: 'aktif' | 'nonaktif' | 'suspended';
  paket?: 'basic' | 'standard' | 'premium' | 'enterprise';
  max_toko?: number;
  max_pengguna?: number;
}

export type TenantUpdatePayload = Partial<Omit<TenantCreatePayload, 'email'>> & { email?: string };

export const tenantService = {
  async list(params: { page?: number; limit?: number; search?: string; status?: string; paket?: string } = {}) {
    const usp = new URLSearchParams();
    if (params.page) usp.append('page', String(params.page));
    if (params.limit) usp.append('limit', String(params.limit));
    if (params.search) usp.append('search', params.search);
    if (params.status) usp.append('status', params.status);
    if (params.paket) usp.append('paket', params.paket);
    const { data } = await api.get<TenantListResponse>(`/tenant?${usp.toString()}`);
    return data;
  },
  async create(payload: TenantCreatePayload) {
    const res = await api.post<{ success: boolean; data: TenantDTO }>(`/tenant`, payload);
    return res.data;
  },
  async update(id: string, payload: TenantUpdatePayload) {
    const res = await api.put<{ success: boolean; data: TenantDTO }>(`/tenant/${id}`, payload);
    return res.data;
  },
  async remove(id: string) {
    console.log(`🔴 [TENANT SERVICE] Starting delete request for tenant ID: ${id}`);

    try {
      const res = await api.delete<any>(`/tenant/${id}`);

      console.log(`📡 [TENANT SERVICE] Raw API response:`, res);

      // Normalise response { success, data: { id, deleted }} or { success, data: { affected }}
      const responseData = (res as any).data?.data || (res as any).data;
      const success = (res as any).data?.success ?? (res as any).success;

      console.log(`📊 [TENANT SERVICE] Parsed response - Success: ${success}, Data:`, responseData);

      if (!success) {
        const errorMsg = (res as any).data?.message || 'Delete operation failed';
        console.log(`❌ [TENANT SERVICE] Delete failed - Server returned success: false, message: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      console.log(`✅ [TENANT SERVICE] Delete successful for tenant: ${id}`);

      return {
        success,
        data: responseData,
        message: (res as any).data?.message || 'Tenant deleted successfully'
      };

    } catch (error: any) {
      console.log(`❌ [TENANT SERVICE] Delete request failed for tenant ${id}:`, error);

      // Re-throw untuk handling di UI
      if (error.response) {
        console.log(`🔥 [TENANT SERVICE] API Error Response:`, error.response.data);
        const apiError = error.response.data;
        throw new Error(apiError.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.log(`🔥 [TENANT SERVICE] Network Error:`, error.request);
        throw new Error('Network error - could not reach server');
      } else {
        console.log(`🔥 [TENANT SERVICE] Request Setup Error:`, error.message);
        throw error;
      }
    }
  },
  async find(id: string) {
    const res = await api.get<{ success: boolean; data: TenantDTO }>(`/tenant/${id}`);
    return res.data;
  }
};
