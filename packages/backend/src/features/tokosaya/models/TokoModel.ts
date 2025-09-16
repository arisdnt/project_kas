/**
 * Model untuk entitas Toko
 * Berisi interface dan tipe data untuk tabel toko
 */

// Interface utama untuk entitas Toko
export interface Toko {
  id: string;
  tenant_id: string;
  nama: string;
  kode: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  status: StatusToko;
  timezone: string;
  mata_uang: string;
  logo_url?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

// Enum untuk status toko
export type StatusToko = 'aktif' | 'nonaktif' | 'maintenance';

// Interface untuk response sukses
export interface TokoResponse {
  success: true;
  message: string;
  data: Toko[];
}

// Interface untuk response error
export interface TokoErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Interface untuk parameter query
export interface TokoQueryParams {
  tenant_id: string;
  status?: StatusToko;
  limit?: number;
  offset?: number;
}

// Interface untuk filter toko
export interface TokoFilter {
  status?: StatusToko;
  nama?: string;
  kode?: string;
}

// Interface untuk data toko yang akan dibuat
export interface CreateTokoData {
  tenant_id: string;
  nama: string;
  kode: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  status?: StatusToko;
  timezone?: string;
  mata_uang?: string;
  logo_url?: string;
}

// Interface untuk data toko yang akan diupdate
export interface UpdateTokoData {
  nama?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  status?: StatusToko;
  timezone?: string;
  mata_uang?: string;
  logo_url?: string;
}

// Konstanta untuk default values
export const DEFAULT_TIMEZONE = 'Asia/Jakarta';
export const DEFAULT_MATA_UANG = 'IDR';
export const DEFAULT_STATUS: StatusToko = 'aktif';

// Konstanta untuk validasi
export const VALIDATION_RULES = {
  NAMA_MAX_LENGTH: 100,
  KODE_MAX_LENGTH: 20,
  TELEPON_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 100,
  TIMEZONE_MAX_LENGTH: 50,
  MATA_UANG_LENGTH: 3,
  LOGO_URL_MAX_LENGTH: 255
};

// Helper function untuk validasi status
export const isValidStatus = (status: string): status is StatusToko => {
  return ['aktif', 'nonaktif', 'maintenance'].includes(status);
};

// Helper function untuk format response sukses
export const createSuccessResponse = (
  data: Toko[], 
  message: string = 'Data toko berhasil diambil'
): TokoResponse => {
  return {
    success: true,
    message,
    data
  };
};

// Helper function untuk format response error
export const createErrorResponse = (
  message: string, 
  error?: string
): TokoErrorResponse => {
  return {
    success: false,
    message,
    error
  };
};