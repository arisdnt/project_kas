export type CatatanVisibilitas = 'pribadi' | 'toko' | 'tenant' | 'publik';

export type CatatanPrioritas = 'rendah' | 'normal' | 'tinggi';

export type CatatanStatus = 'draft' | 'aktif' | 'arsip' | 'dihapus';

export interface CatatanAuthor {
  id: string;
  nama: string;
  username: string;
}

export interface CatatanTokoInfo {
  id: string;
  nama: string;
  kode: string;
}

export interface CatatanRecord {
  id: string;
  tenant_id: string | null;
  toko_id?: string | null;
  user_id: string;
  judul: string;
  konten: string;
  visibilitas: CatatanVisibilitas;
  kategori?: string | null;
  tags: string[];
  prioritas: CatatanPrioritas;
  status: CatatanStatus;
  reminder_pada?: string | null;
  lampiran_url?: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
  pembuat: CatatanAuthor;
  toko?: CatatanTokoInfo;
}

export interface CatatanStats {
  total_catatan: number;
  catatan_aktif: number;
  catatan_draft: number;
  catatan_arsip: number;
  catatan_hari_ini: number;
  catatan_minggu_ini: number;
  catatan_bulan_ini: number;
  catatan_per_visibilitas: Record<CatatanVisibilitas, number>;
  catatan_per_prioritas: Record<CatatanPrioritas, number>;
  reminder_mendatang: number;
}

export interface CatatanFilters {
  search?: string;
  visibilitas?: CatatanVisibilitas;
  kategori?: string;
  tags?: string[];
  prioritas?: CatatanPrioritas;
  status?: Exclude<CatatanStatus, 'dihapus'>;
  toko_id?: string;
  user_id?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  has_reminder?: boolean;
}

export interface CatatanPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export type CatatanListResponse = {
  success: boolean;
  message?: string;
  data: CatatanRecord[];
  pagination?: CatatanPagination;
};

export type CatatanDetailResponse = {
  success: boolean;
  message?: string;
  data: CatatanRecord;
};

export type CatatanStatsResponse = {
  success: boolean;
  message?: string;
  stats: CatatanStats;
};

export type CatatanRecentResponse = {
  success: boolean;
  message?: string;
  data: CatatanRecord[];
  total: number;
};

export interface CreateCatatanPayload {
  judul: string;
  konten: string;
  visibilitas: CatatanVisibilitas;
  kategori?: string;
  tags?: string[];
  prioritas?: CatatanPrioritas;
  status?: Exclude<CatatanStatus, 'dihapus'>;
  reminder_pada?: string | null;
  lampiran_url?: string | null;
  toko_id?: string | null;
}

export interface UpdateCatatanPayload extends Partial<CreateCatatanPayload> {}

export interface CatatanRealtimeEvent {
  type: 'created' | 'updated' | 'deleted';
  data: CatatanRecord | { id: string };
}
