/**
 * Types untuk fitur Profil Saya
 * Definisi interface dan type untuk profil pengguna
 */

export interface ProfilUser {
  id: string;
  user_id: string;
  tenant_id?: string;
  toko_id?: string;
  nama_lengkap?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  gaji_poko?: string;
  komisi_persen?: string;
  tanggal_masuk?: string;
  tanggal_keluar?: string;
  avatar_url?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface UpdateProfilUser {
  nama_lengkap?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  gaji_poko?: string;
  komisi_persen?: string;
  tanggal_masuk?: string;
  tanggal_keluar?: string;
  avatar_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ProfilFormData {
  nama_lengkap: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P' | '';
  gaji_poko: string;
  komisi_persen: string;
  tanggal_masuk: string;
  tanggal_keluar: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface TenantInfo {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  status: 'aktif' | 'nonaktif' | 'suspended';
  paket: 'basic' | 'premium' | 'enterprise';
  max_toko: number;
  max_pengguna: number;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface TokoInfo {
  id: string;
  tenant_id: string;
  nama: string;
  kode: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  status: 'aktif' | 'nonaktif' | 'maintenance';
  timezone: string;
  mata_uang: string;
  logo_url?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface TenantStats {
  total_toko: number;
  total_pengguna: number;
  total_transaksi: number;
}