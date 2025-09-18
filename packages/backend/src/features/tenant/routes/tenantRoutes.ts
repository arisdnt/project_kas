/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik tenant
 *         nama:
 *           type: string
 *           description: Nama tenant
 *         email:
 *           type: string
 *           format: email
 *           description: Email tenant
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Status tenant
 *         subscription_plan:
 *           type: string
 *           description: Paket berlangganan
 *         subscription_expires:
 *           type: string
 *           format: date-time
 *           description: Tanggal berakhir berlangganan
 *         max_users:
 *           type: number
 *           description: Maksimal pengguna
 *         max_stores:
 *           type: number
 *           description: Maksimal toko
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateTenantRequest:
 *       type: object
 *       required:
 *         - nama
 *         - email
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama tenant
 *         email:
 *           type: string
 *           format: email
 *           description: Email tenant
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         subscription_plan:
 *           type: string
 *           description: Paket berlangganan
 *         max_users:
 *           type: number
 *           description: Maksimal pengguna
 *         max_stores:
 *           type: number
 *           description: Maksimal toko
 *     UpdateTenantRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama tenant
 *         email:
 *           type: string
 *           format: email
 *           description: Email tenant
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Status tenant
 *         subscription_plan:
 *           type: string
 *           description: Paket berlangganan
 *         max_users:
 *           type: number
 *           description: Maksimal pengguna
 *         max_stores:
 *           type: number
 *           description: Maksimal toko
 *     TenantStats:
 *       type: object
 *       properties:
 *         total_tenants:
 *           type: number
 *           description: Total tenant
 *         active_tenants:
 *           type: number
 *           description: Tenant aktif
 *         inactive_tenants:
 *           type: number
 *           description: Tenant tidak aktif
 *         suspended_tenants:
 *           type: number
 *           description: Tenant yang disuspend
 *         total_stores:
 *           type: number
 *           description: Total toko
 *         total_users:
 *           type: number
 *           description: Total pengguna
 *     TenantLimits:
 *       type: object
 *       properties:
 *         max_users:
 *           type: number
 *           description: Maksimal pengguna
 *         current_users:
 *           type: number
 *           description: Pengguna saat ini
 *         max_stores:
 *           type: number
 *           description: Maksimal toko
 *         current_stores:
 *           type: number
 *           description: Toko saat ini
 *         can_add_users:
 *           type: boolean
 *           description: Dapat menambah pengguna
 *         can_add_stores:
 *           type: boolean
 *           description: Dapat menambah toko
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { TenantController } from '../controllers/TenantController';
import { TokoController } from '../controllers/TokoController';
import { requireGodUserForTenant, requireTenantReadAccess } from '../middleware/tenantAccessMiddleware';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/tenant:
 *   get:
 *     tags: [Tenant]
 *     summary: Cari tenant (God user only)
 *     description: Mencari tenant dengan filter dan pagination (hanya untuk God user)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian nama tenant
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter berdasarkan status
 *     responses:
 *       200:
 *         description: Daftar tenant berhasil diambil
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
 *                     $ref: '#/components/schemas/Tenant'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', requireGodUserForTenant, TenantController.search);

/**
 * @swagger
 * /api/tenant/stats:
 *   get:
 *     tags: [Tenant]
 *     summary: Statistik tenant (God user only)
 *     description: Mengambil statistik tenant (hanya untuk God user)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik tenant berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TenantStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats', requireGodUserForTenant, TenantController.getTenantStats);

/**
 * @swagger
 * /api/tenant/{id}:
 *   get:
 *     tags: [Tenant]
 *     summary: Dapatkan tenant berdasarkan ID (God user only)
 *     description: Mengambil detail tenant berdasarkan ID (hanya untuk God user)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID tenant
 *     responses:
 *       200:
 *         description: Detail tenant berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id', requireTenantReadAccess, TenantController.findById);

/**
 * @swagger
 * /api/tenant:
 *   post:
 *     tags: [Tenant]
 *     summary: Buat tenant baru (God user only)
 *     description: Membuat tenant baru (hanya untuk God user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTenantRequest'
 *     responses:
 *       201:
 *         description: Tenant berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', requireGodUserForTenant, TenantController.create);

/**
 * @swagger
 * /api/tenant/{id}:
 *   put:
 *     tags: [Tenant]
 *     summary: Update tenant (God user only)
 *     description: Mengupdate data tenant (hanya untuk God user)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTenantRequest'
 *     responses:
 *       200:
 *         description: Tenant berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', requireGodUserForTenant, TenantController.update);

/**
 * @swagger
 * /api/tenant/{id}:
 *   delete:
 *     tags: [Tenant]
 *     summary: Hapus tenant (God user only)
 *     description: Soft delete tenant (status -> nonaktif) jika tidak ada store/pengguna aktif
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID tenant
 *     responses:
 *       200:
 *         description: Tenant berhasil dihapus (soft delete)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete('/:id', requireGodUserForTenant, TenantController.delete);

/**
 * @swagger
 * /api/tenant/{id}/limits:
 *   get:
 *     tags: [Tenant]
 *     summary: Cek limit tenant (God user only)
 *     description: Mengecek limit penggunaan tenant (hanya untuk God user)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID tenant
 *     responses:
 *       200:
 *         description: Limit tenant berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TenantLimits'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id/limits', requireTenantReadAccess, TenantController.checkLimits);

/**
 * @swagger
 * /api/tenant/{tenantId}/stores:
 *   get:
 *     tags: [Tenant]
 *     summary: Dapatkan toko tenant
 *     description: Mengambil daftar toko milik tenant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID tenant
 *     responses:
 *       200:
 *         description: Daftar toko tenant berhasil diambil
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
 *                     type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:tenantId/stores', TokoController.getTenantStores);

/**
 * @swagger
 * /api/tenant/stores:
 *   post:
 *     tags: [Tenant]
 *     summary: Buat toko baru
 *     description: Membuat toko baru untuk tenant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 description: Nama toko
 *               alamat:
 *                 type: string
 *                 description: Alamat toko
 *               telepon:
 *                 type: string
 *                 description: Nomor telepon toko
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID tenant
 *     responses:
 *       201:
 *         description: Toko berhasil dibuat
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
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/stores', TokoController.create);

/**
 * @swagger
 * /api/tenant/stores/{id}:
 *   put:
 *     tags: [Tenant]
 *     summary: Update toko
 *     description: Mengupdate data toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 description: Nama toko
 *               alamat:
 *                 type: string
 *                 description: Alamat toko
 *               telepon:
 *                 type: string
 *                 description: Nomor telepon toko
 *     responses:
 *       200:
 *         description: Toko berhasil diupdate
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
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/stores/:id', TokoController.update);

/**
 * @swagger
 * /api/tenant/stores/{id}:
 *   delete:
 *     tags: [Tenant]
 *     summary: Hapus toko
 *     description: Menghapus toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Toko berhasil dihapus
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
 *                   example: "Toko berhasil dihapus"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/stores/:id', TokoController.delete);

export default router;