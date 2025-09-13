import { Request, Response, type RequestHandler } from 'express'
import multer from 'multer'
import { appConfig } from '@/core/config/app'
import { storageConfig } from '@/core/config/storage'
import { 
  isAllowedMimeType, 
  getMaxFileSizeByMimeType, 
  getFileDescription,
  getFileCategory 
} from '@/core/config/fileTypes'
import { CreateUploadSchema } from '../models/FileUpload'
import { StorageService } from '../services/StorageService'
import { DokumenService } from '../services/DokumenService'
import { logger } from '@/core/utils/logger'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: appConfig.maxFileSize },
  fileFilter: (req, file, cb) => {
    // Validasi MIME type
    if (!isAllowedMimeType(file.mimetype)) {
      const category = getFileCategory(file.mimetype)
      const description = getFileDescription(file.mimetype)
      logger.warn({
        filename: file.originalname,
        mimetype: file.mimetype,
        category,
        description
      }, 'File upload rejected: unsupported file type')
      
      return cb(new Error(`Tipe file tidak diizinkan: ${file.mimetype}. File yang diupload: ${description}`))
    }

    // Validasi ukuran file berdasarkan tipe
    const maxSize = getMaxFileSizeByMimeType(file.mimetype, appConfig.maxFileSize)
    if (file.size && file.size > maxSize) {
      logger.warn({
        filename: file.originalname,
        mimetype: file.mimetype,
        fileSize: file.size,
        maxAllowedSize: maxSize
      }, 'File upload rejected: file too large')
      
      return cb(new Error(`Ukuran file terlalu besar. Maksimal ${Math.round(maxSize / 1024 / 1024)}MB untuk tipe file ini`))
    }

    logger.info({
      filename: file.originalname,
      mimetype: file.mimetype,
      category: getFileCategory(file.mimetype),
      size: file.size
    }, 'File upload accepted')
    
    cb(null, true)
  },
})

export const singleFileMiddleware: RequestHandler = upload.single('file') as unknown as RequestHandler

export class FilesController {
  static async upload(req: Request, res: Response) {
    try {
      if (!storageConfig.enabled) {
        return res.status(503).json({ error: 'Object storage belum dikonfigurasi' })
      }
      if (!req.file) {
        return res.status(400).json({ error: 'File tidak ditemukan pada field "file"' })
      }
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const parsed = CreateUploadSchema.parse(req.body)
      
      // Upload file to storage
      const result = await StorageService.uploadFile(req.file, parsed)
      
      // Save metadata to database
      const dokumen = await DokumenService.createDokumen(
        req.user.id,
        req.user.tenantId,
        {
          status: 'aktif',
          kunci_objek: result.key,
          nama_file_asli: req.file.originalname,
          ukuran_file: req.file.size,
          tipe_mime: req.file.mimetype,
          kategori: parsed.target
        }
      )
      
      return res.status(201).json({
        success: true,
        message: 'File berhasil diunggah',
        data: {
          id: dokumen.id,
          key: result.key,
          nama_file: req.file.originalname,
          ukuran: req.file.size,
          kategori: parsed.target
        }
      })
    } catch (error: any) {
      logger.error({ error }, 'Upload failed')
      const message = error?.name === 'ZodError' ? 'Input tidak valid' : error?.message || 'Gagal mengunggah file'
      return res.status(400).json({ error: message })
    }
  }

  static async resolve(req: Request, res: Response) {
    try {
      if (!storageConfig.enabled) {
        return res.status(503).json({ error: 'Object storage belum dikonfigurasi' })
      }
      const key = req.params.key
      if (!key) {
        return res.status(400).json({ error: 'Key tidak disediakan' })
      }
      const url = await StorageService.getFileUrl(key)
      // Redirect agar browser mengambil langsung dari MinIO
      return res.redirect(302, url)
    } catch (error) {
      logger.error({ error }, 'Resolve file URL failed')
      return res.status(404).json({ error: 'File tidak ditemukan atau tidak dapat diakses' })
    }
  }

  static async getUrl(req: Request, res: Response) {
    try {
      if (!storageConfig.enabled) {
        return res.status(503).json({ error: 'Object storage belum dikonfigurasi' })
      }
      const key = req.params.key
      if (!key) {
        return res.status(400).json({ error: 'Key tidak disediakan' })
      }
      const url = await StorageService.getFileUrl(key)
      return res.status(200).json({ url })
    } catch (error) {
      logger.error({ error }, 'Get file URL failed')
      return res.status(404).json({ error: 'File tidak ditemukan atau tidak dapat diakses' })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!storageConfig.enabled) {
        return res.status(503).json({ error: 'Object storage belum dikonfigurasi' })
      }
      const key = req.params.key
      if (!key) {
        return res.status(400).json({ error: 'Key tidak disediakan' })
      }
      // Decode in case it comes URL-encoded
      const decoded = decodeURIComponent(key)
      await StorageService.deleteFile(decoded)
      return res.status(200).json({ message: 'File berhasil dihapus', key: decoded })
    } catch (error: any) {
      logger.error({ error }, 'Delete file failed')
      const msg = error?.code === 'NoSuchKey' ? 'File tidak ditemukan' : error?.message || 'Gagal menghapus file'
      const code = msg === 'File tidak ditemukan' ? 404 : 400
      return res.status(code).json({ error: msg })
    }
  }
}
