/**
 * Supplier Routes
 * Routes for supplier management operations
 */

import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Apply access scope to all routes
router.use(attachAccessScope);

// Search and retrieval routes
router.get('/search', SupplierController.searchSuppliers);
router.get('/active', SupplierController.getActiveSuppliers);
router.get('/performance/report', SupplierController.getPerformanceReport);
router.get('/performance/top', SupplierController.getTopSuppliers);
router.get('/attention', SupplierController.getSuppliersNeedingAttention);

// Individual supplier routes
router.get('/:id', SupplierController.findSupplierById);
router.get('/:id/profile', SupplierController.getSupplierWithFullProfile);
router.get('/:id/stats', SupplierController.getSupplierStats);
router.get('/:id/history', SupplierController.getPurchaseHistory);
router.get('/:id/products', SupplierController.getSupplierProducts);
router.get('/:id/contacts', SupplierController.getContactLogs);
router.get('/:id/payment-terms', SupplierController.getPaymentTerms);

// Creation and modification routes
router.post('/', SupplierController.createSupplier);
router.put('/:id', SupplierController.updateSupplier);
router.delete('/:id', SupplierController.deleteSupplier);

// Bulk operations
router.post('/bulk', SupplierController.bulkSupplierAction);
router.post('/import', SupplierController.importSuppliers);

// Supplier management operations
router.post('/:id/rate', SupplierController.rateSupplier);
router.post('/:id/follow-up', SupplierController.scheduleFollowUp);
router.post('/payment-terms', SupplierController.createPaymentTerms);
router.post('/contact-log', SupplierController.logContact);

export default router;