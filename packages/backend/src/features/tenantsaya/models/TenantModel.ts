/**
 * Model untuk data tenant
 * Berisi interface dan tipe data untuk tabel tenants
 */

export interface Tenant {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  status: 'aktif' | 'nonaktif' | 'suspended';
  paket: 'basic' | 'premium' | 'enterprise';
  max_toko: number;
  max_pengguna: number;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

/**
 * Interface untuk response API tenant
 */
export interface TenantResponse {
  success: boolean;
  message: string;
  data?: Tenant;
}

/**
 * Interface untuk error response
 */
export interface TenantErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Tipe untuk status tenant
 */
export type TenantStatus = 'aktif' | 'nonaktif' | 'suspended';

/**
 * Tipe untuk paket tenant
 */
export type TenantPaket = 'basic' | 'premium' | 'enterprise';

/**
 * Interface untuk query parameter tenant
 */
export interface TenantQueryParams {
  userId: string;
}