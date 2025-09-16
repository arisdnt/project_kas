/**
 * Konfigurasi God User - Super Admin dengan Akses Penuh
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema validasi untuk konfigurasi god user
const GodUserConfigSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  passwordHash: z.string().min(60, 'Password hash harus valid bcrypt'),
  email: z.string().email('Email harus valid'),
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  status: z.literal('god'),
  permissions: z.array(z.string()).default([
    'all:create',
    'all:read', 
    'all:update',
    'all:delete',
    'tenant:bypass',
    'system:admin'
  ])
});

export type GodUserConfig = z.infer<typeof GodUserConfigSchema>;

// Hash password god123 dengan bcrypt salt rounds 12
const GOD_PASSWORD_HASH = '$2a$12$wyFusB7MvuhwyB3jLwg/rO7iAIQnGLfQhsTKewLuQMbVL7Z7PRDUO';

// Konfigurasi default god user
const defaultGodUserConfig: GodUserConfig = {
  username: 'god',
  passwordHash: GOD_PASSWORD_HASH,
  email: 'god@system.internal',
  namaLengkap: 'God User - System Administrator',
  status: 'god' as const,
  permissions: [
    'all:create',
    'all:read',
    'all:update', 
    'all:delete',
    'tenant:bypass',
    'system:admin',
    'database:direct',
    'config:modify',
    'user:impersonate'
  ]
};

/**
 * Validasi dan ekspor konfigurasi god user
 */
export const godUserConfig = GodUserConfigSchema.parse(defaultGodUserConfig);

/**
 * Fungsi untuk memverifikasi password god user
 */
export const verifyGodPassword = async (password: string): Promise<boolean> => {
  return bcrypt.compare(password, godUserConfig.passwordHash);
};

/**
 * Fungsi untuk mengecek apakah user adalah god user
 */
export const isGodUser = (username: string): boolean => {
  // Daftar username yang dikenali sebagai god user
  const godUsernames = [godUserConfig.username, 'testgod'];
  return godUsernames.includes(username);
};

/**
 * Fungsi untuk memeriksa apakah user memiliki permission god
 */
export const hasGodPermission = (permission?: string): boolean | string[] => {
  if (permission) {
    return godUserConfig.permissions.includes(permission);
  }
  return godUserConfig.permissions;
};

/**
 * Konstanta untuk identifikasi god user
 */
export const GOD_USER_ID = 'god-user-system-id';
export const GOD_TENANT_ID = 'god-tenant-bypass';

export { GodUserConfigSchema };