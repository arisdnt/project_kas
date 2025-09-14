/**
 * Modul untuk membuat supplier baru
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateSupplier, Supplier } from '../../../models/Produk';
import { randomUUID } from 'crypto';

/**
 * Membuat supplier baru
 * @param data - Data supplier yang akan dibuat
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data supplier yang telah dibuat
 */
export async function createSupplier(
  data: CreateSupplier,
  scope: AccessScope
): Promise<Supplier> {
  try {
    const id = randomUUID();
    const now = new Date();
    
    // Cek apakah nama supplier sudah ada untuk tenant ini
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM supplier 
      WHERE nama_supplier = ? AND tenant_id = ?
    `;
    
    const [checkRows] = await pool.execute(
      checkQuery,
      [data.nama, scope.tenantId]
    );
    
    const existingCount = (checkRows as any[])[0]?.count || 0;
    
    if (existingCount > 0) {
      throw new Error('Nama supplier sudah digunakan');
    }
    
    // Insert supplier baru
    const insertQuery = `
      INSERT INTO supplier (
        id,
        nama_supplier,
        kontak_person,
        email,
        telepon,
        alamat,
        tenant_id,
        dibuat_pada,
        diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      id,
      data.nama,
      data.kontak_person || null,
      data.email || null,
      data.telepon || null,
      data.alamat || null,
      scope.tenantId,
      now,
      now
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(
      insertQuery,
      insertParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal membuat supplier');
    }
    
    const supplier: Supplier = {
      id,
      nama: data.nama,
      kontak_person: data.kontak_person,
      email: data.email,
      telepon: data.telepon,
      alamat: data.alamat,
      dibuat_pada: now,
      diperbarui_pada: now
    };
    
    logger.info({ 
      tenantId: scope.tenantId, 
      supplierId: id, 
      nama: data.nama 
    }, 'Supplier berhasil dibuat');
    
    return supplier;
  } catch (error) {
    logger.error({ error, data, scope }, 'Error creating supplier');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal membuat supplier');
  }
}