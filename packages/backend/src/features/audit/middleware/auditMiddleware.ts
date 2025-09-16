/**
 * Audit Middleware
 * Automatically logs user activities and system events
 */

import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';
import { AksiAudit } from '../models/AuditLogCore';
import { AuthenticatedUser } from '@/features/auth/models/User';

export function auditMiddleware(tableName: string, action?: AksiAudit) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;

    // Capture request data
    const requestData = {
      body: req.body,
      params: req.params,
      query: req.query,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Override response methods to capture response data
    res.json = function(data: any) {
      logActivity(req, res, tableName, action, requestData, data);
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      logActivity(req, res, tableName, action, requestData, data);
      return originalSend.call(this, data);
    };

    next();
  };
}

async function logActivity(
  req: Request,
  res: Response,
  tableName: string,
  specifiedAction: AksiAudit | undefined,
  requestData: any,
  responseData: any
) {
  try {
    const user = req.user as AuthenticatedUser;
    if (!user || !req.accessScope) return;

    // Determine action based on HTTP method if not specified
    const action = specifiedAction || mapHttpMethodToAction(req.method);

    // Extract record ID from params or response
    let recordId = req.params?.id;
    if (!recordId && responseData?.data?.id) {
      recordId = responseData.data.id;
    }

    // Only log successful operations (2xx status codes)
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    // Prepare audit data
    const auditData = {
      tenant_id: req.accessScope.tenantId,
      user_id: user.id,
      tabel: tableName,
      record_id: recordId,
      aksi: action,
      data_lama: action === AksiAudit.UPDATE ? requestData.body?.oldData : undefined,
      data_baru: ['CREATE', 'UPDATE'].includes(action) ? sanitizeData(requestData.body) : undefined,
      ip_address: requestData.ip,
      user_agent: requestData.userAgent
    };

    // Log asynchronously to avoid blocking response
    setImmediate(() => {
      AuditService.log(auditData).catch(error => {
        console.error('Failed to log audit entry:', error);
      });
    });

  } catch (error) {
    console.error('Audit middleware error:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

function mapHttpMethodToAction(method: string): AksiAudit {
  switch (method.toUpperCase()) {
    case 'POST':
      return AksiAudit.CREATE;
    case 'GET':
      return AksiAudit.READ;
    case 'PUT':
    case 'PATCH':
      return AksiAudit.UPDATE;
    case 'DELETE':
      return AksiAudit.DELETE;
    default:
      return AksiAudit.READ;
  }
}

function sanitizeData(data: any): any {
  if (!data) return data;

  // Remove sensitive fields
  const sensitiveFields = ['password', 'password_hash', 'token', 'refresh_token'];
  const sanitized = { ...data };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

// Specific audit middlewares for different operations
export const auditProduct = auditMiddleware('produk');
export const auditTransaction = auditMiddleware('transaksi_penjualan');
export const auditPurchase = auditMiddleware('transaksi_pembelian');
export const auditPromo = auditMiddleware('promo');
export const auditCustomer = auditMiddleware('pelanggan');
export const auditUser = auditMiddleware('users');