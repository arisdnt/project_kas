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
import { putObject, getPresignedGetUrl, removeObject, ensureBucket } from '@/core/storage/minioClient';
import { logger } from '@/core/utils/logger';

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

    try {
      // Ensure bucket exists
      await ensureBucket();

      // Generate unique filename and hash
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const objectKey = `${scope.tenantId}/${scope.storeId}/${config.kategori_dokumen}/${uniqueFileName}`;
      const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');

      // Improve MIME type detection based on file extension
      let mimeType = file.mimetype;
      if (!mimeType || mimeType === 'application/octet-stream') {
        const mimeTypeMap: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain',
          'csv': 'text/csv',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'zip': 'application/zip'
        };
        mimeType = mimeTypeMap[fileExtension || ''] || 'application/octet-stream';
      }

      // Validate file type based on category using corrected MIME type
      this.validateFileType(mimeType, config.kategori_dokumen);

      // Upload file to MinIO first
      const bucketName = process.env.MINIO_BUCKET || 'pos-files';
      console.log('[DokumenMutationService] Putting object to MinIO', {
        objectKey,
        size: file.size,
        mimeType,
        bucket: process.env.MINIO_BUCKET || 'pos-files'
      });
      await putObject(objectKey, file.buffer, {
        'Content-Type': mimeType,
        'Original-Name': file.originalname,
        'Uploaded-By': userId,
        'Upload-Date': new Date().toISOString()
      });

      logger.info({ objectKey, size: file.size }, 'File uploaded to MinIO successfully');

      const documentData: CreateDokumenMinio = {
        tenant_id: scope.tenantId,
        toko_id: scope.storeId,
        user_id: userId,
        bucket_name: bucketName,
        object_key: objectKey,
        url_dokumen: `minio://${bucketName}/${objectKey}`, // Internal reference
        nama_file: uniqueFileName,
        nama_file_asli: file.originalname,
        tipe_file: fileExtension || 'unknown',
        ukuran_file: file.size,
        mime_type: mimeType,
        hash_file: fileHash,
        kategori_dokumen: config.kategori_dokumen,
        deskripsi: config.deskripsi,
        status: 'ready', // Changed from 'uploaded' to 'ready'
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
        documentData.ukuran_file, documentData.mime_type || null, documentData.hash_file,
        documentData.kategori_dokumen, documentData.deskripsi || null, documentData.status,
        documentData.is_public ? 1 : 0, documentData.expires_at || null,
        JSON.stringify(documentData.metadata_json || {})
      ];

      console.log('[DokumenMutationService] Inserting dokumen_minio record', {
        id,
        tenant_id: documentData.tenant_id,
        toko_id: documentData.toko_id,
        object_key: documentData.object_key,
        size: documentData.ukuran_file,
        mime_type: documentData.mime_type
      });
      await pool.execute(sql, params);

      // Return created document data
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM dokumen_minio WHERE id = ?',
        [id]
      );

      console.log('[DokumenMutationService] Upload complete', { id, objectKey });
      return {
        document: rows[0],
        success: true
      };

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : error }, 'Document upload failed');
      console.error('[DokumenMutationService] Upload failed', error);
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      params.push(data.deskripsi || null);
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
      params.push(data.expires_at || null);
    }

    if (data.metadata_json !== undefined) {
      updates.push('metadata_json = ?');
      params.push(JSON.stringify(data.metadata_json || {}));
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

    try {
      // Delete from MinIO storage
      await removeObject(document.object_key);
      logger.info({ objectKey: document.object_key }, 'File deleted from MinIO successfully');
    } catch (error) {
      logger.warn({ error: error instanceof Error ? error.message : error, objectKey: document.object_key }, 'Failed to delete file from MinIO');
      // Continue with database deletion even if MinIO deletion fails
    }

    // Mark as deleted in database
    const sql = `
      UPDATE dokumen_minio
      SET status = 'deleted', diperbarui_pada = NOW()
      WHERE id = ?
    `;

    await pool.execute(sql, [id]);

    return {
      success: true,
      message: 'Document deleted successfully'
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

  static async fixIncorrectMimeTypes() {
    // Find documents with application/octet-stream MIME type
    const findSql = `
      SELECT id, nama_file_asli, mime_type
      FROM dokumen_minio
      WHERE mime_type = 'application/octet-stream' AND status != 'deleted'
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(findSql);

    if (rows.length === 0) {
      return { fixed: 0, documents: [] };
    }

    const mimeTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'zip': 'application/zip'
    };

    const fixedDocuments = [];

    for (const row of rows) {
      const fileExtension = row.nama_file_asli.split('.').pop()?.toLowerCase();
      const correctMimeType = mimeTypeMap[fileExtension || ''];

      if (correctMimeType && correctMimeType !== row.mime_type) {
        // Update the MIME type
        const updateSql = `
          UPDATE dokumen_minio
          SET mime_type = ?, diperbarui_pada = NOW()
          WHERE id = ?
        `;

        await pool.execute(updateSql, [correctMimeType, row.id]);

        fixedDocuments.push({
          id: row.id,
          filename: row.nama_file_asli,
          oldMimeType: row.mime_type,
          newMimeType: correctMimeType
        });

        logger.info({
          documentId: row.id,
          filename: row.nama_file_asli,
          oldMimeType: row.mime_type,
          newMimeType: correctMimeType
        }, 'Fixed MIME type for document');
      }
    }

    return {
      fixed: fixedDocuments.length,
      documents: fixedDocuments
    };
  }

  // Private helper method for file type validation
  private static validateFileType(mimeType: string, category: string) {
    const allowedTypes: Record<string, string[]> = {
      'image': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'invoice': ['application/pdf', 'image/jpeg', 'image/png'],
      'receipt': ['application/pdf', 'image/jpeg', 'image/png'],
      'contract': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'other': [] // No restrictions
    };

    const allowed = allowedTypes[category];
    if (allowed && allowed.length > 0 && !allowed.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed for category ${category}`);
    }
  }
}