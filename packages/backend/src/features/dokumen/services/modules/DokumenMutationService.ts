/**
 * Document Mutation Service Module
 * Handles document upload, update, and deletion operations
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateDokumenMinio, UpdateDokumenMinio, FileUpload, UploadConfig } from '../../models/DokumenCore';

export class DokumenMutationService {
  static async uploadDocument(
    scope: AccessScope,
    file: FileUpload,
    config: UploadConfig,
    userId: string
  ) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for document upload');
    }

    // Generate unique filename and hash
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const objectKey = `${scope.tenantId}/${scope.storeId}/${config.kategori_dokumen}/${uniqueFileName}`;
    const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');

    const documentData: CreateDokumenMinio = {
      tenant_id: scope.tenantId,
      toko_id: scope.storeId,
      user_id: userId,
      bucket_name: process.env.MINIO_BUCKET_NAME || 'documents',
      object_key: objectKey,
      url_dokumen: `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/${objectKey}`,
      nama_file: uniqueFileName,
      nama_file_asli: file.originalname,
      tipe_file: fileExtension || 'unknown',
      ukuran_file: file.size,
      mime_type: file.mimetype,
      hash_file: fileHash,
      kategori_dokumen: config.kategori_dokumen,
      deskripsi: config.deskripsi,
      status: 'uploaded',
      is_public: config.is_public,
      expires_at: config.expires_at ? new Date(config.expires_at) : undefined,
      metadata_json: {
        originalName: file.originalname,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    const sql = `
      INSERT INTO dokumen_minio (
        id, tenant_id, toko_id, user_id, bucket_name, object_key,
        url_dokumen, nama_file, nama_file_asli, tipe_file, ukuran_file,
        mime_type, hash_file, kategori_dokumen, deskripsi, status,
        is_public, expires_at, metadata_json, dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const id = uuidv4();
    const params = [
      id, documentData.tenant_id, documentData.toko_id, documentData.user_id,
      documentData.bucket_name, documentData.object_key, documentData.url_dokumen,
      documentData.nama_file, documentData.nama_file_asli, documentData.tipe_file,
      documentData.ukuran_file, documentData.mime_type, documentData.hash_file,
      documentData.kategori_dokumen, documentData.deskripsi, documentData.status,
      documentData.is_public ? 1 : 0, documentData.expires_at,
      JSON.stringify(documentData.metadata_json)
    ];

    await pool.execute(sql, params);

    // Return created document data
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM dokumen_minio WHERE id = ?',
      [id]
    );

    return {
      document: rows[0],
      uploadData: {
        buffer: file.buffer,
        objectKey,
        bucket: documentData.bucket_name
      }
    };
  }

  static async updateDocument(scope: AccessScope, id: string, data: UpdateDokumenMinio) {
    // Check if document exists and user has access
    const checkSql = `
      SELECT id FROM dokumen_minio
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND toko_id = ?' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Document not found or access denied');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.deskripsi !== undefined) {
      updates.push('deskripsi = ?');
      params.push(data.deskripsi);
    }

    if (data.kategori_dokumen !== undefined) {
      updates.push('kategori_dokumen = ?');
      params.push(data.kategori_dokumen);
    }

    if (data.is_public !== undefined) {
      updates.push('is_public = ?');
      params.push(data.is_public ? 1 : 0);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.expires_at !== undefined) {
      updates.push('expires_at = ?');
      params.push(data.expires_at);
    }

    if (data.metadata_json !== undefined) {
      updates.push('metadata_json = ?');
      params.push(JSON.stringify(data.metadata_json));
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE dokumen_minio SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated document
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM dokumen_minio WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async deleteDocument(scope: AccessScope, id: string) {
    // Check if document exists and user has access
    const checkSql = `
      SELECT bucket_name, object_key FROM dokumen_minio
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND toko_id = ?' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Document not found or access denied');
    }

    const document = checkRows[0];

    // Mark as deleted instead of hard delete
    const sql = `
      UPDATE dokumen_minio
      SET status = 'deleted', diperbarui_pada = NOW()
      WHERE id = ?
    `;

    await pool.execute(sql, [id]);

    return {
      success: true,
      message: 'Document marked for deletion',
      objectToDelete: {
        bucket: document.bucket_name,
        objectKey: document.object_key
      }
    };
  }

  static async cleanupExpiredDocuments() {
    // Find expired documents
    const findSql = `
      SELECT id, bucket_name, object_key
      FROM dokumen_minio
      WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status != 'deleted'
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(findSql);

    if (rows.length === 0) {
      return { cleaned: 0, objects: [] };
    }

    // Mark as deleted
    const ids = rows.map(row => row.id);
    const placeholders = ids.map(() => '?').join(',');
    const updateSql = `
      UPDATE dokumen_minio
      SET status = 'deleted', diperbarui_pada = NOW()
      WHERE id IN (${placeholders})
    `;

    await pool.execute(updateSql, ids);

    return {
      cleaned: rows.length,
      objects: rows.map(row => ({
        bucket: row.bucket_name,
        objectKey: row.object_key
      }))
    };
  }
}