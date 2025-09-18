export type PurchaseStatus = 'draft' | 'pending' | 'received' | 'cancelled';
export type PurchasePaymentStatus = 'belum_bayar' | 'sebagian_bayar' | 'lunas';

export type PurchaseRange = 'today' | '7d' | '30d' | 'custom';

export type PurchaseFilters = {
  range: PurchaseRange;
  from?: string;
  to?: string;
  supplierId?: string;
  status?: PurchaseStatus;
  paymentStatus?: PurchasePaymentStatus;
  query?: string;
};

export type PurchaseTransaction = {
  id: string;
  nomor_transaksi: string;
  nomor_po?: string | null;
  tanggal: string;
  jatuh_tempo?: string | null;
  subtotal: number;
  diskon_persen: number;
  diskon_nominal: number;
  pajak_persen: number;
  pajak_nominal: number;
  total: number;
  status: PurchaseStatus;
  status_pembayaran: PurchasePaymentStatus;
  catatan?: string | null;
  supplier_nama?: string | null;
  supplier_kontak?: string | null;
  pembeli_nama?: string | null;
  toko_nama?: string | null;
};

export type PurchasePagination = {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export type PurchaseListResponse = {
  success?: boolean;
  data: PurchaseTransaction[];
  pagination?: PurchasePagination;
  total?: number;
  page?: number;
  totalPages?: number;
};

export type SearchPurchaseQuery = {
  page?: number;
  limit?: number;
  search?: string;
  supplier_id?: string;
  status?: PurchaseStatus;
  status_pembayaran?: PurchasePaymentStatus;
  tanggal_dari?: string;
  tanggal_sampai?: string;
};
