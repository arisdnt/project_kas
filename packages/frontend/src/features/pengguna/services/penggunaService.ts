import api from '@/core/lib/api';

export interface PenggunaDTO {
  id: string;
  tenant_id: string;
  toko_id: string | null;
  peran_id: string | null;
  username: string;
  status: 'aktif'|'nonaktif'|'suspended'|'cuti';
  last_login: string | null;
  dibuat_pada?: string | null;
  diperbarui_pada?: string | null;
  peran_nama?: string | null;
  peran_level?: number | null;
  tenant_nama?: string | null;
  toko_nama?: string | null;
  nama_lengkap?: string | null;
  email?: string | null;
  telepon?: string | null;
}

export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number }

// Backend response shapes
interface ListEnvelope { success: boolean; data: { pengguna: PenggunaDTO[]; pagination: PaginationMeta } }
interface ItemEnvelope { success: boolean; data: PenggunaDTO }

export interface CreatePenggunaInput {
  username: string;
  password: string;
  peran_id?: string | null;
  tenant_id?: string | null;
  toko_id?: string | null;
  status?: 'aktif'|'nonaktif'|'suspended'|'cuti';
  nama_lengkap?: string;
  email?: string;
  telepon?: string;
}
export type UpdatePenggunaInput = Partial<CreatePenggunaInput>;

export const penggunaService = {
  async list(params: { search?: string; page?: number; limit?: number } = {}): Promise<{ items: PenggunaDTO[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const envelope = await api.get<ListEnvelope>(`/pengguna?${query.toString()}`);
    const payload = envelope.data;
    return { items: payload.pengguna, pagination: payload.pagination };
  },
  async get(id: string): Promise<PenggunaDTO> {
    const envelope = await api.get<ItemEnvelope>(`/pengguna/${id}`);
    return envelope.data;
  },
  async create(input: CreatePenggunaInput): Promise<PenggunaDTO> {
    // Konversi string kosong menjadi null untuk field opsional
    const cleanedInput = {
      ...input,
      peran_id: input.peran_id || null,
      tenant_id: input.tenant_id || null,
      toko_id: input.toko_id || null,
      nama_lengkap: input.nama_lengkap || undefined,
      email: input.email || undefined,
      telepon: input.telepon || undefined
    };
    
    const envelope = await api.post<ItemEnvelope>('/pengguna', cleanedInput);
    return envelope.data;
  },
  async update(id: string, input: UpdatePenggunaInput): Promise<PenggunaDTO> {
    // Konversi string kosong menjadi null untuk field opsional
    const cleanedInput = {
      ...input,
      peran_id: input.peran_id || null,
      tenant_id: input.tenant_id || null,
      toko_id: input.toko_id || null,
      nama_lengkap: input.nama_lengkap || undefined,
      email: input.email || undefined,
      telepon: input.telepon || undefined
    };
    
    const envelope = await api.put<ItemEnvelope>(`/pengguna/${id}`, cleanedInput);
    return envelope.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/pengguna/${id}`);
  },
  async getTenants(): Promise<{id: string; nama: string; status: string}[]> {
    const envelope = await api.get<{success: boolean; data: {id: string; nama: string; status: string}[]}>('/pengguna/tenants');
    return envelope.data;
  },
  async getStoresByTenant(tenantId: string): Promise<{id: string; nama: string; kode: string}[]> {
    const envelope = await api.get<{success: boolean; data: {id: string; nama: string; kode: string}[]}>(`/pengguna/stores/${tenantId}`);
    return envelope.data;
  },
  async getRoles(): Promise<{id: string; nama: string; level: number; deskripsi?: string}[]> {
    const envelope = await api.get<{success: boolean; data: {id: string; nama: string; level: number; deskripsi?: string}[]}>('/pengguna/roles');
    return envelope.data;
  }
};
