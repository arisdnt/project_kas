/**
 * Document Routes
 * Document and file management routes with proper authentication
 * 
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID dokumen
 *         nama_file:
 *           type: string
 *           description: Nama file dokumen
 *         kategori_dokumen:
 *           type: string
 *           description: Kategori dokumen
 *         deskripsi:
 *           type: string
 *           description: Deskripsi dokumen
 *         ukuran_file:
 *           type: integer
 *           description: Ukuran file dalam bytes
 *         mime_type:
 *           type: string
 *           description: Tipe MIME file
 *         is_public:
 *           type: boolean
 *           description: Status publik dokumen
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal kedaluwarsa
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal dibuat
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal diperbarui
 *     
 *     UploadDocumentRequest:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: File yang akan diupload
 *         kategori_dokumen:
 *           type: string
 *           description: Kategori dokumen
 *         deskripsi:
 *           type: string
 *           description: Deskripsi dokumen
 *         is_public:
 *           type: boolean
 *           description: Status publik dokumen
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal kedaluwarsa
 *     
 *     UpdateDocumentRequest:
 *       type: object
 *       properties:
 *         nama_file:
 *           type: string
 *           description: Nama file baru
 *         kategori_dokumen:
 *           type: string
 *           description: Kategori dokumen baru
 *         deskripsi:
 *           type: string
 *           description: Deskripsi baru
 *         is_public:
 *           type: boolean
 *           description: Status publik baru
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal kedaluwarsa baru
 *     
 *     StorageStats:
 *       type: object
 *       properties:
 *         total_files:
 *           type: integer
 *           description: Total jumlah file
 *         total_size:
 *           type: integer
 *           description: Total ukuran dalam bytes
 *         by_category:
 *           type: object
 *           description: Statistik per kategori
 *         by_type:
 *           type: object
 *           description: Statistik per tipe file
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { DokumenController } from '../controllers/DokumenController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/dokumen:
 *   get:
 *     summary: Mencari dokumen
 *     description: Mencari dokumen dengan filter dan pagination
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: kategori_dokumen
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori
 *       - in: query
 *         name: is_public
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status publik
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Daftar dokumen berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Tidak terotorisasi
 *       400:
 *         description: Parameter tidak valid
 */
router.get('/',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.searchDocuments
);

/**
 * @swagger
 * /api/dokumen/stats:
 *   get:
 *     summary: Mendapatkan statistik penyimpanan
 *     description: Mendapatkan statistik penggunaan penyimpanan dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik penyimpanan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StorageStats'
 *       401:
 *         description: Tidak terotorisasi
 */
router.get('/stats',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.getStorageStats
);

/**
 * @swagger
 * /api/dokumen/category/{kategori}:
 *   get:
 *     summary: Mendapatkan dokumen berdasarkan kategori
 *     description: Mendapatkan semua dokumen dalam kategori tertentu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kategori
 *         required: true
 *         schema:
 *           type: string
 *         description: Kategori dokumen
 *     responses:
 *       200:
 *         description: Dokumen berdasarkan kategori berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       401:
 *         description: Tidak terotorisasi
 */
router.get('/category/:kategori',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.getDocumentsByCategory
);

/**
 * @swagger
 * /api/dokumen/{id}:
 *   get:
 *     summary: Mendapatkan dokumen berdasarkan ID
 *     description: Mendapatkan detail dokumen berdasarkan ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dokumen
 *     responses:
 *       200:
 *         description: Detail dokumen berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       401:
 *         description: Tidak terotorisasi
 *       404:
 *         description: Dokumen tidak ditemukan
 */
router.get('/:id',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.findDocumentById
);

/**
 * @swagger
 * /api/dokumen/upload:
 *   post:
 *     summary: Upload dokumen
 *     description: Upload file dokumen baru
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UploadDocumentRequest'
 *     responses:
 *       201:
 *         description: Dokumen berhasil diupload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: File tidak disediakan atau parameter tidak valid
 *       401:
 *         description: Tidak terotorisasi
 */
router.post('/upload',
  requirePermission(PERMISSIONS.DOCUMENT_CREATE),
  requireStoreWhenNeeded,
  DokumenController.uploadMiddleware,
  DokumenController.uploadDocument
);

/**
 * @swagger
 * /api/dokumen/{id}:
 *   put:
 *     summary: Update dokumen
 *     description: Update metadata dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dokumen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDocumentRequest'
 *     responses:
 *       200:
 *         description: Dokumen berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terotorisasi
 *       404:
 *         description: Dokumen tidak ditemukan
 */
router.put('/:id',
  requirePermission(PERMISSIONS.DOCUMENT_UPDATE),
  DokumenController.updateDocument
);

/**
 * @swagger
 * /api/dokumen/{id}:
 *   delete:
 *     summary: Hapus dokumen
 *     description: Hapus dokumen berdasarkan ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dokumen
 *     responses:
 *       200:
 *         description: Dokumen berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Tidak terotorisasi
 *       404:
 *         description: Dokumen tidak ditemukan
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.DOCUMENT_DELETE),
  DokumenController.deleteDocument
);

/**
 * @swagger
 * /api/dokumen/cleanup-expired:
 *   post:
 *     summary: Bersihkan dokumen kedaluwarsa
 *     description: Menghapus dokumen yang sudah kedaluwarsa
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dokumen kedaluwarsa berhasil dibersihkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: integer
 *       401:
 *         description: Tidak terotorisasi
 */
router.post('/cleanup-expired',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  DokumenController.cleanupExpiredDocuments
);

export default router;