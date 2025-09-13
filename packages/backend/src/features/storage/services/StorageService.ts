import crypto from 'crypto'
import path from 'path'
import type { CreateUploadDTO, UploadTarget } from '../models/FileUpload'
import { putObject, getPresignedGetUrl, removeObject } from '@/core/storage/minioClient'

function generateObjectKey(originalName: string, target: UploadTarget): string {
  const ext = path.extname(originalName).toLowerCase()
  const id = crypto.randomUUID()
  const prefix = target === 'produk' ? 'produk' : target === 'dokumen' ? 'dokumen' : 'umum'
  return `${prefix}/${id}${ext}`
}

export class StorageService {
  static async uploadFile(
    file: Express.Multer.File,
    dto: CreateUploadDTO
  ): Promise<{ key: string }> {
    const objectKey = generateObjectKey(file.originalname, dto.target)
    const meta = {
      'Content-Type': file.mimetype,
      'X-Original-Name': encodeURIComponent(file.originalname),
    }
    await putObject(objectKey, file.buffer, meta)
    return { key: objectKey }
  }

  static async getFileUrl(key: string): Promise<string> {
    return getPresignedGetUrl(key)
  }

  static async deleteFile(key: string): Promise<void> {
    // Basic key safety: disallow parent traversals
    if (key.includes('..')) throw new Error('Key tidak valid')
    await removeObject(key)
  }
}
