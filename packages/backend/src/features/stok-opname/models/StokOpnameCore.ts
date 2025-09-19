/**
 * Model Core untuk Stok Opname
 * Menangani struktur data dan validasi untuk stok opname
 */

// Interface untuk header stok opname
export interface StokOpname {
  id: string;
  tenant_id: string;
  toko_id: string;
  pengguna_id: string;
  nomor_opname: string;
  tanggal: string;
  keterangan?: string;
  status: 'draft' | 'proses' | 'selesai' | 'dibatalkan';
  total_item: number;
  total_selisih_nilai: number;
  dibuat_pada: string;
  diperbarui_pada: string;
}

// Interface untuk item stok opname
export interface StokOpnameItem {
  id: string;
  stock_opname_id: string;
  produk_id: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  harga_satuan: number;
  nilai_selisih: number;
  keterangan?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

// Interface untuk stok opname dengan items dan data produk
export interface StokOpnameWithItems extends StokOpname {
  items: StokOpnameItemWithProduk[];
}

// Interface untuk item dengan data produk
export interface StokOpnameItemWithProduk extends StokOpnameItem {
  produk?: {
    id: string;
    nama: string;
    kode?: string;
    kategori?: {
      id: string;
      nama: string;
    };
    brand?: {
      id: string;
      nama: string;
    };
    supplier?: {
      id: string;
      nama: string;
    };
  };
}

export interface StokOpnameFilter {
  search?: string;
  kategori?: number;
  brand?: number;
  supplier?: number;
  status?: 'all' | 'pending' | 'completed' | 'cancelled';
  tanggal?: string;
  page?: number;
  limit?: number;
}

export interface StokOpnameCreateData {
  items: {
    id_produk: string;
    stok_fisik?: number;
    catatan?: string;
  }[];
  catatan?: string;
  tanggal_opname?: string;
}

export interface StokOpnameUpdateData {
  stok_fisik?: number;
  selisih?: number;
  status?: 'pending' | 'completed' | 'cancelled';
  catatan?: string;
}

export interface StokOpnameListResponse {
  success: boolean;
  data: StokOpnameWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  message?: string;
}

export interface StokOpnameResponse {
  success: boolean;
  data: StokOpnameWithItems;
  message?: string;
}

export function createErrorResponse(message: string): { success: false; message: string } {
  return { success: false, message };
}

export function createSuccessResponse<T>(data: T, message?: string): { success: true; data: T; message?: string } {
  return { success: true, data, message };
}