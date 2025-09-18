import { z } from 'zod';
import { pool } from '@/core/database/connection';

export const PeranCreateSchema = z.object({
  nama: z.string().min(2).max(50),
  deskripsi: z.string().max(500).optional().nullable(),
  level: z.number().int().min(1).default(1),
  status: z.enum(['aktif','nonaktif']).default('aktif')
});

export const PeranUpdateSchema = PeranCreateSchema.partial();

export type PeranCreateInput = z.infer<typeof PeranCreateSchema>;
export type PeranUpdateInput = z.infer<typeof PeranUpdateSchema>;

export interface Peran {
  id: string;
  tenant_id: string;
  nama: string;
  deskripsi: string | null;
  level: number | null;
  status: 'aktif' | 'nonaktif';
  dibuat_pada: string | null;
  diperbarui_pada: string | null;
}

export class PeranModel {
  static async findAll(tenantId: string): Promise<Peran[]> {
    const [rows] = await pool.query('SELECT * FROM peran WHERE tenant_id = ? ORDER BY level ASC, nama ASC', [tenantId]);
    return rows as Peran[];
  }

  static async findById(id: string, tenantId: string): Promise<Peran | null> {
    const [rows] = await pool.query('SELECT * FROM peran WHERE id = ? AND tenant_id = ? LIMIT 1', [id, tenantId]);
    const list = rows as Peran[];
    return list.length ? list[0] : null;
  }

  static async create(input: PeranCreateInput, tenantId: string): Promise<Peran> {
    const idQuery = 'INSERT INTO peran (id, tenant_id, nama, deskripsi, level, status) VALUES (UUID(),?,?,?,?,?)';
    const params = [tenantId, input.nama, input.deskripsi ?? null, input.level ?? 1, input.status ?? 'aktif'];
    const conn = await pool.getConnection();
    try {
      await conn.query(idQuery, params);
      const [rows] = await conn.query('SELECT * FROM peran WHERE tenant_id = ? AND nama = ? ORDER BY dibuat_pada DESC LIMIT 1', [tenantId, input.nama]);
      return (rows as Peran[])[0];
    } finally {
      conn.release();
    }
  }

  static async update(id: string, tenantId: string, input: PeranUpdateInput): Promise<Peran | null> {
    // Build dynamic set
    const fields: string[] = [];
    const values: any[] = [];
    if (input.nama !== undefined) { fields.push('nama = ?'); values.push(input.nama); }
    if (input.deskripsi !== undefined) { fields.push('deskripsi = ?'); values.push(input.deskripsi ?? null); }
    if (input.level !== undefined) { fields.push('level = ?'); values.push(input.level); }
    if (input.status !== undefined) { fields.push('status = ?'); values.push(input.status); }
    if (!fields.length) return this.findById(id, tenantId);
    const sql = `UPDATE peran SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`;
    values.push(id, tenantId);
    const [result] = await pool.query(sql, values);
    // @ts-ignore
    if (result.affectedRows === 0) return null;
    return this.findById(id, tenantId);
  }

  static async remove(id: string, tenantId: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM peran WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    // @ts-ignore
    return result.affectedRows > 0;
  }
}
