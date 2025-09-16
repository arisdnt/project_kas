/**
 * Brand Model
 * Supporting model for product brand management
 */

import { z } from 'zod';

export enum BrandStatus {
  ACTIVE = 'aktif',
  INACTIVE = 'nonaktif'
}

export const BrandSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  logo_url: z.string().url().optional(),
  website: z.string().url().optional(),
  status: z.nativeEnum(BrandStatus).default(BrandStatus.ACTIVE),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateBrandSchema = BrandSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateBrandSchema = CreateBrandSchema.partial().omit({
  tenant_id: true,
  toko_id: true
});

export type Brand = z.infer<typeof BrandSchema>;
export type CreateBrand = z.infer<typeof CreateBrandSchema>;
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;