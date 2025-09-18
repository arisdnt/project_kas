/**
 * Backup Routes
 * Backup and export/import routes with proper authentication
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { BackupController } from '../controllers/BackupController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * components:
 *   schemas:
 *     BackupJob:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik backup job
 *         name:
 *           type: string
 *           description: Nama backup job
 *         description:
 *           type: string
 *           description: Deskripsi backup job
 *         type:
 *           type: string
 *           enum: [full, incremental, differential]
 *           description: Jenis backup
 *         status:
 *           type: string
 *           enum: [pending, running, completed, failed, cancelled]
 *           description: Status backup job
 *         schedule:
 *           type: string
 *           description: Jadwal backup (cron expression)
 *         tables:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar tabel yang akan di-backup
 *         file_path:
 *           type: string
 *           description: Path file backup
 *         file_size:
 *           type: integer
 *           description: Ukuran file backup (bytes)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Waktu dibuat
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Waktu diperbarui
 *         started_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu mulai backup
 *         completed_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu selesai backup
 *     
 *     CreateBackupJobRequest:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - tables
 *       properties:
 *         name:
 *           type: string
 *           description: Nama backup job
 *           example: Daily Full Backup
 *         description:
 *           type: string
 *           description: Deskripsi backup job
 *           example: Backup harian untuk semua data
 *         type:
 *           type: string
 *           enum: [full, incremental, differential]
 *           description: Jenis backup
 *           example: full
 *         schedule:
 *           type: string
 *           description: Jadwal backup (cron expression)
 *           example: "0 2 * * *"
 *         tables:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar tabel yang akan di-backup
 *           example: ["users", "products", "transactions"]
 *     
 *     UpdateBackupJobRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nama backup job
 *         description:
 *           type: string
 *           description: Deskripsi backup job
 *         schedule:
 *           type: string
 *           description: Jadwal backup (cron expression)
 *         tables:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar tabel yang akan di-backup
 *     
 *     ExportRequest:
 *       type: object
 *       required:
 *         - tables
 *         - format
 *       properties:
 *         tables:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar tabel untuk diekspor
 *           example: ["products", "categories"]
 *         format:
 *           type: string
 *           enum: [sql, csv, json]
 *           description: Format ekspor
 *           example: sql
 *         include_data:
 *           type: boolean
 *           description: Sertakan data atau hanya struktur
 *           default: true
 *     
 *     BackupStats:
 *       type: object
 *       properties:
 *         total_jobs:
 *           type: integer
 *           description: Total backup jobs
 *         running_jobs:
 *           type: integer
 *           description: Jobs yang sedang berjalan
 *         completed_jobs:
 *           type: integer
 *           description: Jobs yang selesai
 *         failed_jobs:
 *           type: integer
 *           description: Jobs yang gagal
 *         total_size:
 *           type: integer
 *           description: Total ukuran backup (bytes)
 *         last_backup:
 *           type: string
 *           format: date-time
 *           description: Waktu backup terakhir
 *     
 *     DatabaseTable:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nama tabel
 *         rows:
 *           type: integer
 *           description: Jumlah baris
 *         size:
 *           type: integer
 *           description: Ukuran tabel (bytes)
 *         engine:
 *           type: string
 *           description: Storage engine
 */

/**
 * @swagger
 * /api/backup/jobs:
 *   get:
 *     summary: Mencari backup jobs
 *     description: Mengambil daftar backup jobs dengan filter dan paginasi
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed, cancelled]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full, incremental, differential]
 *         description: Filter berdasarkan jenis backup
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama atau deskripsi
 *     responses:
 *       200:
 *         description: Daftar backup jobs berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BackupJob'
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
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_READ
 */
router.get('/jobs',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.searchBackupJobs
);

/**
 * @swagger
 * /api/backup/jobs/running:
 *   get:
 *     summary: Mendapatkan backup jobs yang sedang berjalan
 *     description: Mengambil daftar backup jobs yang sedang dalam status running
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar backup jobs yang sedang berjalan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BackupJob'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_READ
 */
router.get('/jobs/running',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.getRunningBackups
);

/**
 * @swagger
 * /api/backup/jobs/stats:
 *   get:
 *     summary: Mendapatkan statistik backup
 *     description: Mengambil statistik backup jobs dan ukuran file
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik backup berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BackupStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_READ
 */
router.get('/jobs/stats',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.getBackupStats
);

/**
 * @swagger
 * /api/backup/jobs/{id}:
 *   get:
 *     summary: Mendapatkan backup job berdasarkan ID
 *     description: Mengambil detail backup job berdasarkan ID
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID backup job
 *     responses:
 *       200:
 *         description: Detail backup job berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BackupJob'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_READ
 *       404:
 *         description: Backup job tidak ditemukan
 */
router.get('/jobs/:id',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.findBackupJobById
);

/**
 * @swagger
 * /api/backup/jobs:
 *   post:
 *     summary: Membuat backup job baru
 *     description: Membuat backup job baru dengan konfigurasi yang ditentukan
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBackupJobRequest'
 *     responses:
 *       201:
 *         description: Backup job berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Backup job created successfully
 *                 data:
 *                   $ref: '#/components/schemas/BackupJob'
 *       400:
 *         description: Data request tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_CREATE
 */
router.post('/jobs',
  requirePermission(PERMISSIONS.BACKUP_CREATE),
  BackupController.createBackupJob
);

/**
 * @swagger
 * /api/backup/jobs/{id}:
 *   put:
 *     summary: Memperbarui backup job
 *     description: Memperbarui konfigurasi backup job yang ada
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID backup job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBackupJobRequest'
 *     responses:
 *       200:
 *         description: Backup job berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Backup job updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/BackupJob'
 *       400:
 *         description: Data request tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_UPDATE
 *       404:
 *         description: Backup job tidak ditemukan
 */
router.put('/jobs/:id',
  requirePermission(PERMISSIONS.BACKUP_UPDATE),
  BackupController.updateBackupJob
);

/**
 * @swagger
 * /api/backup/jobs/{id}/execute:
 *   post:
 *     summary: Menjalankan backup job
 *     description: Menjalankan backup job secara manual
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID backup job
 *     responses:
 *       200:
 *         description: Backup job berhasil dijalankan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Backup job started successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     job_id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: running
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_CREATE
 *       404:
 *         description: Backup job tidak ditemukan
 *       409:
 *         description: Backup job sedang berjalan
 */
router.post('/jobs/:id/execute',
  requirePermission(PERMISSIONS.BACKUP_CREATE),
  BackupController.executeBackup
);

/**
 * @swagger
 * /api/backup/jobs/{id}/download:
 *   get:
 *     summary: Download file backup
 *     description: Mengunduh file backup yang telah selesai
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID backup job
 *     responses:
 *       200:
 *         description: File backup berhasil diunduh
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_READ
 *       404:
 *         description: Backup job atau file tidak ditemukan
 *       409:
 *         description: Backup belum selesai
 */
router.get('/jobs/:id/download',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.downloadBackup
);

/**
 * @swagger
 * /api/backup/export:
 *   post:
 *     summary: Ekspor data tabel
 *     description: Mengekspor data tabel dalam format yang ditentukan
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExportRequest'
 *     responses:
 *       200:
 *         description: Ekspor berhasil dimulai
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Export started successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     export_id:
 *                       type: string
 *                       format: uuid
 *                     download_url:
 *                       type: string
 *                       description: URL untuk mengunduh hasil ekspor
 *       400:
 *         description: Data request tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_CREATE
 */
router.post('/export',
  requirePermission(PERMISSIONS.BACKUP_CREATE),
  BackupController.createExport
);

/**
 * @swagger
 * /api/backup/database/tables:
 *   get:
 *     summary: Mendapatkan daftar tabel database
 *     description: Mengambil daftar tabel database dengan informasi ukuran dan jumlah baris
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar tabel database berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DatabaseTable'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission BACKUP_READ
 */
router.get('/database/tables',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.getDatabaseTables
);

/**
 * @swagger
 * /api/backup/cleanup-expired:
 *   post:
 *     summary: Membersihkan backup yang expired
 *     description: Menghapus backup jobs dan file yang sudah expired (hanya system admin)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup berhasil dilakukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Expired backups cleaned up successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_jobs:
 *                       type: integer
 *                       description: Jumlah jobs yang dihapus
 *                     freed_space:
 *                       type: integer
 *                       description: Ruang yang dibebaskan (bytes)
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission SYSTEM_MANAGE
 */
router.post('/cleanup-expired',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  BackupController.cleanupExpiredBackups
);

/**
 * @swagger
 * /api/backup/system/status:
 *   get:
 *     summary: Mendapatkan status sistem backup
 *     description: Mengambil status sistem backup termasuk disk space dan konfigurasi (hanya system admin)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status sistem backup berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     disk_usage:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         used:
 *                           type: integer
 *                         available:
 *                           type: integer
 *                     backup_directory:
 *                       type: string
 *                     active_jobs:
 *                       type: integer
 *                     last_cleanup:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission SYSTEM_MANAGE
 */
router.get('/system/status',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  BackupController.getSystemBackupStatus
);

export default router;