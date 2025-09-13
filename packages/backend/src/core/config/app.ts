/**
 * Konfigurasi Aplikasi Type-Safe
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod';

// Schema validasi untuk konfigurasi aplikasi
const AppConfigSchema = z.object({
  // Server Configuration
  port: z.number().int().min(1).max(65535).default(3000),
  host: z.string().default('localhost'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  
  // JWT Configuration
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  jwtExpiresIn: z.string().default('24h'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  
  // CORS Configuration
  corsOrigin: z.union([z.string(), z.array(z.string())]).default('*'),
  corsCredentials: z.boolean().default(true),
  
  // Rate Limiting
  rateLimitWindowMs: z.number().int().min(1000).default(900000), // 15 minutes
  rateLimitMax: z.number().int().min(1).default(100),
  
  // File Upload
  maxFileSize: z.number().int().min(1024).default(5242880), // 5MB
  uploadPath: z.string().default('./uploads'),
  
  // Logging
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  logFormat: z.enum(['json', 'simple']).default('simple'),
  
  // Socket.IO Configuration
  socketCorsOrigin: z.union([z.string(), z.array(z.string())]).default('*'),
  socketPath: z.string().default('/socket.io'),
  
  // Timezone
  timezone: z.string().default('Asia/Jakarta'),
  
  // Printer Configuration
  printerEnabled: z.boolean().default(false),
  printerInterface: z.enum(['usb', 'network', 'serial']).default('usb'),
  printerVendorId: z.string().optional(),
  printerProductId: z.string().optional(),
  
  // Barcode Scanner Configuration
  scannerEnabled: z.boolean().default(false),
  scannerInterface: z.enum(['usb', 'serial']).default('usb'),
  scannerVendorId: z.string().optional(),
  scannerProductId: z.string().optional()
});

// Type inference dari schema
export type AppConfig = z.infer<typeof AppConfigSchema>;

// Konfigurasi aplikasi default
const defaultConfig: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  
  jwtSecret: process.env.JWT_SECRET || 'kasir-pos-jwt-secret-key-very-long-and-secure-string-2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  corsOrigin: process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.includes(',') ? 
      process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
      process.env.CORS_ORIGIN 
    : '*',
  corsCredentials: process.env.CORS_CREDENTIALS !== 'false',
  
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  logLevel: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
  logFormat: (process.env.LOG_FORMAT as 'json' | 'simple') || 'simple',
  
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN ? 
    process.env.SOCKET_CORS_ORIGIN.includes(',') ? 
      process.env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
      process.env.SOCKET_CORS_ORIGIN 
    : '*',
  socketPath: process.env.SOCKET_PATH || '/socket.io',
  
  timezone: process.env.TZ || 'Asia/Jakarta',
  
  printerEnabled: process.env.PRINTER_ENABLED === 'true',
  printerInterface: (process.env.PRINTER_INTERFACE as 'usb' | 'network' | 'serial') || 'usb',
  printerVendorId: process.env.PRINTER_VENDOR_ID,
  printerProductId: process.env.PRINTER_PRODUCT_ID,
  
  scannerEnabled: process.env.SCANNER_ENABLED === 'true',
  scannerInterface: (process.env.SCANNER_INTERFACE as 'usb' | 'serial') || 'usb',
  scannerVendorId: process.env.SCANNER_VENDOR_ID,
  scannerProductId: process.env.SCANNER_PRODUCT_ID
};

// Validasi dan ekspor konfigurasi
export const appConfig = AppConfigSchema.parse(defaultConfig);

// Helper functions
export const isDevelopment = () => appConfig.nodeEnv === 'development';
export const isProduction = () => appConfig.nodeEnv === 'production';
export const isTest = () => appConfig.nodeEnv === 'test';

// Export untuk testing
export { AppConfigSchema };
