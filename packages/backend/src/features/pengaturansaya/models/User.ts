/**
 * User Model untuk Pengaturan Saya
 * Model khusus untuk mengelola data user yang sedang login
 */

import { z } from 'zod';

// Enum untuk status user sesuai database
export enum UserStatus {
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif',
  SUSPENDED = 'suspended',
  CUTI = 'cuti'
}

// Schema validasi untuk User - sesuai struktur tabel users
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

// Schema untuk response user (tanpa password_hash)
export const UserResponseSchema = UserSchema.omit({
  password_hash: true
});

// Schema untuk ubah password
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(8, 'Password baru minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password harus mengandung huruf kecil, huruf besar, dan angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password baru dan konfirmasi tidak cocok",
  path: ['confirmPassword']
});

// Schema untuk update profil user (tanpa password)
export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  status: z.nativeEnum(UserStatus).optional()
}).strict();

// Type definitions
export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileSchema>;

// Interface untuk response API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Interface untuk user context dari JWT
export interface UserContext {
  id: string;
  tenant_id: string;
  toko_id?: string;
  peran_id?: string;
  username: string;
  status: UserStatus;
}

// Interface untuk pagination
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Interface untuk response dengan pagination
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Konstanta untuk validasi
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;

// Helper function untuk validasi password strength
export const validatePasswordStrength = (password: string): boolean => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  
  return hasLowerCase && hasUpperCase && hasNumbers && hasMinLength;
};

// Helper function untuk format user response
export const formatUserResponse = (user: User): UserResponse => {
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Default pagination values
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;