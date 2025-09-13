export interface SessionData {
  id: string
  session_token: string
  ip_address: string
  user_agent: string
  created_at: string
  expires_at: string
  is_active: number
}

export interface AuditLogData {
  id: string
  tabel: string
  record_id: string
  aksi: string
  data_lama: any
  data_baru: any
  ip_address: string
  user_agent: string
  created_at: string
}

export interface CompleteProfileData {
  profile: {
    id: string
    username: string
    email: string
    nama_lengkap: string
    telepon?: string
    foto_profil?: string
    is_active: string
    is_super_admin: number
    created_at: string
    updated_at: string
    pengguna_id?: number
    tenant_id?: number
    toko_id?: number
    peran_id?: number
    nama_pengguna?: string
    nama_tenant?: string
    email_tenant?: string
    telepon_tenant?: string
    alamat_tenant?: string
    paket_tenant?: string
    max_toko?: number
    max_pengguna?: number
    nama_toko?: string
    alamat_toko?: string
    nama_peran?: string
    deskripsi_peran?: string
  }
  sessions: SessionData[]
  auditLogs: AuditLogData[]
  statistics: {
    totalSessions: number
    activeSessions: number
    lastLogin: string | null
    totalAuditLogs: number
  }
}

export interface ProfileFormData {
  fullName: string
  email: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  nama_lengkap: string
  email: string
  telepon: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}