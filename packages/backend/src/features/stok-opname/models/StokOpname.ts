/**
 * Model StokOpname
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

export interface StokOpname {
  id: number;
  id_produk: string;
  nama_produk: string;
  sku?: string;
  kategori?: {
    id?: string;
    nama: string;
  };
  brand?: {
    id?: string;
    nama: string;
  };
  supplier?: {
    id?: string;
    nama: string;
  };
  stok_sistem?: number;
  stok_fisik?: number;
  selisih?: number;
  status?: 'pending' | 'completed' | 'cancelled';
  tanggal_opname?: string;
  dibuat_oleh?: string;
  dibuat_pada?: string;
  diperbarui_pada?: string;
  catatan?: string;
}

export interface StokOpnameCreateRequest {
  id_produk: string;
  stok_fisik: number;
  catatan?: string;
}

export interface StokOpnameUpdateRequest {
  stok_fisik?: number;
  status?: 'pending' | 'completed' | 'cancelled';
  catatan?: string;
}

export interface StokOpnameFilters {
  kategoriId?: string;
  brandId?: string;
  supplierId?: string;
  status?: 'all' | 'pending' | 'completed' | 'cancelled';
  tanggal?: string;
  search?: string;
}

export interface StokOpnameListResponse {
  success: boolean;
  data: StokOpname[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
  };
  message?: string;
}
