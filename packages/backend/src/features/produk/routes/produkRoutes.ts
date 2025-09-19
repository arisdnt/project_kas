

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { ProdukController } from '../controllers/ProdukController';
import { ProdukInventarisController } from '../controllers/ProdukInventarisController';
import { MasterDataController } from '../controllers/MasterDataController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Product CRUD routes
router.get('/', requirePermission(PERMISSIONS.PRODUCT_READ), ProdukController.search);

router.get('/:id', requirePermission(PERMISSIONS.PRODUCT_READ), ProdukController.findById);

router.post('/', requirePermission(PERMISSIONS.PRODUCT_CREATE), ProdukController.create);

router.put('/:id', requirePermission(PERMISSIONS.PRODUCT_UPDATE), ProdukController.update);

router.delete('/:id', requirePermission(PERMISSIONS.PRODUCT_DELETE), ProdukController.delete);

// Image upload routes
router.post('/:id/upload-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  ProdukController.imageUploadMiddleware,
  ProdukController.uploadProductImage
);

router.delete('/:id/remove-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  ProdukController.removeProductImage
);

// Inventory routes - require store access
router.get('/inventory/search',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  requireStoreWhenNeeded,
  ProdukInventarisController.search
);

router.get('/inventory/low-stock',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  requireStoreWhenNeeded,
  ProdukInventarisController.getLowStockItems
);

router.get('/:produkId/inventory',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukInventarisController.getProductInventory
);

router.post('/:produkId/inventory',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  requireStoreWhenNeeded,
  ProdukInventarisController.updateStock
);

router.put('/:produkId/inventory',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  requireStoreWhenNeeded,
  ProdukInventarisController.updateStock
);

// Master data routes

router.get('/master/categories',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getCategories
);

router.post('/master/categories',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  MasterDataController.createCategory
);

router.put('/master/categories/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.updateCategory
);

router.delete('/master/categories/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  MasterDataController.deleteCategory
);

// Category image upload routes
router.post('/master/categories/:id/upload-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.imageUploadMiddleware,
  MasterDataController.uploadCategoryImage
);

router.delete('/master/categories/:id/remove-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.removeCategoryImage
);

// Brand image upload routes
router.post('/master/brands/:id/upload-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.imageUploadMiddleware,
  MasterDataController.uploadBrandImage
);

router.delete('/master/brands/:id/remove-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.removeBrandImage
);

router.get('/master/categories/:id/products',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getProductsByCategory
);

router.get('/master/brands',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getBrands
);

router.post('/master/brands',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  MasterDataController.createBrand
);

router.put('/master/brands/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.updateBrand
);

router.delete('/master/brands/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  MasterDataController.deleteBrand
);

router.get('/master/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getSuppliers
);

router.post('/master/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  MasterDataController.createSupplier
);

// Shortcut routes for compatibility

router.get('/brand',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getBrands
);

router.get('/kategori',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getCategories
);

router.get('/supplier',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getSuppliers
);

// Enhanced create routes with scope support
router.get('/categories',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukController.getCategories
);

router.post('/categories',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  ProdukController.createCategory
);

router.get('/brands',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukController.getBrands
);

router.post('/brands',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  ProdukController.createBrand
);

router.get('/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukController.getSuppliers
);

router.post('/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  ProdukController.createSupplier
);

export default router;