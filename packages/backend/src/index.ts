/**
 * Entry Point Backend API
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { registerSwagger } from '@/config/swagger/registerSwagger';
import { appConfig } from '@/core/config/app';
import {
  defaultRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  rateLimitLogger,
  rateLimitHeaders
} from '@/core/middleware/rateLimiter';
import { testConnection, closeConnection } from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { attachAccessScope } from '@/core/middleware/accessScope';

// Buat Express app
const app = express();
const server = createServer(app);

// Konfigurasi Socket.IO
const io = new Server(server, {
  cors: {
    origin: appConfig.socketCorsOrigin,
    credentials: true
  },
  path: appConfig.socketPath
});

// Middleware keamanan
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: appConfig.corsCredentials
}));

// Rate limiting middleware
app.use(rateLimitLogger as any);
app.use(rateLimitHeaders as any);
app.use(defaultRateLimiter as any);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, 'HTTP Request');
  next();
});

// Centralized access scope middleware (sets req.accessScope when authenticated)
app.use(attachAccessScope);

// Health check endpoint (basic)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv,
    version: '1.0.0'
  });
});

// Extended health status endpoint
app.get('/health/status', async (req, res) => {
  const startedAt = process.uptime();
  const uptimeSeconds = Math.floor(startedAt);
  // Database status
  let dbConnected = false;
  try {
    dbConnected = await testConnection();
  } catch (e) {
    dbConnected = false;
  }

  // Socket.IO basic server status
  const socketInfo = {
    path: appConfig.socketPath,
    clients: (io as any)?.engine?.clientsCount ?? 0
  };

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv,
    version: '1.0.0',
    uptimeSeconds,
    db: { connected: dbConnected },
    socket: socketInfo
  });
});

// Import routes
import authRoutes from '@/features/auth/routes/authRoutes';
import produkRoutes from '@/features/produk/routes/produkRoutes';
import penjualanRoutes from '@/features/penjualan/routes/penjualanRoutes';
import pelangganRoutes from '@/features/pelanggan/routes/pelangganRoutes';
import promoRoutes from '@/features/promo/routes/promoRoutes';
import dokumenRoutes from '@/features/dokumen/routes/dokumenRoutes';
import profileRoutes from '@/features/profile/routes/profileRoutes';
import dashboardRoutes from '@/features/dashboard/routes/dashboardRoutes';
import supplierRoutes from '@/features/supplier/routes/supplierRoutes';
import tokoRoutes from '@/features/toko/routes/tokoRoutes';
import pembelianRoutes from '@/features/pembelian/routes/pembelianRoutes';
import returRoutes from '@/features/retur/routes/returRoutes';
import tenantRoutes from '@/features/tenant/routes/tenantRoutes';
import auditRoutes from '@/features/audit/routes/auditRoutes';
import backupRoutes from '@/features/backup/routes/backupRoutes';
import konfigurasiRoutes from '@/features/konfigurasi/routes/konfigurasiRoutes';
import notifikasiRoutes from '@/features/notifikasi/routes/notifikasiRoutes';
import sessionRoutes from '@/features/session/routes/sessionRoutes';
import webhookRoutes from '@/features/webhook/routes/webhookRoutes';
import detailUserRoutes from '@/features/profilsaya/routes/profilsayaRoutes';
import pengaturansayaRoutes from '@/features/pengaturansaya/routes/userRoutes';
import tenantsayaRoutes from '@/features/tenantsaya/routes/tenantRoutes';
import tokoSayaRoutes from '@/features/tokosaya/routes/tokoRoutes';
import kasirRoutes from '@/features/kasir/routes/kasirRoutes';
import { KasirController } from '@/features/kasir/controllers/KasirController';
import { KasirSocketService } from '@/features/kasir/services/KasirSocketService';

// Inisialisasi Swagger UI + JSON endpoints
registerSwagger(app);

// API Routes
app.use('/api/auth', authRateLimiter as any, authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dokumen', uploadRateLimiter as any, dokumenRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/toko', tokoRoutes);
app.use('/api/pembelian', pembelianRoutes);
app.use('/api/retur', returRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/konfigurasi', konfigurasiRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/profilsaya', detailUserRoutes);
app.use('/api/pengaturansaya', pengaturansayaRoutes);
app.use('/api/tenantsaya', tenantsayaRoutes);
app.use('/api/tokosaya', tokoSayaRoutes);
app.use('/api/kasir', kasirRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Sistem POS API',
    version: '1.0.0',
    environment: appConfig.nodeEnv
  });
});

// Serve frontend build (SPA) for dashboard routes
// Note: This expects the frontend to be built into packages/frontend/dist
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Serve index.html for SPA routes (non-API)
app.get(['/dashboard', '/dashboard/*', '/'], (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Initialize Kasir Socket Service untuk real-time features
KasirSocketService.initialize(io);

// Set Socket.IO instance di KasirController untuk real-time events
KasirController.setSocketIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Basic socket events
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Join tenant room untuk tenant-wide notifications
  socket.on('join_tenant', (data: { tenant_id: string }) => {
    const tenantRoom = `tenant_${data.tenant_id}`;
    socket.join(tenantRoom);
    logger.info(`Socket ${socket.id} joined tenant room: ${tenantRoom}`);
  });

  // Leave tenant room
  socket.on('leave_tenant', (data: { tenant_id: string }) => {
    const tenantRoom = `tenant_${data.tenant_id}`;
    socket.leave(tenantRoom);
    logger.info(`Socket ${socket.id} left tenant room: ${tenantRoom}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip
    }
  }, 'Unhandled Error');
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: appConfig.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await closeConnection();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }
    
    // Note: Object storage bucket setup removed (not implemented yet)

    // Start HTTP server
    server.listen(appConfig.port, appConfig.host, () => {
      logger.info({
        port: appConfig.port,
        host: appConfig.host,
        environment: appConfig.nodeEnv
      }, 'Server started successfully');
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

// Export untuk testing
export { app, server, io };
