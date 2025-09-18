import api from '@/core/lib/api';

export interface PeranDTO {
  id: string;
  tenant_id: string;
  nama: string;
  deskripsi: string | null;
  level: number | null;
  status: 'aktif' | 'nonaktif';
  dibuat_pada?: string | null;
  diperbarui_pada?: string | null;
}

export interface PeranListResponse { success: boolean; data: PeranDTO[] }
export interface PeranItemResponse { success: boolean; data: PeranDTO }

export interface CreatePeranInput { nama: string; deskripsi?: string; level?: number; status?: 'aktif'|'nonaktif' }
export type UpdatePeranInput = Partial<CreatePeranInput>;

export const peranService = {
  async list(): Promise<PeranDTO[]> {
    const res = await api.get<PeranListResponse>('/peran');
    return res.data;
  },
  async get(id: string): Promise<PeranDTO> {
    const res = await api.get<PeranItemResponse>(`/peran/${id}`);
    return res.data;
  },
  async create(input: CreatePeranInput): Promise<PeranDTO> {
    const res = await api.post<PeranItemResponse>('/peran', input);
    return res.data;
  },
  async update(id: string, input: UpdatePeranInput): Promise<PeranDTO> {
    const res = await api.put<PeranItemResponse>(`/peran/${id}`, input);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/peran/${id}`);
  }
};
