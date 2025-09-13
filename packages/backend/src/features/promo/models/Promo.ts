export interface Promo {
  id: number;
  nama: string;
  deskripsi: string;
  tipe: 'diskon_persen' | 'diskon_nominal' | 'beli_n_gratis_n' | 'bundling';
  nilai: number;
  syarat_minimum?: number;
  kuota?: number;
  kuota_terpakai?: number;
  produk_ids?: number[];
  kategori_ids?: number[];
  mulai_tanggal: Date;
  selesai_tanggal: Date;
  aktif: boolean;
  id_toko: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePromoRequest {
  nama: string;
  deskripsi: string;
  tipe: Promo['tipe'];
  nilai: number;
  syarat_minimum?: number;
  kuota?: number;
  produk_ids?: number[];
  kategori_ids?: number[];
  mulai_tanggal: string;
  selesai_tanggal: string;
}

export interface UpdatePromoRequest extends Partial<CreatePromoRequest> {
  aktif?: boolean;
}

export interface PromoStats {
  total_promo: number;
  promo_aktif: number;
  promo_nonaktif: number;
  total_penggunaan: number;
  total_nilai_diskon: number;
}