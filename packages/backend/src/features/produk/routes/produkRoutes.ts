/**
 * Routes untuk API Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { ProdukController } from '../controllers/ProdukController';
import { ProdukControllerExtended } from '../controllers/ProdukControllerExtended';
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware';
import { UserRole } from '@/features/auth/models/User';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Middleware untuk semua routes produk
router.use(authenticate);
router.use(attachAccessScope);

// ===== KATEGORI ROUTES =====
router.get('/kategori', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukController.getAllKategori);
router.post('/kategori', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.createKategori);
router.put('/kategori/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.updateKategori);
router.delete('/kategori/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.deleteKategori);

// ===== BRAND ROUTES =====
router.get('/brand', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukController.getAllBrand);
router.post('/brand', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.createBrand);
router.put('/brand/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.updateBrand);
router.delete('/brand/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.deleteBrand);

// ===== SUPPLIER ROUTES =====
router.get('/supplier', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukController.getAllSupplier);
router.get('/supplier/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukController.getSupplierById);
router.post('/supplier', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.createSupplier);
router.put('/supplier/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.updateSupplier);
router.delete('/supplier/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukController.deleteSupplier);

// ===== PRODUK ROUTES =====
router.get('/produk', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukControllerExtended.getAllProduk);
router.get('/produk/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), ProdukControllerExtended.getProdukById);
router.post('/produk', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukControllerExtended.createProduk);
router.put('/produk/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukControllerExtended.updateProduk);
router.delete('/produk/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ProdukControllerExtended.deleteProduk);

// ===== INVENTARIS ROUTES =====
router.get('/inventaris', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), requireStoreWhenNeeded, ProdukControllerExtended.getInventarisByToko);
router.post('/inventaris', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), requireStoreWhenNeeded, ProdukControllerExtended.upsertInventaris);
router.put('/inventaris/:productId/stok', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), requireStoreWhenNeeded, ProdukControllerExtended.updateStok);
router.delete('/inventaris/:productId', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), requireStoreWhenNeeded, ProdukControllerExtended.deleteInventaris);

export default router;
