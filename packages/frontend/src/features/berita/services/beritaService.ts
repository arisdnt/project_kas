import api from '@/core/lib/api';
import {
  BeritaItem,
  BeritaPagination,
  BeritaStats,
  CreateBeritaPayload,
  SearchBeritaParams,
  UpdateBeritaPayload
} from '@/features/berita/types/berita';

function normalizeDate(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapApiItem(payload: any): BeritaItem {
  return {
    id: payload.id,
    tenantId: payload.tenantId,
    tokoId: payload.tokoId ?? null,
    userId: payload.userId,
    judul: payload.judul,
    konten: payload.konten,
    tipeBerita: payload.tipeBerita,
    targetTampil: payload.targetTampil,
    targetTokoIds: Array.isArray(payload.targetTokoIds) ? payload.targetTokoIds : null,
    targetTenantIds: Array.isArray(payload.targetTenantIds) ? payload.targetTenantIds : null,
    jadwalMulai: normalizeDate(payload.jadwalMulai) ?? new Date().toISOString(),
    jadwalSelesai: normalizeDate(payload.jadwalSelesai),
    intervalTampilMenit: Number(payload.intervalTampilMenit) || 1,
    maksimalTampil: payload.maksimalTampil != null ? Number(payload.maksimalTampil) : null,
    prioritas: payload.prioritas,
    status: payload.status,
    gambarUrl: payload.gambarUrl ?? null,
    lampiranUrl: payload.lampiranUrl ?? null,
    dibuatPada: normalizeDate(payload.dibuatPada) ?? new Date().toISOString(),
    diperbaruiPada: normalizeDate(payload.diperbaruiPada) ?? new Date().toISOString(),
    namaUser: payload.namaUser ?? '-',
    namaToko: payload.namaToko ?? null
  };
}

function buildQueryParams(params?: SearchBeritaParams): Record<string, string> | undefined {
  if (!params) {
    return undefined;
  }
  const query: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (key === 'page' || key === 'limit') {
      query[key] = String(value);
      return;
    }
    query[key] = value as string;
  });
  return query;
}

export interface SearchBeritaResponse {
  data: BeritaItem[];
  pagination: BeritaPagination;
}

export const beritaService = {
  async search(params?: SearchBeritaParams): Promise<SearchBeritaResponse> {
    const response = await api.get<{
      success: boolean;
      data: any[];
      pagination: BeritaPagination;
    }>('/berita/search', buildQueryParams(params));

    const payload = Array.isArray(response.data) ? response.data : [];

    return {
      data: payload.map(mapApiItem),
      pagination: response.pagination ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? payload.length,
        total: payload.length,
        totalPages: 1
      }
    };
  },

  async getById(id: string): Promise<BeritaItem> {
    const response = await api.get<{ success: boolean; data: any }>(`/berita/${id}`);
    return mapApiItem(response.data);
  },

  async create(payload: CreateBeritaPayload): Promise<BeritaItem> {
    const response = await api.post<{ success: boolean; data: any }>(
      '/berita',
      payload
    );
    return mapApiItem(response.data);
  },

  async update(id: string, payload: UpdateBeritaPayload): Promise<BeritaItem> {
    const response = await api.put<{ success: boolean; data: any }>(
      `/berita/${id}`,
      payload
    );
    return mapApiItem(response.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/berita/${id}`);
  },

  async getStats(): Promise<BeritaStats> {
    const response = await api.get<{ success: boolean; data: BeritaStats }>('/berita/stats');
    return response.data;
  },

  async getActiveNews(): Promise<BeritaItem[]> {
    const response = await api.get<{ success: boolean; data: any[] }>('/berita/active');
    return (Array.isArray(response.data) ? response.data : []).map(mapApiItem);
  }
};
