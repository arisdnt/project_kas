/**
 * Routes untuk Perpesanan API
 * Definisi endpoint dan middleware untuk sistem messaging
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PerpesananController } from '../controllers/PerpesananController';
import { PerpesananControllerExtended } from '../controllers/PerpesananControllerExtended';

const router = Router();

// Middleware autentikasi dan access scope untuk semua routes perpesanan
router.use(authenticate);
router.use(attachAccessScope);

/**
 * GET /api/perpesanan
 * Mendapatkan daftar pesan dengan pagination dan filter
 * Akses: Semua user yang terautentikasi
 */
router.get('/', PerpesananController.searchPerpesanan);

/**
 * GET /api/perpesanan/stats
 * Mendapatkan statistik pesan user
 * Akses: Semua user yang terautentikasi
 */
router.get('/stats', PerpesananController.getStats);

/**
 * GET /api/perpesanan/conversations
 * Mendapatkan daftar konversasi (pesan terakhir dengan setiap user)
 * Akses: Semua user yang terautentikasi
 */
router.get('/conversations', PerpesananControllerExtended.getConversations);

/**
 * GET /api/perpesanan/unread-count
 * Mendapatkan jumlah pesan belum dibaca
 * Akses: Semua user yang terautentikasi
 */
router.get('/unread-count', PerpesananControllerExtended.getUnreadCount);

/**
 * GET /api/perpesanan/conversation/:partnerId
 * Mendapatkan riwayat pesan dengan user tertentu
 * Akses: Semua user yang terautentikasi
 */
router.get('/conversation/:partnerId', PerpesananControllerExtended.getConversationHistory);

/**
 * GET /api/perpesanan/:id
 * Mendapatkan pesan berdasarkan ID
 * Akses: Semua user yang terautentikasi (dengan validasi akses)
 */
router.get('/:id', PerpesananController.findById);

/**
 * POST /api/perpesanan
 * Membuat pesan baru
 * Akses: Semua user yang terautentikasi
 */
router.post('/', PerpesananController.createPerpesanan);

/**
 * POST /api/perpesanan/:id/reply
 * Membalas pesan
 * Akses: Semua user yang terautentikasi (dengan validasi akses)
 */
router.post('/:id/reply', PerpesananControllerExtended.replyPerpesanan);

/**
 * PATCH /api/perpesanan/mark-read
 * Menandai pesan sebagai dibaca
 * Akses: Semua user yang terautentikasi
 */
router.patch('/mark-read', PerpesananControllerExtended.markAsRead);

/**
 * PUT /api/perpesanan/:id
 * Update pesan (hanya pengirim yang dapat mengupdate)
 * Akses: Semua user yang terautentikasi (dengan validasi akses)
 */
router.put('/:id', PerpesananController.updatePerpesanan);

/**
 * DELETE /api/perpesanan/:id
 * Menghapus pesan (hanya pengirim yang dapat menghapus)
 * Akses: Semua user yang terautentikasi (dengan validasi akses)
 */
router.delete('/:id', PerpesananControllerExtended.deletePerpesanan);

export default router;