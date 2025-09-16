/**
 * Inventory Model
 * Model for product inventory management per store
 */

import { z } from 'zod';

export const InventarisSchema = z.object({
  produk_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  stok_tersedia: z.number().int().min(0).default(0),
  stok_reserved: z.number().int().min(0).default(0),
  harga_jual_toko: z.number().min(0).optional(),
  stok_minimum_toko: z.number().int().min(0).default(0),
  lokasi_rak: z.string().max(50).optional(),
  terakhir_update: z.date()
});

export const CreateInventarisSchema = InventarisSchema.omit({
  terakhir_update: true
});

export const UpdateInventarisSchema = CreateInventarisSchema.partial().omit({
  produk_id: true,
  toko_id: true
});

export const InventarisQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  toko_id: z.string().uuid().optional(),
  low_stock: z.enum(['true', 'false']).optional()
});

export type Inventaris = z.infer<typeof InventarisSchema>;
export type CreateInventaris = z.infer<typeof CreateInventarisSchema>;
export type UpdateInventaris = z.infer<typeof UpdateInventarisSchema>;
export type InventarisQuery = z.infer<typeof InventarisQuerySchema>;