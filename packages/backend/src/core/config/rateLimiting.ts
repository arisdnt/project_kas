/**
 * Konfigurasi Rate Limiting untuk API
 * Mengatur batas maksimal request per menit untuk mencegah spam dan abuse
 */

export interface RateLimitConfig {
  windowMs: number // Durasi window dalam milidetik
  max: number // Maksimal request per window
  message: string | object // Pesan error ketika limit terlampaui
  standardHeaders: boolean // Mengirim rate limit info di headers
  legacyHeaders: boolean // Kompatibilitas dengan headers lama
  skipSuccessfulRequests: boolean // Skip counting untuk request sukses
  skipFailedRequests: boolean // Skip counting untuk request gagal
}

/**
 * Konfigurasi default untuk rate limiting
 * 100 request per menit untuk endpoint umum
 */
export const defaultRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 menit
  max: 100, // 100 request per menit
  message: {
    error: 'Too Many Requests',
    message: 'Terlalu banyak request dari IP ini, coba lagi dalam 1 menit',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
}

/**
 * Konfigurasi rate limiting untuk endpoint autentikasi
 * Lebih ketat untuk mencegah brute force attack
 */
export const authRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // 5 percobaan login per 15 menit
  message: {
    error: 'Too Many Login Attempts',
    message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Tidak hitung login sukses
  skipFailedRequests: false
}

/**
 * Konfigurasi rate limiting untuk upload file
 * Lebih longgar karena upload membutuhkan waktu
 */
export const uploadRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 menit
  max: 10, // 10 upload per menit
  message: {
    error: 'Upload Rate Limit Exceeded',
    message: 'Terlalu banyak upload file, coba lagi dalam 1 menit',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: true // Tidak hitung upload gagal
}

/**
 * Konfigurasi rate limiting untuk API publik
 * Sangat ketat untuk endpoint yang tidak memerlukan autentikasi
 */
export const publicRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 menit
  max: 20, // 20 request per menit
  message: {
    error: 'Public API Rate Limit Exceeded',
    message: 'Terlalu banyak request ke API publik, coba lagi dalam 1 menit',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
}

/**
 * Konfigurasi rate limiting berdasarkan environment
 */
export const getRateLimitConfig = (env: string = 'development') => {
  const configs = {
    development: {
      ...defaultRateLimit,
      max: 1000 // Lebih longgar untuk development
    },
    production: defaultRateLimit,
    test: {
      ...defaultRateLimit,
      max: 10000 // Sangat longgar untuk testing
    }
  }
  
  return configs[env as keyof typeof configs] || defaultRateLimit
}

/**
 * Daftar IP yang dikecualikan dari rate limiting
 * Biasanya untuk internal services atau monitoring
 */
export const rateLimitWhitelist: string[] = [
  '127.0.0.1', // localhost
  '::1', // localhost IPv6
  // Tambahkan IP internal lainnya jika diperlukan
]

/**
 * Fungsi untuk mengecek apakah IP dalam whitelist
 */
export const isWhitelisted = (ip: string): boolean => {
  return rateLimitWhitelist.includes(ip)
}

/**
 * Store untuk menyimpan rate limit data
 * Menggunakan memory store untuk development, Redis untuk production
 */
export const rateLimitStore = {
  development: 'memory',
  production: 'redis',
  test: 'memory'
}

export default {
  defaultRateLimit,
  authRateLimit,
  uploadRateLimit,
  publicRateLimit,
  getRateLimitConfig,
  rateLimitWhitelist,
  isWhitelisted,
  rateLimitStore
}