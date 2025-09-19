

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { BackupController } from '../controllers/BackupController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/jobs',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.searchBackupJobs
);

router.get('/jobs/running',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.getRunningBackups
);

router.get('/jobs/stats',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.getBackupStats
);

router.get('/jobs/:id',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.findBackupJobById
);

router.post('/jobs',
  requirePermission(PERMISSIONS.BACKUP_CREATE),
  BackupController.createBackupJob
);

router.put('/jobs/:id',
  requirePermission(PERMISSIONS.BACKUP_UPDATE),
  BackupController.updateBackupJob
);

router.post('/jobs/:id/execute',
  requirePermission(PERMISSIONS.BACKUP_CREATE),
  BackupController.executeBackup
);

router.get('/jobs/:id/download',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.downloadBackup
);

router.post('/export',
  requirePermission(PERMISSIONS.BACKUP_CREATE),
  BackupController.createExport
);

router.get('/database/tables',
  requirePermission(PERMISSIONS.BACKUP_READ),
  BackupController.getDatabaseTables
);

router.post('/cleanup-expired',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  BackupController.cleanupExpiredBackups
);

router.get('/system/status',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  BackupController.getSystemBackupStatus
);

export default router;