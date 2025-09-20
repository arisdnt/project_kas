/**
 * Model untuk data navbar
 * Berisi interface dan tipe data untuk informasi navbar
 */

/**
 * Interface untuk data toko dalam navbar
 */
export interface NavbarToko {
  id: string;
  nama: string;
  kode: string;
  status: 'aktif' | 'nonaktif' | 'maintenance';
}

/**
 * Interface untuk data tenant dalam navbar
 */
export interface NavbarTenant {
  id: string;
  nama: string;
  status: 'aktif' | 'nonaktif' | 'suspended';
  paket: 'basic' | 'premium' | 'enterprise';
}

/**
 * Interface untuk data lengkap navbar
 */
export interface NavbarInfo {
  toko: NavbarToko | null;
  tenant: NavbarTenant;
  displayText: string; // Format: "Nama Toko | Nama Tenant"
}

/**
 * Interface untuk response sukses navbar
 */
export interface NavbarResponse {
  success: true;
  message: string;
  data: NavbarInfo;
}

/**
 * Interface untuk response error navbar
 */
export interface NavbarErrorResponse {
  success: false;
  message: string;
  error?: string;
}

/**
 * Helper function untuk format display text navbar
 * @param namaToko - Nama toko (bisa null untuk user tanpa toko spesifik)
 * @param namaTenant - Nama tenant
 * @returns String format "Nama Toko | Nama Tenant"
 */
export const formatNavbarDisplayText = (namaToko: string | null, namaTenant: string): string => {
  if (!namaToko) {
    return `Dashboard | ${namaTenant}`;
  }
  return `${namaToko} | ${namaTenant}`;
};

/**
 * Helper function untuk membuat response sukses
 */
export const createNavbarSuccessResponse = (
  data: NavbarInfo, 
  message: string = 'Data navbar berhasil diambil'
): NavbarResponse => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Helper function untuk membuat response error
 */
export const createNavbarErrorResponse = (
  message: string, 
  error?: string
): NavbarErrorResponse => {
  return {
    success: false,
    message,
    error
  };
};