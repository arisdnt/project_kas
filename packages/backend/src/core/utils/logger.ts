/**
 * Logger Utility
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import pino from 'pino';
import { appConfig } from '@/core/config/app';

// Konfigurasi logger berdasarkan environment
const loggerConfig = {
  level: appConfig.logLevel,
  transport: appConfig.nodeEnv === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
};

// Buat instance logger
export const logger = pino(loggerConfig);

// Helper functions untuk logging dengan context
export const createContextLogger = (context: string) => {
  return logger.child({ context });
};

// Helper untuk log error dengan stack trace
export const logError = (message: string, error: any, context?: string) => {
  const logData: any = {
    message,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  };
  
  if (context) {
    logData.context = context;
  }
  
  logger.error(logData);
};

// Helper untuk log dengan tenant context
export const logWithTenant = (level: string, message: string, tenantId: number, data?: any) => {
  const logData = {
    message,
    tenantId,
    ...data
  };
  
  (logger as any)[level](logData);
};

// Export default
export default logger;