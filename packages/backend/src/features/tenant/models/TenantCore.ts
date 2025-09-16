/**
 * Tenant Core Model
 * Based on database schema for tenant management
 */

import { z } from 'zod';

export enum TenantStatus {
  ACTIVE = 'aktif',
  INACTIVE = 'nonaktif',
  SUSPENDED = 'suspended'
}

export enum TenantPaket {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export const TenantSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1).max(100),
  email: z.string().email(),
  telepon: z.string().max(20).optional(),
  alamat: z.string().optional(),
  status: z.nativeEnum(TenantStatus).default(TenantStatus.ACTIVE),
  paket: z.nativeEnum(TenantPaket).default(TenantPaket.BASIC),
  max_toko: z.number().int().min(1).default(1),
  max_pengguna: z.number().int().min(1).default(5),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateTenantSchema = CreateTenantSchema.partial();

export const SearchTenantQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.nativeEnum(TenantStatus).optional(),
  paket: z.nativeEnum(TenantPaket).optional()
});

export const TokoSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  nama: z.string().min(1).max(100),
  kode: z.string().min(1).max(10),
  alamat: z.string().optional(),
  telepon: z.string().max(20).optional(),
  email: z.string().email().optional(),
  status: z.nativeEnum(TenantStatus).default(TenantStatus.ACTIVE),
  timezone: z.string().default('Asia/Jakarta'),
  mata_uang: z.string().default('IDR'),
  logo_url: z.string().url().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTokoSchema = TokoSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateTokoSchema = CreateTokoSchema.partial().omit({
  tenant_id: true
});

export type Tenant = z.infer<typeof TenantSchema>;
export type CreateTenant = z.infer<typeof CreateTenantSchema>;
export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;
export type SearchTenantQuery = z.infer<typeof SearchTenantQuerySchema>;
export type Toko = z.infer<typeof TokoSchema>;
export type CreateToko = z.infer<typeof CreateTokoSchema>;
export type UpdateToko = z.infer<typeof UpdateTokoSchema>;