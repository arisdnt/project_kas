/**
 * Profil Saya Service
 * Service untuk mengelola operasi profil pengguna sendiri
 */

import { config } from '@/core/config';
import { useAuthStore } from '@/core/store/authStore';
import { ApiResponse, ProfilUser, UpdateProfilUser, TenantInfo, TokoInfo } from '../types';

class ProfilSayaService {
  private baseUrl = `${config.api.url}:${config.api.port}/api/profilsaya`;
  private tenantUrl = `${config.api.url}:${config.api.port}/api/tenantsaya`;
  private tokoUrl = `${config.api.url}:${config.api.port}/api/tokosaya`;

  /**
   * Mendapatkan headers dengan authentication
   */
  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Mendapatkan profil pengguna yang sedang login
   */
  async getMyProfile(): Promise<ApiResponse<ProfilUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Gagal memuat profil',
          error: data.error,
        };
      }

      return {
        success: true,
        message: 'Profil berhasil dimuat',
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat memuat profil',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update profil pengguna yang sedang login
   */
  async updateMyProfile(profileData: UpdateProfilUser): Promise<ApiResponse<ProfilUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Gagal memperbarui profil',
          error: data.error,
        };
      }

      return {
        success: true,
        message: 'Profil berhasil diperbarui',
        data: data.data,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat memperbarui profil',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mendapatkan data tenant user yang sedang login
   */
  async getTenantInfo(): Promise<ApiResponse<TenantInfo>> {
    try {
      const response = await fetch(`${this.tenantUrl}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Gagal memuat data tenant',
          error: data.error,
        };
      }

      return {
        success: true,
        message: 'Data tenant berhasil dimuat',
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching tenant info:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat memuat data tenant',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mendapatkan data toko user yang sedang login
   */
  async getTokoInfo(): Promise<ApiResponse<TokoInfo[]>> {
    try {
      const response = await fetch(`${this.tokoUrl}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Gagal memuat data toko',
          error: data.error,
        };
      }

      return {
        success: true,
        message: 'Data toko berhasil dimuat',
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching toko info:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat memuat data toko',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mendapatkan statistik tenant
   */
  async getTenantStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.tenantUrl}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Gagal memuat statistik tenant',
          error: data.error,
        };
      }

      return {
        success: true,
        message: 'Statistik tenant berhasil dimuat',
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat memuat statistik tenant',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const profilsayaService = new ProfilSayaService();
export default profilsayaService;