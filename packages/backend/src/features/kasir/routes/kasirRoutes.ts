

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

router.get('/health',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.healthCheck
);

router.get('/session',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.createSession
);

router.get('/summary',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.getSummary
);

router.get('/produk/search',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  KasirController.searchProduk
);

router.get('/produk/scan/:barcode',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  KasirController.scanBarcode
);

router.post('/cart/add',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.addItemToCart
);

router.put('/cart/:produkId',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.updateCartItem
);

router.delete('/cart/:produkId',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.removeItemFromCart
);

router.delete('/cart',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.clearCart
);

router.get('/pelanggan',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  KasirController.searchPelanggan
);

router.post('/pelanggan',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  KasirController.setPelanggan
);

router.post('/bayar',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  KasirController.prosesTransaksi
);

router.get('/transaksi/:transaksiId',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KasirController.getTransaksi
);

export default router;
