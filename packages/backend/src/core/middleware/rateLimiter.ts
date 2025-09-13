/**
 * Middleware Rate Limiting untuk Express.js
 * Menggunakan express-rate-limit untuk membatasi request per IP
 */

import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'
import {
  RateLimitConfig,
  defaultRateLimit,
  authRateLimit,
  uploadRateLimit,
  publicRateLimit,
  getRateLimitConfig,
  isWhitelisted
} from '../config/rateLimiting'

/**
 * Membuat rate limiter berdasarkan konfigurasi
 */
const createRateLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    
    // Skip rate limiting untuk IP yang di-whitelist
    skip: (req: any) => {
      const clientIP = req.ip || req.connection?.remoteAddress || ''
      return isWhitelisted(clientIP)
    },
    
    // Handler ketika rate limit terlampaui
    handler: (req: any, res: any) => {
      const clientIP = req.ip || req.connection?.remoteAddress
      console.warn(`Rate limit exceeded for IP: ${clientIP} on ${req.path}`)
      
      res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: typeof config.message === 'string' 
          ? config.message 
          : (config.message as any).message,
        retryAfter: Math.ceil(config.windowMs / 1000),
        timestamp: new Date().toISOString()
      })
    },
    
    // Key generator untuk identifikasi unik per IP
    keyGenerator: (req: any) => {
      return req.ip || req.connection?.remoteAddress || 'unknown'
    }
  })
}

/**
 * Rate limiter default untuk endpoint umum
 */
export const defaultRateLimiter = createRateLimiter(
  getRateLimitConfig(process.env.NODE_ENV)
)

/**
 * Rate limiter untuk endpoint autentikasi
 * Lebih ketat untuk mencegah brute force
 */
export const authRateLimiter = createRateLimiter(authRateLimit)

/**
 * Rate limiter untuk upload file
 * Disesuaikan dengan kebutuhan upload
 */
export const uploadRateLimiter = createRateLimiter(uploadRateLimit)

/**
 * Rate limiter untuk API publik
 * Sangat ketat untuk endpoint tanpa autentikasi
 */
export const publicRateLimiter = createRateLimiter(publicRateLimit)

/**
 * Rate limiter khusus untuk endpoint tertentu
 */
export const createCustomRateLimiter = (config: Partial<RateLimitConfig>) => {
  const fullConfig = { ...defaultRateLimit, ...config }
  return createRateLimiter(fullConfig)
}

/**
 * Middleware untuk logging rate limit events
 */
export const rateLimitLogger = (req: Request, res: Response, next: any) => {
  const originalSend = res.send
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      console.log(`[RATE LIMIT] ${new Date().toISOString()} - IP: ${req.ip} - Path: ${req.path} - Method: ${req.method}`)
    }
    return originalSend.call(this, data)
  }
  
  next()
}

/**
 * Middleware untuk menambahkan headers rate limit info
 */
export const rateLimitHeaders = (req: Request, res: Response, next: any) => {
  // Headers akan ditambahkan otomatis oleh express-rate-limit
  // Middleware ini untuk customization tambahan jika diperlukan
  res.setHeader('X-RateLimit-Policy', 'Kasir API Rate Limiting')
  next()
}

/**
 * Rate limiter berdasarkan user ID (untuk user yang sudah login)
 */
export const createUserRateLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    ...config,
    keyGenerator: (req: any) => {
      // Gunakan user ID jika tersedia, fallback ke IP
      const user = req.user
      return user?.id?.toString() || req.ip || 'unknown'
    }
  })
}

/**
 * Rate limiter untuk endpoint admin
 * Lebih longgar untuk admin yang terautentikasi
 */
export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 menit
  max: 200, // 200 request per menit untuk admin
  message: {
    error: 'Admin Rate Limit Exceeded',
    message: 'Terlalu banyak request admin, coba lagi dalam 1 menit',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

export default {
  defaultRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  publicRateLimiter,
  adminRateLimiter,
  createCustomRateLimiter,
  createUserRateLimiter,
  rateLimitLogger,
  rateLimitHeaders
}