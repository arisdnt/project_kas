export interface UserProfile {
  id: number
  username: string
  fullName: string
  email: string
  telepon?: string
  alamat?: string
  role: string
  fotoProfil?: string
  aktif: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProfileFormData {
  fullName: string
  email: string
  telepon?: string
  alamat?: string
  fotoProfil?: File | string
}

export interface PasswordChangeData {
  passwordLama: string
  passwordBaru: string
  konfirmasiPassword: string
}