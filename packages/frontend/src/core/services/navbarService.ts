import { config } from '@/core/config';

// Interface untuk response API navbar
export interface NavbarInfo {
  toko: {
    id: string;
    nama: string;
    kode?: string;
    status: string;
  };
  tenant: {
    id: string;
    nama: string;
    status: string;
  };
  displayText: string;
}

// Interface untuk response API tenantsaya navbar
export interface TenantNavbar {
  id: string;
  nama: string;
  status: string;
}

// Interface untuk response API tokosaya navbar
export interface TokoNavbar {
  id: string;
  nama: string;
  kode?: string;
  status: string;
}

/**
 * Service untuk mengelola API navbar
 */
export class NavbarService {
  private static baseUrl = `${config.api.url}:${config.api.port}`;

  /**
   * Mendapatkan informasi navbar lengkap (toko + tenant + displayText)
   */
  static async getNavbarInfo(token: string): Promise<NavbarInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/navbar/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal mendapatkan info navbar');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching navbar info:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data tenant untuk navbar
   */
  static async getTenantNavbar(token: string): Promise<TenantNavbar> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tenantsaya/navbar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal mendapatkan data tenant');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching tenant navbar:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data toko untuk navbar
   */
  static async getTokoNavbar(token: string): Promise<TokoNavbar> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tokosaya/navbar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal mendapatkan data toko');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching toko navbar:', error);
      throw error;
    }
  }
}