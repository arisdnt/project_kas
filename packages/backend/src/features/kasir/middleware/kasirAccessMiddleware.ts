import { Request, Response, NextFunction } from 'express'
import { logger } from '@/core/utils/logger'

/**
 * Middleware untuk memastikan hanya Admin Toko (level 3) dan Kasir (level 4) yang dapat mengakses modul kasir.
 */
export const requireKasirLevel = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    })
  }

  const level = typeof user.level === 'number' ? user.level : Number(user.level)

  if (level !== 3 && level !== 4) {
    logger.warn({
      userId: user.id,
      username: user.username,
      userLevel: user.level,
      method: req.method,
      url: req.originalUrl
    }, 'Kasir access denied - insufficient level')

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Modul kasir hanya dapat diakses oleh Admin Toko dan Kasir'
    })
  }

  return next()
}
