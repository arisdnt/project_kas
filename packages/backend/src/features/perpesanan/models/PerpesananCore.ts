/**
 * Model Core untuk Perpesanan
 * Definisi tipe data dan validasi untuk sistem messaging
 */

import { z } from 'zod';

// Enum untuk status pesan
export const StatusPesan = {
  DIKIRIM: 'dikirim',
  DIBACA: 'dibaca',
  DIBALAS: 'dibalas',
  DIHAPUS: 'dihapus'
} as const;

// Enum untuk prioritas pesan
export const PrioritasPesan = {
  RENDAH: 'rendah',
  NORMAL: 'normal',
  TINGGI: 'tinggi',
  URGENT: 'urgent'
} as const;

// Interface untuk Perpesanan
export interface Perpesanan {
  id: string;
  tenant_id: string;
  pengirim_id: string;
  penerima_id: string;
  pesan: string;
  status: keyof typeof StatusPesan;
  prioritas: keyof typeof PrioritasPesan;
  dibaca_pada?: Date;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

// Interface untuk response dengan data pengirim/penerima
export interface PerpesananWithUsers extends Perpesanan {
  pengirim: {
    id: string;
    nama: string;
    username: string;
  };
  penerima: {
    id: string;
    nama: string;
    username: string;
  };
}

// Schema validasi untuk membuat pesan baru
export const CreatePerpesananSchema = z.object({
  penerima_id: z.string().min(1, 'ID penerima tidak boleh kosong'),
  pesan: z.string()
    .min(1, 'Pesan tidak boleh kosong')
    .max(5000, 'Pesan maksimal 5000 karakter'),
  prioritas: z.enum(['rendah', 'normal', 'tinggi', 'urgent'])
    .optional()
    .default('normal')
});

// Schema validasi untuk update pesan
export const UpdatePerpesananSchema = z.object({
  pesan: z.string()
    .min(1, 'Pesan tidak boleh kosong')
    .max(5000, 'Pesan maksimal 5000 karakter')
    .optional(),
  prioritas: z.enum(['rendah', 'normal', 'tinggi', 'urgent']).optional()
});

// Schema validasi untuk pencarian pesan
export const SearchPerpesananSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  status: z.enum(['dikirim', 'dibaca', 'dibalas', 'dihapus']).optional(),
  prioritas: z.enum(['rendah', 'normal', 'tinggi', 'urgent']).optional(),
  pengirim_id: z.string().optional(),
  penerima_id: z.string().optional(),
  tanggal_mulai: z.string().optional(),
  tanggal_selesai: z.string().optional(),
  sort_by: z.enum(['dibuat_pada', 'diperbarui_pada', 'prioritas']).optional().default('dibuat_pada'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

// Schema untuk menandai pesan sebagai dibaca
export const MarkAsReadSchema = z.object({
  pesan_ids: z.array(z.string()).min(1, 'Minimal satu ID pesan diperlukan')
});

// Tipe untuk request create
export type CreatePerpesanan = z.infer<typeof CreatePerpesananSchema>;

// Tipe untuk request update
export type UpdatePerpesanan = z.infer<typeof UpdatePerpesananSchema>;

// Tipe untuk query pencarian
export type SearchPerpesananQuery = z.infer<typeof SearchPerpesananSchema>;

// Tipe untuk mark as read
export type MarkAsRead = z.infer<typeof MarkAsReadSchema>;

// Interface untuk statistik pesan
export interface PerpesananStats {
  total_pesan: number;
  pesan_belum_dibaca: number;
  pesan_hari_ini: number;
  pesan_minggu_ini: number;
  pesan_bulan_ini: number;
  pesan_per_prioritas: {
    rendah: number;
    normal: number;
    tinggi: number;
    urgent: number;
  };
}

// Interface untuk response API
export interface PerpesananResponse {
  success: boolean;
  message: string;
  data?: Perpesanan | PerpesananWithUsers | Perpesanan[] | PerpesananWithUsers[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats?: PerpesananStats;
}