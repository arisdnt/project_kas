import { Request, Response, NextFunction } from 'express';
import { logger } from '@/core/utils/logger';

/**
 * Interface untuk extended Request dengan informasi Electron
 */
interface ElectronRequest extends Request {
  isElectron?: boolean;
  electronVersion?: string;
  platform?: string;
}

/**
 * Middleware untuk mendeteksi apakah request berasal dari Electron
 * Menambahkan informasi Electron ke request object untuk digunakan di handler lain
 */
export const electronDetectionMiddleware = (
  req: ElectronRequest, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    // Deteksi berdasarkan User-Agent header
    const userAgent = req.get('User-Agent') || '';
    const isElectronUA = userAgent.includes('Electron');
    
    // Deteksi berdasarkan custom header yang dikirim dari Electron
    const electronHeader = req.get('X-Electron-App');
    const isElectronHeader = electronHeader === 'kasir-pos';
    
    // Deteksi berdasarkan origin untuk development mode
    const origin = req.get('Origin') || '';
    const isElectronOrigin = origin.includes('localhost') && 
                            (origin.includes('3002') || origin.includes('3000'));
    
    // Set flag Electron
    req.isElectron = isElectronUA || isElectronHeader;
    
    // Extract Electron version jika ada
    if (isElectronUA) {
      const electronVersionMatch = userAgent.match(/Electron\/(\d+\.\d+\.\d+)/);
      req.electronVersion = electronVersionMatch ? electronVersionMatch[1] : 'unknown';
    }
    
    // Extract platform information
    req.platform = req.get('X-Platform') || process.platform;
    
    // Log informasi Electron untuk debugging
    if (req.isElectron) {
      logger.info({
        electronVersion: req.electronVersion,
        platform: req.platform,
        userAgent: userAgent,
        origin: origin,
        path: req.path
      }, 'Request dari Electron terdeteksi');
    }
    
    next();
  } catch (error) {
    logger.error('Error dalam electron detection middleware:', error);
    next();
  }
};

/**
 * Middleware untuk menyesuaikan response headers untuk Electron
 * Menambahkan headers khusus yang diperlukan untuk aplikasi desktop
 */
export const electronResponseMiddleware = (
  req: ElectronRequest, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    if (req.isElectron) {
      // Set headers khusus untuk Electron
      res.setHeader('X-Electron-Compatible', 'true');
      res.setHeader('X-App-Mode', 'desktop');
      
      // Disable caching untuk development mode
      if (process.env.NODE_ENV === 'development') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      
      // Set CSP headers yang lebih permisif untuk Electron
      res.setHeader('Content-Security-Policy', 
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "connect-src 'self' ws: wss: http: https:; " +
        "img-src 'self' data: blob: http: https:; " +
        "media-src 'self' data: blob:;"
      );
    }
    
    next();
  } catch (error) {
    logger.error('Error dalam electron response middleware:', error);
    next();
  }
};

/**
 * Helper function untuk mengecek apakah request berasal dari Electron
 */
export const isElectronRequest = (req: ElectronRequest): boolean => {
  return req.isElectron === true;
};

/**
 * Helper function untuk mendapatkan informasi Electron dari request
 */
export const getElectronInfo = (req: ElectronRequest) => {
  return {
    isElectron: req.isElectron || false,
    version: req.electronVersion || null,
    platform: req.platform || 'unknown'
  };
};

/**
 * Middleware untuk logging khusus Electron requests
 */
export const electronLoggingMiddleware = (
  req: ElectronRequest, 
  res: Response, 
  next: NextFunction
): void => {
  if (req.isElectron) {
    const startTime = Date.now();
    
    // Override res.end untuk capture response time
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        electronVersion: req.electronVersion,
        platform: req.platform,
        userAgent: req.get('User-Agent')
      }, 'Electron Request Completed');
      
      originalEnd.call(this, chunk, encoding);
    };
  }
  
  next();
};

/**
 * Middleware untuk handle Electron-specific errors
 */
export const electronErrorMiddleware = (
  error: any,
  req: ElectronRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.isElectron) {
    logger.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      electronInfo: getElectronInfo(req),
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    }, 'Error dalam Electron request');
    
    // Return error response yang lebih user-friendly untuk Electron
    res.status(error.status || 500).json({
      error: true,
      message: error.message || 'Terjadi kesalahan pada aplikasi desktop',
      code: error.code || 'ELECTRON_ERROR',
      timestamp: new Date().toISOString(),
      electronCompatible: true
    });
  } else {
    next(error);
  }
};