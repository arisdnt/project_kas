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
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { KasirController } from '../controllers/KasirController';

const router = Router();

// Apply common middleware untuk semua kasir routes
router.use(authenticate);
router.use(attachAccessScope);
router.use(requireStoreWhenNeeded); // Kasir operations require store context

/**
 * @route GET /api/kasir/health
 * @desc Health check untuk kasir system
 * @access Private - Requires kasir/admin permission
 */
router.get('/health',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.healthCheck
);

/**
 * @route GET /api/kasir/session
 * @desc Membuat atau mendapatkan session kasir aktif
 * @access Private - Requires kasir permission
 *
 * Response:
 * - session: KasirSession object
 * - socket_room: Room ID untuk Socket.IO real-time updates
 */
router.get('/session',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.createSession
);

/**
 * @route GET /api/kasir/summary
 * @desc Get summary penjualan kasir untuk hari ini
 * @access Private - Requires transaction read permission
 *
 * Response: SummaryKasir dengan data:
 * - Total transaksi, item terjual, pendapatan
 * - Breakdown tunai vs non-tunai
 * - Transaksi per jam
 */
router.get('/summary',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.getSummary
);

// ===================
// PRODUCT OPERATIONS
// ===================

/**
 * @route GET /api/kasir/produk/search
 * @desc Pencarian produk untuk kasir dengan real-time inventory
 * @access Private - Requires product read permission
 *
 * Query Parameters:
 * - query: string (nama, kode, atau barcode produk)
 * - kategori_id: UUID (filter by kategori)
 * - brand_id: UUID (filter by brand)
 * - barcode: string (exact barcode match)
 * - stok_minimum: boolean (filter produk dengan stok <= minimum)
 * - aktif_only: boolean (default: true, hanya produk aktif)
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 *
 * Response: SearchProdukResponse dengan:
 * - products: Array<ProdukKasir> dengan data inventory real-time
 * - total: Total produk yang match
 * - pagination info
 */
router.get('/produk/search',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  KasirController.searchProduk
);

/**
 * @route POST /api/kasir/produk/scan
 * @desc Scan barcode produk untuk kasir
 * @access Private - Requires product read permission
 *
 * Body:
 * - barcode: string (required)
 * - kuantitas: number (default: 1)
 *
 * Response: ProdukKasir dengan stock info
 * Error 404: Jika barcode tidak ditemukan
 * Error 400: Jika produk stok habis
 */
router.post('/produk/scan',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  KasirController.scanBarcode
);

// ================
// CART OPERATIONS
// ================

/**
 * @route POST /api/kasir/cart/add
 * @desc Tambah item ke cart kasir session
 * @access Private - Requires transaction create permission
 *
 * Headers:
 * - x-kasir-session: string (optional, auto-generated if missing)
 *
 * Body:
 * - produk_id: UUID (required)
 * - kuantitas: number (required, 1-1000)
 * - harga_satuan: number (optional, override harga default)
 * - diskon_persen: number (optional, 0-100)
 * - diskon_nominal: number (optional, >= 0)
 * - catatan: string (optional, max 255 chars)
 *
 * Response: KasirCartItem yang ditambahkan
 * Real-time: Emit 'cart:item_added' event
 *
 * Validasi:
 * - Produk harus aktif dan ada stok
 * - Kuantitas tidak boleh melebihi stok tersedia
 * - Auto-reserve stok sementara
 */
router.post('/cart/add',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.addItemToCart
);

/**
 * @route PUT /api/kasir/cart/:produkId
 * @desc Update item di cart (kuantitas, diskon, catatan)
 * @access Private - Requires transaction create permission
 *
 * Headers:
 * - x-kasir-session: string (required)
 *
 * Body:
 * - kuantitas: number (required, 0 untuk hapus item)
 * - diskon_persen: number (optional, 0-100)
 * - diskon_nominal: number (optional, >= 0)
 * - catatan: string (optional, max 255 chars)
 *
 * Response: Updated KasirCartItem
 * Real-time: Emit 'cart:item_updated' atau 'cart:item_removed'
 *
 * Special: kuantitas = 0 akan menghapus item dari cart
 */
router.put('/cart/:produkId',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.updateCartItem
);

/**
 * @route DELETE /api/kasir/cart/:produkId
 * @desc Hapus item dari cart
 * @access Private - Requires transaction create permission
 *
 * Headers:
 * - x-kasir-session: string (required)
 *
 * Response: Success message
 * Real-time: Emit 'cart:item_removed' event
 * Side effect: Release reserved stock
 */
router.delete('/cart/:produkId',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.removeItemFromCart
);

/**
 * @route DELETE /api/kasir/cart
 * @desc Kosongkan seluruh cart
 * @access Private - Requires transaction create permission
 *
 * Headers:
 * - x-kasir-session: string (required)
 *
 * Response: Success message
 * Real-time: Emit 'cart:cleared' event
 * Side effect: Release all reserved stock untuk session
 */
router.delete('/cart',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.clearCart
);

// ====================
// CUSTOMER OPERATIONS
// ====================

/**
 * @route POST /api/kasir/pelanggan
 * @desc Set pelanggan untuk transaksi kasir
 * @access Private - Requires customer read permission
 *
 * Headers:
 * - x-kasir-session: string (required)
 *
 * Body:
 * - pelanggan_id: UUID (optional, null untuk remove customer)
 * - kode_pelanggan: string (alternative way to select by code)
 *
 * Response: PelangganKasir dengan info diskon, poin, dll
 *
 * Validasi:
 * - Pelanggan harus aktif dan bukan blacklist
 * - Otomatis apply diskon member jika ada
 */
router.post('/pelanggan',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  KasirController.setPelanggan
);

// ========================
// TRANSACTION PROCESSING
// ========================

/**
 * @route POST /api/kasir/bayar
 * @desc Proses pembayaran dan selesaikan transaksi
 * @access Private - Requires transaction create permission
 *
 * Headers:
 * - x-kasir-session: string (required)
 *
 * Body:
 * - metode_bayar: enum ['tunai', 'transfer', 'kartu', 'kredit', 'poin']
 * - jumlah_bayar: number (required, amount paid)
 * - cart_items: KasirCartItem[] (current cart state)
 * - pelanggan_id: UUID (optional)
 * - diskon_persen: number (transaction level discount %)
 * - diskon_nominal: number (transaction level discount amount)
 * - catatan: string (optional transaction notes)
 *
 * Response: TransaksiPenjualanData dengan nomor transaksi
 * Real-time: Multiple events:
 * - 'transaction:completed' dengan data transaksi
 * - 'inventory:stock_updated' untuk setiap produk
 * - 'cart:cleared' untuk reset session
 *
 * Validasi:
 * - Cart tidak boleh kosong
 * - Untuk tunai: jumlah_bayar >= total_akhir
 * - Cek stok final sebelum commit
 * - Auto-generate nomor transaksi
 * - Update stok inventory (reduce available, release reserved)
 *
 * Database Transaction:
 * - Insert transaksi_penjualan
 * - Insert item_transaksi_penjualan (bulk)
 * - Update inventaris stock
 * - Clear cart session/temp data
 * - Log audit trail
 */
router.post('/bayar',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.prosesTransaksi
);

/**
 * @route GET /api/kasir/transaksi/:transaksiId
 * @desc Get detail transaksi by ID
 * @access Private - Requires transaction read permission
 *
 * Response: TransaksiPenjualanData dengan items detail
 * Error 404: Jika transaksi tidak ditemukan atau bukan milik store
 */
router.get('/transaksi/:transaksiId',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.getTransaksi
);

export default router;