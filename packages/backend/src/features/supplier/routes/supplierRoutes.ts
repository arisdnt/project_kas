

import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/search', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.searchSuppliers);

router.get('/active', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getActiveSuppliers);

router.get('/performance/report', requirePermission(PERMISSIONS.REPORT_READ), SupplierController.getPerformanceReport);

router.get('/performance/top', requirePermission(PERMISSIONS.REPORT_READ), SupplierController.getTopSuppliers);

router.get('/attention', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSuppliersNeedingAttention);

router.get('/:id', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.findSupplierById);

router.get('/:id/profile', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSupplierWithFullProfile);

router.get('/:id/stats', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSupplierStats);

router.get('/:id/history', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getPurchaseHistory);

router.get('/:id/products', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSupplierProducts);

router.get('/:id/contacts', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getContactLogs);

router.get('/:id/payment-terms', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getPaymentTerms);

router.post('/', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.createSupplier);

router.put('/:id', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.updateSupplier);

router.delete('/:id', requirePermission(PERMISSIONS.PRODUCT_DELETE), SupplierController.deleteSupplier);

router.post('/bulk', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.bulkSupplierAction);

router.post('/import', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.importSuppliers);

router.post('/:id/rate', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.rateSupplier);

router.post('/:id/follow-up', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.scheduleFollowUp);

router.post('/payment-terms', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.createPaymentTerms);

router.post('/contact-log', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.logContact);

export default router;