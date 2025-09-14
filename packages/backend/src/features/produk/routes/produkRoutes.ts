/**
 * Routes untuk API Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { MasterDataController } from '../controllers/MasterDataController';
import { ProdukInventarisController } from '../controllers/ProdukInventarisController';
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware';
import { UserRole } from '@/features/auth/models/User';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Middleware untuk semua routes produk
router.use(authenticate);
router.use(attachAccessScope);

// ===== KATEGORI ROUTES =====
router.get('/kategori', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), MasterDataController.getAllKategori);
router.post('/kategori', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.createKategori);
router.put('/kategori/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.updateKategori);
router.delete('/kategori/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.deleteKategori);

// ===== BRAND ROUTES =====
router.get('/brand', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), MasterDataController.getAllBrand);
router.post('/brand', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.createBrand);
router.put('/brand/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.updateBrand);
router.delete('/brand/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.deleteBrand);

// ===== SUPPLIER ROUTES =====
router.get('/supplier', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), MasterDataController.getAllSupplier);
router.get('/supplier/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), MasterDataController.getSupplierById);
router.post('/supplier', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.createSupplier);
router.put('/supplier/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.updateSupplier);
router.delete('/supplier/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), MasterDataController.deleteSupplier);

// ===== PRODUK ROUTES =====
router.get('/produk', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukInventarisController.getAllProduk);
router.get('/produk/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukInventarisController.getProdukById);
router.post('/produk', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukInventarisController.createProduk);
router.put('/produk/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukInventarisController.updateProduk);
router.delete('/produk/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukInventarisController.deleteProduk);

// ===== INVENTARIS ROUTES =====
router.get('/inventaris', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), requireStoreWhenNeeded, ProdukInventarisController.getInventarisByToko);
router.post('/inventaris', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), requireStoreWhenNeeded, ProdukInventarisController.upsertInventaris);
router.put('/inventaris/:productId/stok', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), requireStoreWhenNeeded, ProdukInventarisController.updateStok);
router.delete('/inventaris/:productId', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), requireStoreWhenNeeded, ProdukInventarisController.deleteInventaris);

export default router;
