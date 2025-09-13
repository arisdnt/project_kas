import { Router } from 'express'
import { MonitoringController } from '../controllers/MonitoringController'

const router = Router()

// Health check endpoints
router.get('/health', MonitoringController.getHealthCheck)
router.get('/health/detailed', MonitoringController.getDetailedHealth)

// System status endpoints
router.get('/system/status', MonitoringController.getSystemStatus)

export default router