/**
 * Catatan Query Service
 * Service untuk operasi query/read pada tabel catatan
 */

import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { 
  SearchCatatanQuery, 
  Catatan, 
  CatatanWithUser, 
  CatatanStats 
} from '../../models/CatatanCore';

export class CatatanQueryService {
  /**
   * Mencari catatan dengan pagination dan filter
   */
  static async searchCatatan(
    query: SearchCatatanQuery,
    accessScope: AccessScope
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const connection = await pool.getConnection();
    
    try {
      const {
        page = '1',
        limit = '20',
        search,
        visibilitas,
        kategori,
        tags,
        prioritas,
        status,
        user_id,
        toko_id,
        tanggal_mulai,
        tanggal_selesai,
        has_reminder,
        sort_by = 'diperbarui_pada',
        sort_order = 'desc'
      } = query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      let whereConditions: string[] = [];
      let params: any[] = [];

      // Filter berdasarkan akses scope dan visibilitas
      whereConditions.push(this.buildVisibilityFilter(accessScope));

      // Filter pencarian teks
      if (search) {
        whereConditions.push('(c.judul LIKE ? OR c.konten LIKE ? OR c.kategori LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Filter visibilitas spesifik
      if (visibilitas) {
        whereConditions.push('c.visibilitas = ?');
        params.push(visibilitas);
      }

      // Filter kategori
      if (kategori) {
        whereConditions.push('c.kategori = ?');
        params.push(kategori);
      }

      // Filter tags (JSON contains)
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        const tagConditions = tagArray.map(() => 'JSON_CONTAINS(c.tags, ?)').join(' OR ');
        whereConditions.push(`(${tagConditions})`);
        tagArray.forEach(tag => params.push(`"${tag}"`));
      }

      // Filter prioritas
      if (prioritas) {
        whereConditions.push('c.prioritas = ?');
        params.push(prioritas);
      }

      // Filter status
      if (status) {
        whereConditions.push('c.status = ?');
        params.push(status);
      } else {
        // Default: tidak tampilkan yang dihapus
        whereConditions.push('c.status != ?');
        params.push('dihapus');
      }

      // Filter user
      if (user_id) {
        whereConditions.push('c.user_id = ?');
        params.push(user_id);
      }

      // Filter toko
      if (toko_id) {
        whereConditions.push('c.toko_id = ?');
        params.push(toko_id);
      }

      // Filter tanggal
      if (tanggal_mulai) {
        whereConditions.push('c.dibuat_pada >= ?');
        params.push(tanggal_mulai);
      }

      if (tanggal_selesai) {
        whereConditions.push('c.dibuat_pada <= ?');
        params.push(tanggal_selesai);
      }

      // Filter reminder
      if (has_reminder === 'true') {
        whereConditions.push('c.reminder_pada IS NOT NULL');
      } else if (has_reminder === 'false') {
        whereConditions.push('c.reminder_pada IS NULL');
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Query untuk total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM catatan c
        ${whereClause}
      `;

      const [countResult] = await connection.execute(countQuery, params);
      const total = (countResult as any)[0].total;

      // Query untuk data dengan join user dan toko
      const dataQuery = `
        SELECT 
          c.*,
          u.nama as pembuat_nama,
          u.username as pembuat_username,
          t.nama as toko_nama,
          t.kode as toko_kode
        FROM catatan c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN toko t ON c.toko_id = t.id
        ${whereClause}
        ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `;

      const [rows] = await connection.execute(dataQuery, params);
      
      const data = (rows as any[]).map(row => ({
        id: row.id,
        tenant_id: row.tenant_id,
        toko_id: row.toko_id,
        user_id: row.user_id,
        judul: row.judul,
        konten: row.konten,
        visibilitas: row.visibilitas,
        kategori: row.kategori,
        tags: row.tags ? JSON.parse(row.tags) : [],
        prioritas: row.prioritas,
        status: row.status,
        reminder_pada: row.reminder_pada,
        lampiran_url: row.lampiran_url,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        pembuat: {
          id: row.user_id,
          nama: row.pembuat_nama,
          username: row.pembuat_username
        },
        toko: row.toko_id ? {
          id: row.toko_id,
          nama: row.toko_nama,
          kode: row.toko_kode
        } : undefined
      }));

      return { data, total };

    } finally {
      connection.release();
    }
  }

  /**
   * Mencari catatan berdasarkan ID
   */
  static async findById(
    id: string,
    accessScope: AccessScope
  ): Promise<CatatanWithUser | null> {
    const connection = await pool.getConnection();
    
    try {
      const visibilityFilter = this.buildVisibilityFilter(accessScope);
      
      const query = `
        SELECT 
          c.*,
          u.nama as pembuat_nama,
          u.username as pembuat_username,
          t.nama as toko_nama,
          t.kode as toko_kode
        FROM catatan c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN toko t ON c.toko_id = t.id
        WHERE c.id = ? AND ${visibilityFilter}
      `;

      const [rows] = await connection.execute(query, [id]);
      
      if ((rows as any[]).length === 0) {
        return null;
      }

      const row = (rows as any[])[0];
      
      return {
        id: row.id,
        tenant_id: row.tenant_id,
        toko_id: row.toko_id,
        user_id: row.user_id,
        judul: row.judul,
        konten: row.konten,
        visibilitas: row.visibilitas,
        kategori: row.kategori,
        tags: row.tags ? JSON.parse(row.tags) : [],
        prioritas: row.prioritas,
        status: row.status,
        reminder_pada: row.reminder_pada,
        lampiran_url: row.lampiran_url,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        pembuat: {
          id: row.user_id,
          nama: row.pembuat_nama,
          username: row.pembuat_username
        },
        toko: row.toko_id ? {
          id: row.toko_id,
          nama: row.toko_nama,
          kode: row.toko_kode
        } : undefined
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Mendapatkan statistik catatan
   */
  static async getStats(accessScope: AccessScope): Promise<CatatanStats> {
    const connection = await pool.getConnection();
    
    try {
      const visibilityFilter = this.buildVisibilityFilter(accessScope);
      
      // Query statistik umum
      const statsQuery = `
        SELECT 
          COUNT(*) as total_catatan,
          SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) as catatan_aktif,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as catatan_draft,
          SUM(CASE WHEN status = 'arsip' THEN 1 ELSE 0 END) as catatan_arsip,
          SUM(CASE WHEN DATE(dibuat_pada) = CURDATE() THEN 1 ELSE 0 END) as catatan_hari_ini,
          SUM(CASE WHEN YEARWEEK(dibuat_pada) = YEARWEEK(NOW()) THEN 1 ELSE 0 END) as catatan_minggu_ini,
          SUM(CASE WHEN YEAR(dibuat_pada) = YEAR(NOW()) AND MONTH(dibuat_pada) = MONTH(NOW()) THEN 1 ELSE 0 END) as catatan_bulan_ini,
          SUM(CASE WHEN visibilitas = 'pribadi' THEN 1 ELSE 0 END) as vis_pribadi,
          SUM(CASE WHEN visibilitas = 'toko' THEN 1 ELSE 0 END) as vis_toko,
          SUM(CASE WHEN visibilitas = 'tenant' THEN 1 ELSE 0 END) as vis_tenant,
          SUM(CASE WHEN visibilitas = 'publik' THEN 1 ELSE 0 END) as vis_publik,
          SUM(CASE WHEN prioritas = 'rendah' THEN 1 ELSE 0 END) as prio_rendah,
          SUM(CASE WHEN prioritas = 'normal' THEN 1 ELSE 0 END) as prio_normal,
          SUM(CASE WHEN prioritas = 'tinggi' THEN 1 ELSE 0 END) as prio_tinggi,
          SUM(CASE WHEN reminder_pada IS NOT NULL AND reminder_pada > NOW() THEN 1 ELSE 0 END) as reminder_mendatang
        FROM catatan 
        WHERE ${visibilityFilter}
      `;

      const [rows] = await connection.execute(statsQuery);
      const stats = (rows as any[])[0];

      return {
        total_catatan: stats.total_catatan,
        catatan_aktif: stats.catatan_aktif,
        catatan_draft: stats.catatan_draft,
        catatan_arsip: stats.catatan_arsip,
        catatan_hari_ini: stats.catatan_hari_ini,
        catatan_minggu_ini: stats.catatan_minggu_ini,
        catatan_bulan_ini: stats.catatan_bulan_ini,
        catatan_per_visibilitas: {
          pribadi: stats.vis_pribadi,
          toko: stats.vis_toko,
          tenant: stats.vis_tenant,
          publik: stats.vis_publik
        },
        catatan_per_prioritas: {
          rendah: stats.prio_rendah,
          normal: stats.prio_normal,
          tinggi: stats.prio_tinggi
        },
        reminder_mendatang: stats.reminder_mendatang
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Membangun filter visibilitas berdasarkan access scope
   */
  private static buildVisibilityFilter(accessScope: AccessScope): string {
    const conditions: string[] = [];

    // User dapat melihat catatan pribadi mereka sendiri
    conditions.push(`(visibilitas = 'pribadi' AND user_id = '${accessScope.userId}')`);

    // User dapat melihat catatan publik
    conditions.push(`visibilitas = 'publik'`);

    // User dapat melihat catatan tenant jika dalam tenant yang sama
    if (accessScope.tenantId) {
      conditions.push(`(visibilitas = 'tenant' AND tenant_id = '${accessScope.tenantId}')`);
    }

    // User dapat melihat catatan toko jika dalam toko yang sama
    if (accessScope.storeId) {
      conditions.push(`(visibilitas = 'toko' AND toko_id = '${accessScope.storeId}')`);
    }

    // God user dapat melihat semua
    if (accessScope.isGod) {
      return '1=1'; // No restriction
    }

    return `(${conditions.join(' OR ')})`;
  }
}