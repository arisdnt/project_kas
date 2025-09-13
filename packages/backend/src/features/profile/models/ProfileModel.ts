import { RowDataPacket } from 'mysql2'
import pool from '@/core/database/connection'

export interface UserProfileData extends RowDataPacket {
  id: number
  username: string
  email: string
  nama_lengkap: string
  telepon?: string
  foto_profil?: string
  is_active: boolean
  is_super_admin: boolean
  created_at: Date
  updated_at: Date
  // Data dari tabel pengguna
  pengguna_id?: number
  tenant_id?: number
  toko_id?: number
  peran_id?: number
  nama_pengguna?: string
  // Data dari tabel tenant
  nama_tenant?: string
  email_tenant?: string
  telepon_tenant?: string
  alamat_tenant?: string
  paket_tenant?: string
  max_toko?: number
  max_pengguna?: number
  // Data dari tabel toko
  nama_toko?: string
  alamat_toko?: string
  // Data dari tabel peran
  nama_peran?: string
  deskripsi_peran?: string
}

export class ProfileModel {
  static async getCompleteProfile(userId: string): Promise<UserProfileData | null> {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.nama_lengkap,
        u.telepon,
        u.avatar_url as foto_profil,
        u.status as is_active,
        u.is_super_admin,
        u.dibuat_pada as created_at,
        u.diperbarui_pada as updated_at,
        p.id as pengguna_id,
        u.tenant_id,
        p.toko_id,
        p.peran_id,
        p.nama as nama_pengguna,
        t.nama as nama_tenant,
        t.email as email_tenant,
        t.telepon as telepon_tenant,
        t.alamat as alamat_tenant,
        t.paket as paket_tenant,
        t.max_toko,
        t.max_pengguna,
        tk.nama as nama_toko,
        tk.alamat as alamat_toko,
        pr.nama as nama_peran,
        pr.deskripsi as deskripsi_peran
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      LEFT JOIN pengguna p ON u.id = p.user_id
      LEFT JOIN toko tk ON p.toko_id = tk.id
      LEFT JOIN peran pr ON p.peran_id = pr.id
      WHERE u.id = ?
      LIMIT 1
    `
    
    try {
      const [rows] = await pool.execute<UserProfileData[]>(query, [userId])
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('Error fetching complete profile:', error)
      throw error
    }
  }

  static async getUserSessions(userId: string) {
    const query = `
      SELECT 
        id,
        session_token,
        ip_address,
        user_agent,
        dibuat_pada as created_at,
        expires_at,
        is_active
      FROM user_sessions 
      WHERE user_id = ? 
      ORDER BY dibuat_pada DESC
    `
    
    try {
      const [rows] = await pool.execute(query, [userId])
      return rows
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      throw error
    }
  }

  static async getAuditLogs(userId: string, limit: number = 10) {
    // Validasi limit untuk keamanan
    const safeLimit = Math.max(1, Math.min(100, Number(limit)))
    
    const query = `
      SELECT 
        id,
        tabel,
        record_id,
        aksi,
        data_lama,
        data_baru,
        ip_address,
        user_agent,
        dibuat_pada as created_at
      FROM audit_log 
      WHERE user_id = ? 
      ORDER BY dibuat_pada DESC
      LIMIT ${safeLimit}
    `
    
    try {
      const [rows] = await pool.execute(query, [userId])
      return rows
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  }

  static async updateProfile(userId: string, data: Partial<UserProfileData>) {
    const fields = []
    const values = []
    
    if (data.nama_lengkap) {
      fields.push('nama_lengkap = ?')
      values.push(data.nama_lengkap)
    }
    if (data.email) {
      fields.push('email = ?')
      values.push(data.email)
    }
    if (data.telepon) {
      fields.push('telepon = ?')
      values.push(data.telepon)
    }
    // Note: alamat field removed as it doesn't exist in users table
    if (data.foto_profil) {
      fields.push('avatar_url = ?')
      values.push(data.foto_profil)
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update')
    }
    
    fields.push('diperbarui_pada = NOW()')
    values.push(userId)
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
    
    try {
      const [result] = await pool.execute(query, values)
      return result
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }
}