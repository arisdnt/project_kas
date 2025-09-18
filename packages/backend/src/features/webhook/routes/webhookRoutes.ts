/**
 * @swagger
 * components:
 *   schemas:
 *     Webhook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik webhook
 *         name:
 *           type: string
 *           description: Nama webhook
 *         url:
 *           type: string
 *           format: uri
 *           description: URL endpoint webhook
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar event yang akan memicu webhook
 *         secret:
 *           type: string
 *           description: Secret key untuk validasi webhook
 *         active:
 *           type: boolean
 *           description: Status aktif webhook
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateWebhookRequest:
 *       type: object
 *       required:
 *         - name
 *         - url
 *         - events
 *       properties:
 *         name:
 *           type: string
 *           description: Nama webhook
 *         url:
 *           type: string
 *           format: uri
 *           description: URL endpoint webhook
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar event yang akan memicu webhook
 *         secret:
 *           type: string
 *           description: Secret key untuk validasi webhook
 *         active:
 *           type: boolean
 *           default: true
 *           description: Status aktif webhook
 *     UpdateWebhookRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nama webhook
 *         url:
 *           type: string
 *           format: uri
 *           description: URL endpoint webhook
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar event yang akan memicu webhook
 *         secret:
 *           type: string
 *           description: Secret key untuk validasi webhook
 *         active:
 *           type: boolean
 *           description: Status aktif webhook
 *     WebhookDelivery:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID delivery
 *         webhook_id:
 *           type: string
 *           format: uuid
 *           description: ID webhook
 *         event:
 *           type: string
 *           description: Event yang memicu webhook
 *         payload:
 *           type: object
 *           description: Data payload yang dikirim
 *         status:
 *           type: string
 *           enum: [pending, success, failed]
 *           description: Status pengiriman
 *         response_code:
 *           type: number
 *           description: HTTP response code
 *         response_body:
 *           type: string
 *           description: Response body dari endpoint
 *         attempts:
 *           type: number
 *           description: Jumlah percobaan pengiriman
 *         created_at:
 *           type: string
 *           format: date-time
 *     WebhookStats:
 *       type: object
 *       properties:
 *         total_deliveries:
 *           type: number
 *           description: Total pengiriman
 *         successful_deliveries:
 *           type: number
 *           description: Pengiriman berhasil
 *         failed_deliveries:
 *           type: number
 *           description: Pengiriman gagal
 *         success_rate:
 *           type: number
 *           format: float
 *           description: Tingkat keberhasilan (0-1)
 *         last_delivery:
 *           type: string
 *           format: date-time
 *           description: Waktu pengiriman terakhir
 *     Integration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID integrasi
 *         name:
 *           type: string
 *           description: Nama integrasi
 *         type:
 *           type: string
 *           description: Tipe integrasi
 *         config:
 *           type: object
 *           description: Konfigurasi integrasi
 *         active:
 *           type: boolean
 *           description: Status aktif integrasi
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateIntegrationRequest:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - config
 *       properties:
 *         name:
 *           type: string
 *           description: Nama integrasi
 *         type:
 *           type: string
 *           description: Tipe integrasi
 *         config:
 *           type: object
 *           description: Konfigurasi integrasi
 *         active:
 *           type: boolean
 *           default: true
 *           description: Status aktif integrasi
 *     TriggerWebhookRequest:
 *       type: object
 *       required:
 *         - event
 *         - data
 *       properties:
 *         event:
 *           type: string
 *           description: Nama event yang akan dipicu
 *         data:
 *           type: object
 *           description: Data payload untuk webhook
 *     WebhookTestRequest:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: URL untuk test webhook
 *         payload:
 *           type: object
 *           description: Data test payload
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/webhook:
 *   get:
 *     tags: [Webhook]
 *     summary: Cari webhook
 *     description: Mencari webhook dengan filter dan pagination
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
 *         description: Kata kunci pencarian nama webhook
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *     responses:
 *       200:
 *         description: Daftar webhook berhasil diambil
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
 *                     $ref: '#/components/schemas/Webhook'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.searchWebhooks
);

/**
 * @swagger
 * /api/webhook/{id}:
 *   get:
 *     tags: [Webhook]
 *     summary: Dapatkan webhook berdasarkan ID
 *     description: Mengambil detail webhook berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID webhook
 *     responses:
 *       200:
 *         description: Detail webhook berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Webhook'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.findWebhookById
);

/**
 * @swagger
 * /api/webhook/{id}/deliveries:
 *   get:
 *     tags: [Webhook]
 *     summary: Dapatkan riwayat pengiriman webhook
 *     description: Mengambil riwayat pengiriman webhook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID webhook
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *         description: Jumlah maksimal riwayat yang diambil
 *     responses:
 *       200:
 *         description: Riwayat pengiriman berhasil diambil
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
 *                     $ref: '#/components/schemas/WebhookDelivery'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/deliveries',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.getWebhookDeliveries
);

/**
 * @swagger
 * /api/webhook/{id}/stats:
 *   get:
 *     tags: [Webhook]
 *     summary: Dapatkan statistik webhook
 *     description: Mengambil statistik pengiriman webhook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID webhook
 *     responses:
 *       200:
 *         description: Statistik webhook berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WebhookStats'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/stats',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.getWebhookStats
);

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     tags: [Webhook]
 *     summary: Buat webhook baru
 *     description: Membuat webhook baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWebhookRequest'
 *     responses:
 *       201:
 *         description: Webhook berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Webhook'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/',
  requirePermission(PERMISSIONS.WEBHOOK_CREATE),
  WebhookController.createWebhook
);

/**
 * @swagger
 * /api/webhook/{id}:
 *   put:
 *     tags: [Webhook]
 *     summary: Update webhook
 *     description: Mengupdate data webhook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWebhookRequest'
 *     responses:
 *       200:
 *         description: Webhook berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Webhook'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id',
  requirePermission(PERMISSIONS.WEBHOOK_UPDATE),
  WebhookController.updateWebhook
);

/**
 * @swagger
 * /api/webhook/{id}:
 *   delete:
 *     tags: [Webhook]
 *     summary: Hapus webhook
 *     description: Menghapus webhook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID webhook
 *     responses:
 *       200:
 *         description: Webhook berhasil dihapus
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
 *                   example: "Webhook berhasil dihapus"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.WEBHOOK_DELETE),
  WebhookController.deleteWebhook
);

/**
 * @swagger
 * /api/webhook/test:
 *   post:
 *     tags: [Webhook]
 *     summary: Test webhook
 *     description: Melakukan test pengiriman webhook
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookTestRequest'
 *     responses:
 *       200:
 *         description: Test webhook berhasil
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
 *                     status_code:
 *                       type: number
 *                       description: HTTP status code response
 *                     response_time:
 *                       type: number
 *                       description: Response time dalam ms
 *                     response_body:
 *                       type: string
 *                       description: Response body
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/test',
  requirePermission(PERMISSIONS.WEBHOOK_CREATE),
  WebhookController.testWebhook
);

/**
 * @swagger
 * /api/webhook/trigger:
 *   post:
 *     tags: [Webhook]
 *     summary: Trigger webhook
 *     description: Memicu pengiriman webhook untuk event tertentu
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TriggerWebhookRequest'
 *     responses:
 *       200:
 *         description: Webhook berhasil dipicu
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
 *                   example: "Webhook berhasil dipicu"
 *                 triggered_count:
 *                   type: number
 *                   description: Jumlah webhook yang dipicu
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/trigger',
  requirePermission(PERMISSIONS.WEBHOOK_CREATE),
  WebhookController.triggerWebhooks
);

/**
 * @swagger
 * /api/webhook/integrations:
 *   get:
 *     tags: [Integration]
 *     summary: Dapatkan daftar integrasi
 *     description: Mengambil daftar integrasi yang tersedia
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar integrasi berhasil diambil
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
 *                     $ref: '#/components/schemas/Integration'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/integrations',
  requirePermission(PERMISSIONS.INTEGRATION_READ),
  WebhookController.getIntegrations
);

/**
 * @swagger
 * /api/webhook/integrations/{id}:
 *   get:
 *     tags: [Integration]
 *     summary: Dapatkan integrasi berdasarkan ID
 *     description: Mengambil detail integrasi berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID integrasi
 *     responses:
 *       200:
 *         description: Detail integrasi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Integration'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/integrations/:id',
  requirePermission(PERMISSIONS.INTEGRATION_READ),
  WebhookController.findIntegrationById
);

/**
 * @swagger
 * /api/webhook/integrations:
 *   post:
 *     tags: [Integration]
 *     summary: Buat integrasi baru
 *     description: Membuat integrasi baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIntegrationRequest'
 *     responses:
 *       201:
 *         description: Integrasi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Integration'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/integrations',
  requirePermission(PERMISSIONS.INTEGRATION_CREATE),
  WebhookController.createIntegration
);

/**
 * @swagger
 * /api/webhook/integrations/{id}:
 *   put:
 *     tags: [Integration]
 *     summary: Update integrasi
 *     description: Mengupdate data integrasi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID integrasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nama integrasi
 *               config:
 *                 type: object
 *                 description: Konfigurasi integrasi
 *               active:
 *                 type: boolean
 *                 description: Status aktif integrasi
 *     responses:
 *       200:
 *         description: Integrasi berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Integration'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/integrations/:id',
  requirePermission(PERMISSIONS.INTEGRATION_UPDATE),
  WebhookController.updateIntegration
);

export default router;