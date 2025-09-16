/**
 * Category Model
 * Supporting model for product categorization
 */

import { z } from 'zod';

export enum KategoriStatus {
  ACTIVE = 'aktif',
  INACTIVE = 'nonaktif'
}

export const KategoriSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  icon_url: z.string().url().optional(),
  urutan: z.number().int().min(0).default(0),
  status: z.nativeEnum(KategoriStatus).default(KategoriStatus.ACTIVE),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateKategoriSchema = KategoriSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateKategoriSchema = CreateKategoriSchema.partial().omit({
  tenant_id: true,
  toko_id: true
});

export type Kategori = z.infer<typeof KategoriSchema>;
export type CreateKategori = z.infer<typeof CreateKategoriSchema>;
export type UpdateKategori = z.infer<typeof UpdateKategoriSchema>;