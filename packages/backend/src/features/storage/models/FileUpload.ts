import { z } from 'zod'
import { getAllowedMimeTypes, getFileCategory } from '@/core/config/fileTypes'

export const UploadTargetEnum = z.enum(['produk', 'dokumen', 'umum'])
export type UploadTarget = z.infer<typeof UploadTargetEnum>

export const CreateUploadSchema = z.object({
  target: UploadTargetEnum.default('umum'),
})

export type CreateUploadDTO = z.infer<typeof CreateUploadSchema>

/**
 * Helper functions untuk validasi file upload
 */
export const FileUploadHelpers = {
  /**
   * Mendapatkan semua MIME types yang diizinkan
   */
  getAllowedMimeTypes,
  
  /**
   * Mendapatkan kategori file berdasarkan MIME type
   */
  getFileCategory,
  
  /**
   * Validasi apakah file extension cocok dengan MIME type
   */
  validateFileExtension: (filename: string, mimeType: string): boolean => {
    const category = getFileCategory(mimeType)
    if (!category) return false
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    // Implementasi validasi extension bisa ditambahkan di sini
    return true // Sementara return true, bisa diperbaiki nanti
  }
}
