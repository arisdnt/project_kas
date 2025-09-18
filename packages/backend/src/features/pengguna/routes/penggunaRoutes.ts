import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { PenggunaController } from '../controllers/PenggunaController';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.USER_READ), PenggunaController.list);
router.get('/tenants', requirePermission(PERMISSIONS.USER_READ), PenggunaController.getTenants);
router.get('/stores/:tenantId', requirePermission(PERMISSIONS.USER_READ), PenggunaController.getStoresByTenant);
router.get('/roles', requirePermission(PERMISSIONS.USER_READ), PenggunaController.getRoles);
router.get('/:id', requirePermission(PERMISSIONS.USER_READ), PenggunaController.get);
router.post('/', requirePermission(PERMISSIONS.USER_CREATE), PenggunaController.create);
router.put('/:id', requirePermission(PERMISSIONS.USER_UPDATE), PenggunaController.update);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), PenggunaController.delete);

export default router;
