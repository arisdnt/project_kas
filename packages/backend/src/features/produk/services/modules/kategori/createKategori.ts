/**
 * Modul untuk membuat kategori baru
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateKategori, Kategori } from '../../../models/Produk';
import { randomUUID } from 'crypto';

/**
 * Membuat kategori baru
 * @param data - Data kategori yang akan dibuat
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data kategori yang telah dibuat
 */
export async function createKategori(
  data: CreateKategori,
  scope: AccessScope
): Promise<Kategori> {
  try {
    const id = randomUUID();
    const now = new Date();
    
    // Cek apakah nama kategori sudah ada untuk tenant ini
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM kategori 
      WHERE nama = ? AND tenant_id = ?
    `;
    
    const [checkRows] = await pool.execute(
      checkQuery,
      [data.nama, scope.tenantId]
    );
    
    const existingCount = (checkRows as any[])[0]?.count || 0;
    
    if (existingCount > 0) {
      throw new Error('Nama kategori sudah digunakan');
    }
    
    // Insert kategori baru
    const insertQuery = `
      INSERT INTO kategori (
        id,
        nama,
        tenant_id,
        dibuat_pada,
        diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      id,
      data.nama,
      scope.tenantId,
      now,
      now
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(
      insertQuery,
      insertParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal membuat kategori');
    }
    
    const kategori: Kategori = {
      id,
      nama: data.nama
    };
    
    logger.info({ 
      tenantId: scope.tenantId, 
      kategoriId: id, 
      nama: data.nama 
    }, 'Kategori berhasil dibuat');
    
    return kategori;
  } catch (error) {
    logger.error({ error, data, scope }, 'Error creating kategori');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal membuat kategori');
  }
}