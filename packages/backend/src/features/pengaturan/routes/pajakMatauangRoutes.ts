import { Router } from 'express';
import { PajakMatauangController } from '../controllers/PajakMatauangController';
import { authenticate, userRateLimit } from '@/features/auth/middleware/authMiddleware';

const router = Router();

// Rate limiting untuk pajak mata uang endpoints
const pajakMatauangRateLimit = userRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// ========================================
// Tax (Pajak) Routes
// ========================================

/**
 * @route   GET /api/pajakmatauang/pajak
 * @desc    Get list of tax settings with filters and pagination
 * @access  Private
 * @query   search, status, page, limit
 */
router.get('/pajak', authenticate, pajakMatauangRateLimit, PajakMatauangController.getPajak);

/**
 * @route   GET /api/pajakmatauang/pajak/:id
 * @desc    Get tax setting by ID
 * @access  Private
 */
router.get('/pajak/:id', authenticate, pajakMatauangRateLimit, PajakMatauangController.getPajakById);

/**
 * @route   POST /api/pajakmatauang/pajak
 * @desc    Create new tax setting
 * @access  Private
 * @body    nama, persentase, deskripsi?, aktif?, is_default?
 */
router.post('/pajak', authenticate, pajakMatauangRateLimit, PajakMatauangController.createPajak);

/**
 * @route   PUT /api/pajakmatauang/pajak/:id
 * @desc    Update tax setting
 * @access  Private
 * @body    nama?, persentase?, deskripsi?, aktif?, is_default?
 */
router.put('/pajak/:id', authenticate, pajakMatauangRateLimit, PajakMatauangController.updatePajak);

/**
 * @route   DELETE /api/pajakmatauang/pajak/:id
 * @desc    Delete tax setting
 * @access  Private
 */
router.delete('/pajak/:id', authenticate, pajakMatauangRateLimit, PajakMatauangController.deletePajak);

/**
 * @route   PATCH /api/pajakmatauang/pajak/:id/toggle-status
 * @desc    Toggle tax setting status (aktif/tidak aktif)
 * @access  Private
 */
router.patch('/pajak/:id/toggle-status', authenticate, pajakMatauangRateLimit, PajakMatauangController.togglePajakStatus);

// ========================================
// Currency (Mata Uang) Routes
// ========================================

/**
 * @route   GET /api/pajakmatauang/mata-uang
 * @desc    Get list of currency settings with filters and pagination
 * @access  Private
 * @query   search, status, page, limit
 */
router.get('/mata-uang', authenticate, pajakMatauangRateLimit, PajakMatauangController.getMatauang);

/**
 * @route   GET /api/pajakmatauang/mata-uang/:id
 * @desc    Get currency setting by ID
 * @access  Private
 */
router.get('/mata-uang/:id', authenticate, pajakMatauangRateLimit, PajakMatauangController.getMatauangById);

/**
 * @route   POST /api/pajakmatauang/mata-uang
 * @desc    Create new currency setting
 * @access  Private
 * @body    nama, kode, simbol, nilai_tukar?, deskripsi?, aktif?, is_default?
 */
router.post('/mata-uang', authenticate, pajakMatauangRateLimit, PajakMatauangController.createMatauang);

/**
 * @route   PUT /api/pajakmatauang/mata-uang/:id
 * @desc    Update currency setting
 * @access  Private
 * @body    nama?, kode?, simbol?, nilai_tukar?, deskripsi?, aktif?, is_default?
 */
router.put('/mata-uang/:id', authenticate, pajakMatauangRateLimit, PajakMatauangController.updateMatauang);

/**
 * @route   DELETE /api/pajakmatauang/mata-uang/:id
 * @desc    Delete currency setting
 * @access  Private
 */
router.delete('/mata-uang/:id', authenticate, pajakMatauangRateLimit, PajakMatauangController.deleteMatauang);

/**
 * @route   PATCH /api/pajakmatauang/mata-uang/:id/toggle-status
 * @desc    Toggle currency setting status (aktif/tidak aktif)
 * @access  Private
 */
router.patch('/mata-uang/:id/toggle-status', authenticate, pajakMatauangRateLimit, PajakMatauangController.toggleMatauangStatus);

// ========================================
// Statistics Routes
// ========================================

/**
 * @route   GET /api/pajakmatauang/stats
 * @desc    Get statistics for pajak and mata uang settings
 * @access  Private
 * @returns {Object} Statistics including total counts and active counts
 */
router.get('/stats', authenticate, pajakMatauangRateLimit, PajakMatauangController.getStats);

export { router as pajakMatauangRoutes };