export type BeritaStatus = 'draft' | 'aktif' | 'nonaktif' | 'kedaluwarsa';
export type BeritaTipe = 'informasi' | 'pengumuman' | 'peringatan' | 'urgent';
export type BeritaPrioritas = 'rendah' | 'normal' | 'tinggi' | 'urgent';
export type BeritaTargetTampil = 'toko_tertentu' | 'semua_toko_tenant' | 'semua_tenant';

export interface BeritaItem {
  id: string;
  tenantId: string;
  tokoId?: string | null;
  userId: string;
  judul: string;
  konten: string;
  tipeBerita: BeritaTipe;
  targetTampil: BeritaTargetTampil;
  targetTokoIds?: string[] | null;
  targetTenantIds?: string[] | null;
  jadwalMulai: string;
  jadwalSelesai?: string | null;
  intervalTampilMenit: number;
  maksimalTampil?: number | null;
  prioritas: BeritaPrioritas;
  status: BeritaStatus;
  gambarUrl?: string | null;
  lampiranUrl?: string | null;
  dibuatPada: string;
  diperbaruiPada: string;
  namaUser: string;
  namaToko?: string | null;
}

export interface BeritaStats {
  totalBerita: number;
  totalAktif: number;
  totalDraft: number;
  totalKedaluwarsa: number;
  beritaUrgent: number;
  beritaHariIni: number;
}

export interface BeritaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchBeritaParams {
  q?: string;
  tipeBerita?: BeritaTipe;
  targetTampil?: BeritaTargetTampil;
  prioritas?: BeritaPrioritas;
  status?: BeritaStatus;
  jadwalMulaiDari?: string;
  jadwalMulaiSampai?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dibuat_pada' | 'jadwal_mulai' | 'prioritas' | 'judul';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBeritaPayload {
  judul: string;
  konten: string;
  tipeBerita: BeritaTipe;
  targetTampil: BeritaTargetTampil;
  targetTokoIds?: string[] | null;
  targetTenantIds?: string[] | null;
  jadwalMulai?: string;
  jadwalSelesai?: string | null;
  intervalTampilMenit: number;
  maksimalTampil?: number | null;
  prioritas: BeritaPrioritas;
  status: BeritaStatus;
  gambarUrl?: string | null;
  lampiranUrl?: string | null;
}

export type UpdateBeritaPayload = Partial<CreateBeritaPayload>;

export type BeritaFormValues = {
  judul: string;
  konten: string;
  tipeBerita: BeritaTipe;
  targetTampil: BeritaTargetTampil;
  targetTokoIds: string[];
  targetTenantIds: string[];
  jadwalMulai: string;
  jadwalSelesai: string;
  intervalTampilMenit: number;
  maksimalTampil: number | '';
  prioritas: BeritaPrioritas;
  status: BeritaStatus;
  gambarUrl: string;
  lampiranUrl: string;
};
