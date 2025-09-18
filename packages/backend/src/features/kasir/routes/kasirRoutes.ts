/**
 * Kasir Routes - RESTful API Endpoints untuk Point of Sales System
 * Mendukung operasi real-time, cart management, dan transaksi
 *
 * Fitur utama:
 * - Session management kasir
 * - Product search dan barcode scanning
 * - Cart operations (add, update, remove, clear)
 * - Customer selection
 * - Transaction processing
 * - Sales summary dan reporting
 * - Real-time updates via Socket.IO
 * 
 * @swagger
 * components:
 *   schemas:
 *     KasirSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID session kasir
 *         user_id:
 *           type: string
 *           description: ID user kasir
 *         store_id:
 *           type: string
 *           description: ID toko
 *         cart_items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         pelanggan:
 *           $ref: '#/components/schemas/Pelanggan'
 *         total_amount:
 *           type: number
 *           description: Total amount
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal dibuat
 *     
 *     CartItem:
 *       type: object
 *       properties:
 *         produk_id:
 *           type: string
 *           description: ID produk
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *         harga:
 *           type: number
 *           description: Harga produk
 *         quantity:
 *           type: integer
 *           description: Jumlah item
 *         subtotal:
 *           type: number
 *           description: Subtotal item
 *     
 *     Produk:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID produk
 *         nama:
 *           type: string
 *           description: Nama produk
 *         barcode:
 *           type: string
 *           description: Barcode produk
 *         harga:
 *           type: number
 *           description: Harga produk
 *         stok:
 *           type: integer
 *           description: Stok tersedia
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *     
 *     Pelanggan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID pelanggan
 *         nama:
 *           type: string
 *           description: Nama pelanggan
 *         email:
 *           type: string
 *           description: Email pelanggan
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *     
 *     Transaksi:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID transaksi
 *         nomor_transaksi:
 *           type: string
 *           description: Nomor transaksi
 *         total_amount:
 *           type: number
 *           description: Total amount
 *         status:
 *           type: string
 *           description: Status transaksi
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal transaksi
 *     
 *     AddCartItemRequest:
 *       type: object
 *       required:
 *         - produk_id
 *         - quantity
 *       properties:
 *         produk_id:
 *           type: string
 *           description: ID produk
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Jumlah item
 *     
 *     UpdateCartItemRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Jumlah item baru
 *     
 *     SetPelangganRequest:
 *       type: object
 *       properties:
 *         pelanggan_id:
 *           type: string
 *           description: ID pelanggan (opsional untuk guest)
 *     
 *     PembayaranRequest:
 *       type: object
 *       required:
 *         - metode_bayar
 *         - jumlah_bayar
 *       properties:
 *         metode_bayar:
 *           type: string
 *           enum: [cash, card, transfer, ewallet]
 *           description: Metode pembayaran
 *         jumlah_bayar:
 *           type: number
 *           minimum: 0
 *           description: Jumlah pembayaran
 *         catatan:
 *           type: string
 *           description: Catatan transaksi
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { KasirController } from '../controllers/KasirController';
import { requireKasirLevel } from '@/features/kasir/middleware/kasirAccessMiddleware';

const router = Router();

// Apply common middleware untuk semua kasir routes
router.use(authenticate);
router.use(attachAccessScope);
router.use(requireStoreWhenNeeded); // Kasir operations require store context
router.use(requireKasirLevel);

/**
 * @swagger
 * /api/kasir/health:
 *   get:
 *     summary: Health check kasir system
 *     description: Memeriksa status kesehatan sistem kasir
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sistem kasir berjalan normal
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
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       401:
 *         description: Tidak terotorisasi
 */
router.get('/health',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.healthCheck
);

/**
 * @swagger
 * /api/kasir/session:
 *   get:
 *     summary: Membuat atau mendapatkan session kasir
 *     description: Membuat session kasir baru atau mendapatkan session aktif
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session kasir berhasil dibuat/diambil
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
 *                     session:
 *                       $ref: '#/components/schemas/KasirSession'
 *                     socket_room:
 *                       type: string
 *                       description: Room ID untuk Socket.IO
 *       400:
 *         description: Store ID diperlukan
 *       401:
 *         description: Tidak terotorisasi
 */
router.get('/session',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.createSession
);

/**
 * @swagger
 * /api/kasir/summary:
 *   get:
 *     summary: Mendapatkan ringkasan penjualan
 *     description: Mendapatkan ringkasan penjualan kasir hari ini
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ringkasan penjualan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_transaksi:
 *                       type: integer
 *                     total_penjualan:
 *                       type: number
 *                     rata_rata_transaksi:
 *                       type: number
 *       401:
 *         description: Tidak terotorisasi
 */
router.get('/summary',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.getSummary
);

/**
 * @swagger
 * /api/kasir/produk/search:
 *   get:
 *     summary: Pencarian produk untuk kasir
 *     description: Mencari produk berdasarkan nama atau barcode
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: kategori
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Jumlah hasil maksimal
 *     responses:
 *       200:
 *         description: Hasil pencarian produk
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
 *                     $ref: '#/components/schemas/Produk'
 *       400:
 *         description: Parameter pencarian tidak valid
 *       401:
 *         description: Tidak terotorisasi
 */
router.get('/produk/search',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  KasirController.searchProduk
);

/**
 * @swagger
 * /api/kasir/produk/scan/{barcode}:
 *   get:
 *     summary: Scan produk berdasarkan barcode
 *     tags: [Kasir - Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Barcode produk
 *       - in: header
 *         name: X-Store-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Produk ditemukan
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
 *                   $ref: '#/components/schemas/Produk'
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Server error
 */
router.get('/produk/scan/:barcode',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  KasirController.scanBarcode
);

/**
 * @swagger
 * /api/kasir/cart/add:
 *   post:
 *     summary: Tambah item ke keranjang
 *     description: Menambahkan produk ke keranjang kasir
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItemRequest'
 *     responses:
 *       200:
 *         description: Item berhasil ditambahkan ke keranjang
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
 *                   $ref: '#/components/schemas/KasirSession'
 *       400:
 *         description: Data tidak valid atau stok tidak mencukupi
 *       401:
 *         description: Tidak terotorisasi
 */
router.post('/cart/add',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.addItemToCart
);

/**
 * @swagger
 * /api/kasir/cart/{produkId}:
 *   put:
 *     summary: Update item di keranjang
 *     description: Mengupdate quantity item di keranjang
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: produkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: Item berhasil diupdate
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
 *                   $ref: '#/components/schemas/KasirSession'
 *       400:
 *         description: Data tidak valid atau stok tidak mencukupi
 *       401:
 *         description: Tidak terotorisasi
 *       404:
 *         description: Item tidak ditemukan di keranjang
 */
router.put('/cart/:produkId',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.updateCartItem
);

/**
 * @swagger
 * /api/kasir/cart/{produkId}:
 *   delete:
 *     summary: Hapus item dari keranjang
 *     description: Menghapus item dari keranjang kasir
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: produkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID produk
 *     responses:
 *       200:
 *         description: Item berhasil dihapus dari keranjang
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
 *                   $ref: '#/components/schemas/KasirSession'
 *       401:
 *         description: Tidak terotorisasi
 *       404:
 *         description: Item tidak ditemukan di keranjang
 */
router.delete('/cart/:produkId',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.removeItemFromCart
);

/**
 * @swagger
 * /api/kasir/cart:
 *   delete:
 *     summary: Kosongkan keranjang
 *     description: Menghapus semua item dari keranjang kasir
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Keranjang berhasil dikosongkan
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
 *                   $ref: '#/components/schemas/KasirSession'
 *       401:
 *         description: Tidak terotorisasi
 */
router.delete('/cart',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.clearCart
);

/**
 * @swagger
 * /api/kasir/pelanggan:
 *   get:
 *     summary: Cari pelanggan berdasarkan nama/telepon
 *     tags: [Kasir - Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian (nama/telepon)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah maksimal hasil
 *       - in: header
 *         name: X-Store-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Daftar pelanggan
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pelanggan'
 *       500:
 *         description: Server error
 */
router.get('/pelanggan',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  KasirController.searchPelanggan
);

/**
 * @swagger
 * /api/kasir/pelanggan:
 *   post:
 *     summary: Set pelanggan untuk transaksi
 *     description: Mengatur pelanggan yang akan digunakan dalam transaksi
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPelangganRequest'
 *     responses:
 *       200:
 *         description: Pelanggan berhasil diset
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
 *                   $ref: '#/components/schemas/KasirSession'
 *       404:
 *         description: Pelanggan tidak ditemukan
 */
router.post('/pelanggan',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  KasirController.setPelanggan
);

/**
 * @swagger
 * /api/kasir/bayar:
 *   post:
 *     summary: Proses pembayaran transaksi
 *     description: Memproses pembayaran dan menyelesaikan transaksi
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PembayaranRequest'
 *     responses:
 *       201:
 *         description: Transaksi berhasil diproses
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
 *                     transaksi:
 *                       $ref: '#/components/schemas/Transaksi'
 *                     kembalian:
 *                       type: number
 *                       description: Jumlah kembalian
 *       400:
 *         description: Data tidak valid atau keranjang kosong
 *       401:
 *         description: Tidak terotorisasi
 */
router.post('/bayar',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.prosesTransaksi
);

/**
 * @swagger
 * /api/kasir/transaksi/{transaksiId}:
 *   get:
 *     summary: Mendapatkan detail transaksi
 *     description: Mendapatkan detail transaksi berdasarkan ID
 *     tags: [Kasir]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaksiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Detail transaksi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaksi'
 *       401:
 *         description: Tidak terotorisasi
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.get('/transaksi/:transaksiId',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.getTransaksi
);

export default router;
