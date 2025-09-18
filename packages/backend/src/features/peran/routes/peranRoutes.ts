import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { PeranController } from '../controllers/PeranController';
import { PERMISSIONS } from '@/features/auth/models/User';

// Tambahkan permission baru untuk manajemen peran jika belum ada di sistem (sementara gunakan SETTINGS_UPDATE / USER_* )
// Untuk ketepatan, definisikan permission khusus role management jika diperlukan nanti.

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.USER_READ), PeranController.list);
router.get('/:id', requirePermission(PERMISSIONS.USER_READ), PeranController.get);
router.post('/', requirePermission(PERMISSIONS.USER_CREATE), PeranController.create);
router.put('/:id', requirePermission(PERMISSIONS.USER_UPDATE), PeranController.update);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), PeranController.delete);

export default router;
