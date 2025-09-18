import { z } from 'zod';
import { pool } from '@/core/database/connection';

// Incoming create payload (plain password)
export const PenggunaCreateSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  peran_id: z.string().uuid().nullable().optional(),
  tenant_id: z.string().uuid().nullable().optional(),
  toko_id: z.string().uuid().nullable().optional(),
  status: z.enum(['aktif','nonaktif','suspended','cuti']).default('aktif'),
  nama_lengkap: z.string().max(255).optional(),
  email: z.string().email().optional(),
  telepon: z.string().max(20).optional()
});

// Incoming update payload (all optional, password optional)
export const PenggunaUpdateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8).optional(),
  peran_id: z.string().uuid().nullable().optional(),
  tenant_id: z.string().uuid().nullable().optional(),
  toko_id: z.string().uuid().nullable().optional(),
  status: z.enum(['aktif','nonaktif','suspended','cuti']).optional(),
  nama_lengkap: z.string().max(255).optional(),
  email: z.string().email().optional(),
  telepon: z.string().max(20).optional()
});

export type PenggunaCreateInput = z.infer<typeof PenggunaCreateSchema>;
export type PenggunaUpdateInput = z.infer<typeof PenggunaUpdateSchema>;

export interface Pengguna {
  id: string;
  tenant_id: string;
  toko_id: string | null;
  peran_id: string | null;
  username: string;
  status: 'aktif'|'nonaktif'|'suspended'|'cuti';
  last_login: string | null;
  dibuat_pada: string | null;
  diperbarui_pada: string | null;
  peran_nama?: string | null; // joined
  peran_level?: number | null; // joined
  tenant_nama?: string | null; // joined
  toko_nama?: string | null; // joined
  nama_lengkap?: string | null; // joined from detail_user
  email?: string | null; // joined from detail_user
  telepon?: string | null; // joined from detail_user
}

export class PenggunaModel {
  static async list(tenantId: string, opts: { search?: string; limit: number; offset: number }) {
    const params: any[] = [tenantId];
    let where = 'u.tenant_id = ?';
    if (opts.search) {
      where += ' AND (u.username LIKE ? OR p.nama LIKE ?)';
      const like = `%${opts.search}%`;
      params.push(like, like);
    }
    params.push(opts.limit, opts.offset);
    const sql = `SELECT u.id,u.tenant_id,u.toko_id,u.peran_id,u.username,u.status,u.last_login,u.dibuat_pada,u.diperbarui_pada,
                        p.nama as peran_nama, p.level as peran_level,
                        t.nama as tenant_nama,
                        tk.nama as toko_nama,
                        d.nama_lengkap, d.email, d.telepon
                FROM users u
                LEFT JOIN peran p ON p.id = u.peran_id
                LEFT JOIN tenants t ON t.id = u.tenant_id
                LEFT JOIN toko tk ON tk.id = u.toko_id
                LEFT JOIN detail_user d ON d.user_id = u.id
                WHERE ${where}
                ORDER BY u.dibuat_pada DESC
                LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, params);

    // Count
    const countParams = [tenantId];
    let countWhere = 'tenant_id = ?';
    if (opts.search) {
      countWhere += ' AND username LIKE ?';
      countParams.push(`%${opts.search}%`);
    }
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${countWhere}`, countParams);
    // @ts-ignore
    const total = countRows[0]?.total ?? 0;

    return { data: rows as Pengguna[], total };
  }

  // Global list (super admin / god) - no tenant constraint
  static async listGlobal(opts: { search?: string; limit: number; offset: number }) {
    const params: any[] = [];
    let where = '1=1';
    if (opts.search) {
      where += ' AND (u.username LIKE ? OR p.nama LIKE ?)';
      const like = `%${opts.search}%`;
      params.push(like, like);
    }
    params.push(opts.limit, opts.offset);
    const sql = `SELECT u.id,u.tenant_id,u.toko_id,u.peran_id,u.username,u.status,u.last_login,u.dibuat_pada,u.diperbarui_pada,
                        p.nama as peran_nama, p.level as peran_level,
                        t.nama as tenant_nama,
                        tk.nama as toko_nama,
                        d.nama_lengkap, d.email, d.telepon
                FROM users u
                LEFT JOIN peran p ON p.id = u.peran_id
                LEFT JOIN tenants t ON t.id = u.tenant_id
                LEFT JOIN toko tk ON tk.id = u.toko_id
                LEFT JOIN detail_user d ON d.user_id = u.id
                WHERE ${where}
                ORDER BY u.dibuat_pada DESC
                LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, params);

    // Count (mirror search only on username for consistency with existing pattern)
    const countParams: any[] = [];
    let countWhere = '1=1';
    if (opts.search) { countWhere += ' AND username LIKE ?'; countParams.push(`%${opts.search}%`); }
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${countWhere}`, countParams);
    // @ts-ignore
    const total = countRows[0]?.total ?? 0;
    return { data: rows as Pengguna[], total };
  }

  // Store (toko) scoped list (levels 3-5)
  static async listByStore(tenantId: string, tokoId: string, opts: { search?: string; limit: number; offset: number }) {
    const params: any[] = [tenantId, tokoId];
    let where = 'u.tenant_id = ? AND u.toko_id = ?';
    if (opts.search) {
      where += ' AND (u.username LIKE ? OR p.nama LIKE ?)' ;
      const like = `%${opts.search}%`;
      params.push(like, like);
    }
    params.push(opts.limit, opts.offset);
    const sql = `SELECT u.id,u.tenant_id,u.toko_id,u.peran_id,u.username,u.status,u.last_login,u.dibuat_pada,u.diperbarui_pada,
                        p.nama as peran_nama, p.level as peran_level,
                        t.nama as tenant_nama,
                        tk.nama as toko_nama,
                        d.nama_lengkap, d.email, d.telepon
                FROM users u
                LEFT JOIN peran p ON p.id = u.peran_id
                LEFT JOIN tenants t ON t.id = u.tenant_id
                LEFT JOIN toko tk ON tk.id = u.toko_id
                LEFT JOIN detail_user d ON d.user_id = u.id
                WHERE ${where}
                ORDER BY u.dibuat_pada DESC
                LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, params);

    const countParams: any[] = [tenantId, tokoId];
    let countWhere = 'tenant_id = ? AND toko_id = ?';
    if (opts.search) { countWhere += ' AND username LIKE ?'; countParams.push(`%${opts.search}%`); }
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${countWhere}`, countParams);
    // @ts-ignore
    const total = countRows[0]?.total ?? 0;
    return { data: rows as Pengguna[], total };
  }

  static async findById(id: string, tenantId: string): Promise<Pengguna | null> {
    const [rows] = await pool.query(
      `SELECT u.id,u.tenant_id,u.toko_id,u.peran_id,u.username,u.status,u.last_login,u.dibuat_pada,u.diperbarui_pada,
              p.nama as peran_nama, p.level as peran_level,
              t.nama as tenant_nama,
              tk.nama as toko_nama,
              d.nama_lengkap, d.email, d.telepon
       FROM users u
       LEFT JOIN peran p ON p.id = u.peran_id
       LEFT JOIN tenants t ON t.id = u.tenant_id
       LEFT JOIN toko tk ON tk.id = u.toko_id
       LEFT JOIN detail_user d ON d.user_id = u.id
       WHERE u.id = ? AND u.tenant_id = ? LIMIT 1`,
      [id, tenantId]
    );
    const list = rows as Pengguna[];
    return list.length ? list[0] : null;
  }

  static async create(input: PenggunaCreateInput & { password_hash: string }, defaultTenantId: string): Promise<Pengguna> {
    const actualTenantId = input.tenant_id || defaultTenantId;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert user
      const userSql = `INSERT INTO users (id, tenant_id, toko_id, peran_id, username, password_hash, status)
                       VALUES (UUID(),?,?,?,?,?,?)`;
      const userParams = [actualTenantId, input.toko_id ?? null, input.peran_id ?? null, input.username, input.password_hash, input.status ?? 'aktif'];
      await conn.query(userSql, userParams);

      // Get the created user ID
      const [userRows] = await conn.query(
        'SELECT id FROM users WHERE username = ? AND tenant_id = ? ORDER BY dibuat_pada DESC LIMIT 1',
        [input.username, actualTenantId]
      );
      const userId = (userRows as any[])[0]?.id;

      // Insert detail_user if additional info provided
      if (userId && (input.nama_lengkap || input.email || input.telepon)) {
        const detailSql = `INSERT INTO detail_user (id, user_id, tenant_id, toko_id, nama_lengkap, email, telepon)
                          VALUES (UUID(), ?, ?, ?, ?, ?, ?)`;
        const detailParams = [userId, actualTenantId, input.toko_id ?? null, input.nama_lengkap ?? null, input.email ?? null, input.telepon ?? null];
        await conn.query(detailSql, detailParams);
      }

      await conn.commit();

      // Return the created user with all joins
      const [rows] = await conn.query(
        `SELECT u.id,u.tenant_id,u.toko_id,u.peran_id,u.username,u.status,u.last_login,u.dibuat_pada,u.diperbarui_pada,
                p.nama as peran_nama, p.level as peran_level,
                t.nama as tenant_nama,
                tk.nama as toko_nama,
                d.nama_lengkap, d.email, d.telepon
         FROM users u
         LEFT JOIN peran p ON p.id = u.peran_id
         LEFT JOIN tenants t ON t.id = u.tenant_id
         LEFT JOIN toko tk ON tk.id = u.toko_id
         LEFT JOIN detail_user d ON d.user_id = u.id
         WHERE u.id = ? LIMIT 1`,
        [userId]
      );
      return (rows as Pengguna[])[0];
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id: string, tenantId: string, input: Partial<PenggunaCreateInput> & { password_hash?: string }): Promise<Pengguna | null> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update users table
      const userSets: string[] = [];
      const userVals: any[] = [];
      if (input.username !== undefined) { userSets.push('username = ?'); userVals.push(input.username); }
      if (input.peran_id !== undefined) { userSets.push('peran_id = ?'); userVals.push(input.peran_id ?? null); }
      if (input.tenant_id !== undefined) { userSets.push('tenant_id = ?'); userVals.push(input.tenant_id ?? null); }
      if (input.toko_id !== undefined) { userSets.push('toko_id = ?'); userVals.push(input.toko_id ?? null); }
      if (input.status !== undefined) { userSets.push('status = ?'); userVals.push(input.status); }
      if (input.password_hash !== undefined) { userSets.push('password_hash = ?'); userVals.push(input.password_hash); }

      if (userSets.length > 0) {
        const userSql = `UPDATE users SET ${userSets.join(', ')} WHERE id = ? AND tenant_id = ?`;
        userVals.push(id, tenantId);
        const [result] = await conn.query(userSql, userVals);
        // @ts-ignore
        if (result.affectedRows === 0) {
          await conn.rollback();
          return null;
        }
      }

      // Update detail_user table
      if (input.nama_lengkap !== undefined || input.email !== undefined || input.telepon !== undefined) {
        // Check if detail_user exists
        const [detailExists] = await conn.query('SELECT id FROM detail_user WHERE user_id = ?', [id]);

        if ((detailExists as any[]).length > 0) {
          // Update existing detail_user
          const detailSets: string[] = [];
          const detailVals: any[] = [];
          if (input.nama_lengkap !== undefined) { detailSets.push('nama_lengkap = ?'); detailVals.push(input.nama_lengkap); }
          if (input.email !== undefined) { detailSets.push('email = ?'); detailVals.push(input.email); }
          if (input.telepon !== undefined) { detailSets.push('telepon = ?'); detailVals.push(input.telepon); }
          if (input.tenant_id !== undefined) { detailSets.push('tenant_id = ?'); detailVals.push(input.tenant_id); }
          if (input.toko_id !== undefined) { detailSets.push('toko_id = ?'); detailVals.push(input.toko_id); }

          if (detailSets.length > 0) {
            const detailSql = `UPDATE detail_user SET ${detailSets.join(', ')} WHERE user_id = ?`;
            detailVals.push(id);
            await conn.query(detailSql, detailVals);
          }
        } else {
          // Create new detail_user record
          const actualTenantId = input.tenant_id || tenantId;
          const detailSql = `INSERT INTO detail_user (id, user_id, tenant_id, toko_id, nama_lengkap, email, telepon)
                            VALUES (UUID(), ?, ?, ?, ?, ?, ?)`;
          const detailParams = [id, actualTenantId, input.toko_id ?? null, input.nama_lengkap ?? null, input.email ?? null, input.telepon ?? null];
          await conn.query(detailSql, detailParams);
        }
      }

      await conn.commit();
      return this.findById(id, input.tenant_id || tenantId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async remove(id: string, tenantId: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    // @ts-ignore
    return result.affectedRows > 0;
  }

  static async existsUsername(username: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const params: any[] = [username, tenantId];
    let sql = 'SELECT id FROM users WHERE username = ? AND tenant_id = ?';
    if (excludeId) { sql += ' AND id != ?'; params.push(excludeId); }
    const [rows] = await pool.query(sql, params);
    // @ts-ignore
    return rows.length > 0;
  }
}
