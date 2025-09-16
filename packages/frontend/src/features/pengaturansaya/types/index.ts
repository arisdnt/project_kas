// Type definitions untuk fitur pengaturansaya

export interface UserProfile {
  id: string;
  tenant_id: string;
  toko_id: string;
  peran_id: string;
  username: string;
  status: 'aktif' | 'nonaktif' | 'suspended' | 'cuti';
  last_login: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProfileCardProps {
  profile: UserProfile | null;
  isLoading?: boolean;
}

export interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
  isLoading?: boolean;
}