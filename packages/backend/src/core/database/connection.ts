/**
 * Database Connection Pool
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import mysql, { PoolOptions } from 'mysql2/promise';
import { databaseConfig } from '@/core/config/database';
import { logger } from '@/core/utils/logger';

// Pool options untuk mysql2
const poolOptions: PoolOptions = {
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  charset: databaseConfig.charset,
  timezone: databaseConfig.timezone,
  connectionLimit: databaseConfig.connectionLimit,
  multipleStatements: false,
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  ...(databaseConfig.ssl === true ? { ssl: {} } : {})
};

// Buat connection pool
export const pool = mysql.createPool(poolOptions);

// Test koneksi database
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}

// Helper function untuk execute query dengan error handling
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    logger.error('Query execution failed:', { query, params, error });
    throw error;
  }
}

// Helper function untuk execute single query
export async function executeQuerySingle<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  const rows = await executeQuery<T>(query, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper function untuk transaction
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Export pool untuk penggunaan langsung jika diperlukan
export default pool;