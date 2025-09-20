/**
 * Perpesanan Mutation Service
 * Menangani operasi mutasi untuk sistem perpesanan
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreatePerpesanan, UpdatePerpesanan, MarkAsRead, Perpesanan } from '../../models/PerpesananCore';
import { logger } from '@/core/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class PerpesananMutationService {
  /**
   * Membuat pesan baru
   */
  static async createPerpesanan(
    data: CreatePerpesanan,
    accessScope: AccessScope
  ): Promise<Perpesanan> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Debug log untuk memeriksa accessScope
      logger.info('Debug accessScope:', {
        tenantId: accessScope?.tenantId,
        userId: accessScope?.userId,
        isGod: accessScope?.isGod,
        fullScope: accessScope
      });

      // Untuk god user, gunakan tenant_id dari penerima
      let targetTenantId = accessScope.tenantId;
      
      if (accessScope.isGod && accessScope.tenantId === 'god-tenant-bypass') {
        // Ambil tenant_id dari penerima untuk god user
        const receiverTenantQuery = `
          SELECT tenant_id FROM users WHERE id = ? AND status = 'aktif'
        `;
        const [receiverTenantRows] = await connection.execute<RowDataPacket[]>(
          receiverTenantQuery,
          [data.penerima_id]
        );
        
        if (receiverTenantRows.length === 0) {
          throw new Error('Penerima tidak ditemukan atau tidak aktif');
        }
        
        targetTenantId = receiverTenantRows[0].tenant_id;
      }

      // Validasi penerima ada dan dalam tenant yang sama
      const checkReceiverQuery = `
        SELECT id FROM users 
        WHERE id = ? AND tenant_id = ? AND status = 'aktif'
      `;
      
      const [receiverRows] = await connection.execute<RowDataPacket[]>(
        checkReceiverQuery,
        [data.penerima_id, targetTenantId]
      );

      if (receiverRows.length === 0) {
        throw new Error('Penerima tidak ditemukan atau tidak aktif');
      }

      // Insert pesan baru
      const pesanId = uuidv4();
      const insertQuery = `
        INSERT INTO perpesanan (
          id, tenant_id, pengirim_id, penerima_id, 
          pesan, prioritas, status, tipe_pesan, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, 'dikirim', 'personal', NOW(), NOW())
      `;

      await connection.execute<ResultSetHeader>(insertQuery, [
        pesanId,
        targetTenantId,
        accessScope.userId,
        data.penerima_id,
        data.pesan,
        data.prioritas || 'normal'
      ]);

      // Ambil data pesan yang baru dibuat
      const selectQuery = `
        SELECT * FROM perpesanan WHERE id = ?
      `;
      
      const [pesanRows] = await connection.execute<RowDataPacket[]>(
        selectQuery,
        [pesanId]
      );

      await connection.commit();

      const pesan = pesanRows[0];
      return {
        id: pesan.id,
        tenant_id: pesan.tenant_id,
        pengirim_id: pesan.pengirim_id,
        penerima_id: pesan.penerima_id,
        pesan: pesan.pesan,
        status: pesan.status,
        prioritas: pesan.prioritas,
        dibaca_pada: pesan.dibaca_pada,
        dibuat_pada: pesan.dibuat_pada,
        diperbarui_pada: pesan.diperbarui_pada
      };

    } catch (error) {
      await connection.rollback();
      logger.error('Error creating perpesanan:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update pesan (hanya pengirim yang bisa update)
   */
  static async updatePerpesanan(
    id: string,
    data: UpdatePerpesanan,
    accessScope: AccessScope
  ): Promise<Perpesanan> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cek apakah pesan ada dan user adalah pengirim
      const checkQuery = `
        SELECT * FROM perpesanan 
        WHERE id = ? AND tenant_id = ? AND pengirim_id = ?
      `;
      
      const [checkRows] = await connection.execute<RowDataPacket[]>(
        checkQuery,
        [id, accessScope.tenantId, accessScope.userId]
      );

      if (checkRows.length === 0) {
        throw new Error('Pesan tidak ditemukan atau Anda tidak memiliki akses');
      }

      const existingPesan = checkRows[0];

      // Tidak bisa update pesan yang sudah dibaca
      if (existingPesan.status !== 'terkirim') {
        throw new Error('Tidak dapat mengubah pesan yang sudah dibaca');
      }

      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.pesan !== undefined) {
        updateFields.push('pesan = ?');
        updateValues.push(data.pesan);
      }

      if (data.prioritas !== undefined) {
        updateFields.push('prioritas = ?');
        updateValues.push(data.prioritas);
      }

      if (updateFields.length === 0) {
        throw new Error('Tidak ada data yang diupdate');
      }

      updateFields.push('diperbarui_pada = NOW()');
      updateValues.push(id, accessScope.tenantId, accessScope.userId);

      const updateQuery = `
        UPDATE perpesanan 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND tenant_id = ? AND pengirim_id = ?
      `;

      await connection.execute<ResultSetHeader>(updateQuery, updateValues);

      // Ambil data pesan yang sudah diupdate
      const selectQuery = `
        SELECT * FROM perpesanan WHERE id = ?
      `;
      
      const [pesanRows] = await connection.execute<RowDataPacket[]>(
        selectQuery,
        [id]
      );

      await connection.commit();

      const pesan = pesanRows[0];
      return {
        id: pesan.id,
        tenant_id: pesan.tenant_id,
        pengirim_id: pesan.pengirim_id,
        penerima_id: pesan.penerima_id,
        pesan: pesan.pesan,
        status: pesan.status,
        prioritas: pesan.prioritas,
        dibaca_pada: pesan.dibaca_pada,
        dibuat_pada: pesan.dibuat_pada,
        diperbarui_pada: pesan.diperbarui_pada
      };

    } catch (error) {
      await connection.rollback();
      logger.error('Error updating perpesanan:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Menandai pesan sebagai dibaca
   */
  static async markAsRead(
    data: MarkAsRead,
    accessScope: AccessScope
  ): Promise<{ updated_count: number }> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update status pesan menjadi dibaca
      const updateQuery = `
        UPDATE perpesanan 
        SET status = 'dibaca', dibaca_pada = NOW(), diperbarui_pada = NOW()
        WHERE id IN (${data.pesan_ids.map(() => '?').join(',')})
        AND tenant_id = ? 
        AND penerima_id = ?
        AND status = 'terkirim'
      `;

      const params = [...data.pesan_ids, accessScope.tenantId, accessScope.userId];
      const [result] = await connection.execute<ResultSetHeader>(updateQuery, params);

      await connection.commit();

      return { updated_count: result.affectedRows };

    } catch (error) {
      await connection.rollback();
      logger.error('Error marking messages as read:', error);
      throw new Error('Gagal menandai pesan sebagai dibaca');
    } finally {
      connection.release();
    }
  }

  /**
   * Menghapus pesan (soft delete)
   */
  static async deletePerpesanan(
    id: string,
    accessScope: AccessScope
  ): Promise<{ success: boolean }> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cek apakah pesan ada dan user memiliki akses (pengirim atau penerima)
      const checkQuery = `
        SELECT * FROM perpesanan 
        WHERE id = ? AND tenant_id = ? 
        AND (pengirim_id = ? OR penerima_id = ?)
      `;
      
      const [checkRows] = await connection.execute<RowDataPacket[]>(
        checkQuery,
        [id, accessScope.tenantId, accessScope.userId, accessScope.userId]
      );

      if (checkRows.length === 0) {
        throw new Error('Pesan tidak ditemukan atau Anda tidak memiliki akses');
      }

      // Soft delete - update status menjadi dihapus
      const deleteQuery = `
        UPDATE perpesanan 
        SET status = 'dihapus', diperbarui_pada = NOW()
        WHERE id = ? AND tenant_id = ?
      `;

      await connection.execute<ResultSetHeader>(deleteQuery, [id, accessScope.tenantId]);

      await connection.commit();

      return { success: true };

    } catch (error) {
      await connection.rollback();
      logger.error('Error deleting perpesanan:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Membalas pesan (membuat pesan baru sebagai balasan)
   */
  static async replyPerpesanan(
    originalId: string,
    pesan: string,
    accessScope: AccessScope
  ): Promise<Perpesanan> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cek pesan asli dan pastikan user adalah penerima
      const checkQuery = `
        SELECT * FROM perpesanan 
        WHERE id = ? AND tenant_id = ? AND penerima_id = ?
      `;
      
      const [checkRows] = await connection.execute<RowDataPacket[]>(
        checkQuery,
        [originalId, accessScope.tenantId, accessScope.userId]
      );

      if (checkRows.length === 0) {
        throw new Error('Pesan tidak ditemukan atau Anda tidak memiliki akses');
      }

      const originalPesan = checkRows[0];

      // Update pesan asli sebagai dibalas
      const updateOriginalQuery = `
        UPDATE perpesanan 
        SET status = 'dibalas', dibalas_pada = NOW(), diperbarui_pada = NOW()
        WHERE id = ?
      `;
      
      await connection.execute<ResultSetHeader>(updateOriginalQuery, [originalId]);

      // Buat pesan balasan baru
      const replyId = uuidv4();
      const insertReplyQuery = `
        INSERT INTO perpesanan (
          id, tenant_id, pengirim_id, penerima_id, 
          pesan, prioritas, status, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, 'terkirim', NOW(), NOW())
      `;

      await connection.execute<ResultSetHeader>(insertReplyQuery, [
        replyId,
        accessScope.tenantId,
        accessScope.userId,
        originalPesan.pengirim_id,
        pesan,
        originalPesan.prioritas
      ]);

      // Ambil data pesan balasan yang baru dibuat
      const selectQuery = `
        SELECT * FROM perpesanan WHERE id = ?
      `;
      
      const [replyRows] = await connection.execute<RowDataPacket[]>(
        selectQuery,
        [replyId]
      );

      await connection.commit();

      const reply = replyRows[0];
      return {
        id: reply.id,
        tenant_id: reply.tenant_id,
        pengirim_id: reply.pengirim_id,
        penerima_id: reply.penerima_id,
        pesan: reply.pesan,
        status: reply.status,
        prioritas: reply.prioritas,
        dibaca_pada: reply.dibaca_pada,
        dibuat_pada: reply.dibuat_pada,
        diperbarui_pada: reply.diperbarui_pada
      };

    } catch (error) {
      await connection.rollback();
      logger.error('Error replying to perpesanan:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}