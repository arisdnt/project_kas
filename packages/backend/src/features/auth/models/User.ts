/**
 * User Model
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod';

// Enum untuk role user
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CASHIER = 'cashier',
  MANAGER = 'manager'
}

// Enum untuk status user
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// Schema validasi untuk User - disesuaikan dengan struktur tabel users
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password_hash: z.string().min(8),
  nama_lengkap: z.string().min(2).max(100),
  telepon: z.string().max(20).optional(),
  avatar_url: z.string().optional(),
  peran_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  level: z.number().int().min(1).max(8),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  is_super_admin: z.boolean().default(false),
  last_login: z.date().nullable().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

// Schema untuk create user (tanpa id, timestamps)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true,
  last_login: true
});

// Schema untuk update user
export const UpdateUserSchema = CreateUserSchema.partial().omit({
  tenant_id: true,
  password_hash: true
});

// Schema untuk login
export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().uuid('Valid tenant ID is required')
});

// Schema untuk change password
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Type definitions
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;

// Interface untuk JWT payload
export interface JWTPayload {
  userId: string; // users.id
  tenantId: string; // users.tenant_id
  tokoId?: string; // users.toko_id
  username: string; // users.username
  role: UserRole; // mapped dari users.level
  level?: number; // users.level (1-8)
  peranId?: string; // users.peran_id
  iat?: number;
  exp?: number;
}

// Interface untuk authenticated user
export interface AuthenticatedUser {
  id: string; // users.id
  tenantId: string; // users.tenant_id
  tokoId?: string; // users.toko_id
  username: string; // users.username
  email: string; // users.email
  namaLengkap: string; // users.nama_lengkap
  telepon?: string; // users.telepon
  avatarUrl?: string; // users.avatar_url
  role: UserRole; // mapped dari users.level
  level?: number; // users.level (1-8)
  peranId?: string; // users.peran_id
  status: UserStatus; // users.status
  isSuperAdmin?: boolean; // users.is_super_admin
  isGodUser?: boolean; // Flag untuk god user
  godPermissions?: string[]; // Permissions khusus god user
}

// Permissions mapping
export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Product management
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Transaction management
  TRANSACTION_CREATE: 'transaction:create',
  TRANSACTION_READ: 'transaction:read',
  TRANSACTION_UPDATE: 'transaction:update',
  TRANSACTION_DELETE: 'transaction:delete',

  // Customer management
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',

  // Report management
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',

  // Settings management
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update'
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [UserRole.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE
  ],
  [UserRole.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT
  ],
  [UserRole.CASHIER]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_READ
  ]
};

// Helper function untuk check permission
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission as any);
};
