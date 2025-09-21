/**
 * Konfigurasi Database Type-Safe
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod';

// Schema validasi untuk konfigurasi database
const DatabaseConfigSchema = z.object({
  host: z.string().min(1, 'Database host is required'),
  port: z.number().int().min(1).max(65535),
  user: z.string().min(1, 'Database user is required'),
  password: z.string().min(1, 'Database password is required'),
  database: z.string().min(1, 'Database name is required'),
  charset: z.string().default('utf8mb4'),
  timezone: z.string().default('+00:00'),
  connectionLimit: z.number().int().min(1).default(10),
  acquireTimeout: z.number().int().min(1000).default(60000),
  timeout: z.number().int().min(1000).default(60000),
  reconnect: z.boolean().default(true),
  ssl: z.union([z.boolean(), z.object({}).passthrough()]).default(false)
});

// Type inference dari schema
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// Konfigurasi database default
const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'arka',
  password: process.env.DB_PASSWORD || 'arka123',
  database: process.env.DB_NAME || 'kasir',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
  timeout: parseInt(process.env.DB_TIMEOUT || '60000', 10),
  reconnect: true,
  ssl: process.env.DB_SSL === 'true'
};

// Validasi dan ekspor konfigurasi
export const databaseConfig = DatabaseConfigSchema.parse(defaultConfig);

// Pool options untuk mysql2
export const poolOptions = {
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  charset: databaseConfig.charset,
  timezone: databaseConfig.timezone,
  connectionLimit: databaseConfig.connectionLimit,
  acquireTimeout: databaseConfig.acquireTimeout,
  timeout: databaseConfig.timeout,
  reconnect: databaseConfig.reconnect,
  ssl: databaseConfig.ssl === true ? {} : databaseConfig.ssl || false,
  multipleStatements: false,
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true
};

// Export untuk testing
export { DatabaseConfigSchema };