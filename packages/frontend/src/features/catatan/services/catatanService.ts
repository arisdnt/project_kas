import api from '@/core/lib/api';
import {
  CatatanDetailResponse,
  CatatanFilters,
  CatatanListResponse,
  CatatanPagination,
  CatatanRecentResponse,
  CatatanRecord,
  CatatanStats,
  CatatanStatsResponse,
  CreateCatatanPayload,
  UpdateCatatanPayload
} from '@/features/catatan/types/catatan';

function mapRecord(raw: CatatanRecord): CatatanRecord {
  return {
    ...raw,
    tenant_id: raw.tenant_id ?? null,
    toko_id: raw.toko_id ?? null,
    kategori: raw.kategori ?? null,
    reminder_pada: raw.reminder_pada ?? null,
    lampiran_url: raw.lampiran_url ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags : []
  };
}

function mapPagination(pagination?: CatatanPagination) {
  return pagination ?? { page: 1, limit: 20, total: 0, total_pages: 0 };
}

function buildSearchParams(filters: CatatanFilters, page: number, limit: number): Record<string, string> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString()
  };

  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.visibilitas) {
    params.visibilitas = filters.visibilitas;
  }
  if (filters.kategori) {
    params.kategori = filters.kategori;
  }
  if (filters.tags && filters.tags.length > 0) {
    params.tags = filters.tags.join(',');
  }
  if (filters.prioritas) {
    params.prioritas = filters.prioritas;
  }
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.toko_id) {
    params.toko_id = filters.toko_id;
  }
  if (filters.user_id) {
    params.user_id = filters.user_id;
  }
  if (filters.tanggal_mulai) {
    params.tanggal_mulai = filters.tanggal_mulai;
  }
  if (filters.tanggal_selesai) {
    params.tanggal_selesai = filters.tanggal_selesai;
  }
  if (filters.has_reminder !== undefined) {
    params.has_reminder = filters.has_reminder ? 'true' : 'false';
  }

  return params;
}

export const catatanService = {
  async search(filters: CatatanFilters, page: number, limit: number) {
    const response = await api.get<CatatanListResponse>('/catatan/search', buildSearchParams(filters, page, limit));
    const pagination = mapPagination(response.pagination);
    return {
      data: response.data.map(mapRecord),
      pagination
    };
  },

  async getById(id: string): Promise<CatatanRecord> {
    const response = await api.get<CatatanDetailResponse>(`/catatan/${id}`);
    return mapRecord(response.data);
  },

  async getStats(): Promise<CatatanStats> {
    const response = await api.get<CatatanStatsResponse>('/catatan/stats');
    return response.stats;
  },

  async getRecent(limit = 6): Promise<CatatanRecord[]> {
    const response = await api.get<CatatanRecentResponse>('/catatan/filter/recent', { limit: limit.toString() });
    return response.data.map(mapRecord);
  },

  async getWithReminder(limit = 10): Promise<CatatanRecord[]> {
    const response = await api.get<CatatanListResponse>('/catatan/filter/reminder', { limit: limit.toString() });
    return response.data.map(mapRecord);
  },

  async create(payload: CreateCatatanPayload): Promise<CatatanRecord> {
    const response = await api.post<CatatanDetailResponse>('/catatan', payload);
    return mapRecord(response.data);
  },

  async update(id: string, payload: UpdateCatatanPayload): Promise<CatatanRecord> {
    const response = await api.put<CatatanDetailResponse>(`/catatan/${id}`, payload);
    return mapRecord(response.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/catatan/${id}`);
  }
};
