/**
 * User Model
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod';

// Enum untuk role user berdasarkan level di tabel peran
export enum UserRole {
  GOD = 'god',           // Level 1 - God User
  ADMIN = 'admin',       // Level 2 - Admin Tenant
  ADMIN_TOKO = 'admin_toko', // Level 3 - Admin Toko
  KASIR = 'kasir',       // Level 4 - Kasir
  REVIEWER = 'reviewer'  // Level 5 - Reviewer
}

// Enum untuk status user sesuai database
export enum UserStatus {
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif',
  SUSPENDED = 'suspended',
  CUTI = 'cuti'
}

// Schema validasi untuk User - disesuaikan dengan struktur tabel users
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().nullable().optional(),
  peran_id: z.string().uuid().nullable().optional(),
  username: z.string().min(3).max(50),
  password_hash: z.string().min(8),
  status: z.nativeEnum(UserStatus).default(UserStatus.AKTIF),
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
  tenantId: z.string().uuid('Valid tenant ID is required').optional()
});

// Schema untuk god login (tanpa tenant)
export const GodLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
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
export type GodLoginRequest = z.infer<typeof GodLoginSchema>;
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

// Interface untuk user context dalam JWT
export interface UserContext {
  id: string; // users.id
  tenantId: string; // users.tenant_id
  tokoId?: string; // users.toko_id
  peranId?: string; // users.peran_id
  username: string; // users.username
  role: UserRole; // mapped dari users.peran_id
  status: UserStatus; // users.status
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

  // Settings permissions
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // System management permissions
  SYSTEM_MANAGE: 'system:manage',

  // Notification permissions
  NOTIFICATION_CREATE: 'notification:create',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_UPDATE: 'notification:update',
  NOTIFICATION_DELETE: 'notification:delete',

  // Document permissions
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',

  // Store permissions
  STORE_CREATE: 'store:create',
  STORE_READ: 'store:read',
  STORE_UPDATE: 'store:update',
  STORE_DELETE: 'store:delete',

  // Backup permissions
  BACKUP_CREATE: 'backup:create',
  BACKUP_READ: 'backup:read',
  BACKUP_UPDATE: 'backup:update',
  BACKUP_DELETE: 'backup:delete',

  // Integration permissions
  INTEGRATION_CREATE: 'integration:create',
  INTEGRATION_READ: 'integration:read',
  INTEGRATION_UPDATE: 'integration:update',
  INTEGRATION_DELETE: 'integration:delete',

  // Webhook permissions
  WEBHOOK_CREATE: 'webhook:create',
  WEBHOOK_READ: 'webhook:read',
  WEBHOOK_UPDATE: 'webhook:update',
  WEBHOOK_DELETE: 'webhook:delete'
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [UserRole.GOD]: Object.values(PERMISSIONS),
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
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.STORE_CREATE,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_UPDATE,
    PERMISSIONS.STORE_DELETE,
    PERMISSIONS.BACKUP_CREATE,
    PERMISSIONS.BACKUP_READ,
    PERMISSIONS.BACKUP_UPDATE,
    PERMISSIONS.BACKUP_DELETE
  ],
  [UserRole.ADMIN_TOKO]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.TRANSACTION_UPDATE,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_UPDATE
  ],
  [UserRole.KASIR]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_READ
  ],
  [UserRole.REVIEWER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.STORE_READ
  ]
};

// Helper function untuk check permission
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission as any);
};
