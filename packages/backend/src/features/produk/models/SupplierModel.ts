/**
 * Supplier Model
 * Supporting model for product supplier management
 */

import { z } from 'zod';

export enum SupplierStatus {
  ACTIVE = 'aktif',
  INACTIVE = 'nonaktif'
}

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  nama: z.string().min(1).max(100),
  kontak_person: z.string().max(100).optional(),
  telepon: z.string().max(20).optional(),
  email: z.string().email().optional(),
  alamat: z.string().optional(),
  npwp: z.string().max(20).optional(),
  bank_nama: z.string().max(50).optional(),
  bank_rekening: z.string().max(30).optional(),
  bank_atas_nama: z.string().max(100).optional(),
  status: z.nativeEnum(SupplierStatus).default(SupplierStatus.ACTIVE),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateSupplierSchema = SupplierSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial().omit({
  tenant_id: true,
  toko_id: true
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;