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
import inventarisRoutes from '@/features/inventaris/routes/inventarisRoutes';
import penjualanRoutes from '@/features/penjualan/routes/penjualanRoutes';
import pelangganRoutes from '@/features/pelanggan/routes/pelangganRoutes';
import promoRoutes from '@/features/promo/routes/promoRoutes';
import monitoringRoutes from '@/features/monitoring/routes/monitoringRoutes';
import { MonitoringService } from '@/features/monitoring/services/MonitoringService';
import filesRoutes from '@/features/storage/routes/filesRoutes';
import { dokumenRoutes } from '@/features/storage/routes/dokumenRoutes';
import keuanganRoutes from '@/features/keuangan/routes/keuanganRoutes';
import { fileTypesRoutes } from '@/features/storage/routes/fileTypesRoutes';
import { stokOpnameRoutes } from '@/features/stok-opname/routes/stokOpnameRoutes';
import profileRoutes from '@/features/profile/routes/profileRoutes';
import penggunaRoutes from '@/features/pengguna/routes/penggunaRoutes';
import { ensureBucket } from '@/core/storage/minioClient';

// Initialize monitoring service
const monitoringService = new MonitoringService(io);

// API Routes dengan rate limiting khusus
app.use('/api/auth', authRateLimiter as any, authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/inventaris', inventarisRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/stok-opname', stokOpnameRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/files', uploadRateLimiter as any, filesRoutes);
app.use('/api/dokumen', uploadRateLimiter as any, dokumenRoutes);
app.use('/api/file-types', fileTypesRoutes);
app.use('/api/laporan/keuangan', keuanganRoutes);

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  // Handle monitoring socket connections
  monitoringService.handleSocketConnection(socket);
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
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
  monitoringService.stopMonitoring();
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  monitoringService.stopMonitoring();
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
    
    // Ensure object storage bucket (non-fatal if fails)
    try {
      await ensureBucket()
    } catch (e) {
      logger.warn({ e }, 'Skipping MinIO bucket ensure due to error')
    }

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
