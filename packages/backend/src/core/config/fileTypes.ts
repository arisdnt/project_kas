/**
 * Konfigurasi tipe file yang diizinkan untuk upload
 * Dapat dikustomisasi berdasarkan kebutuhan aplikasi
 */

export interface FileTypeConfig {
  mimeType: string
  extensions: string[]
  maxSize?: number // dalam bytes, opsional untuk override global maxSize
  description: string
}

export interface FileTypesConfig {
  images: FileTypeConfig[]
  documents: FileTypeConfig[]
  archives: FileTypeConfig[]
  videos: FileTypeConfig[]
  audio: FileTypeConfig[]
}

/**
 * Konfigurasi default untuk tipe file yang diizinkan
 */
export const fileTypesConfig: FileTypesConfig = {
  images: [
    {
      mimeType: 'image/jpeg',
      extensions: ['.jpg', '.jpeg'],
      maxSize: 5 * 1024 * 1024, // 5MB
      description: 'JPEG Image'
    },
    {
      mimeType: 'image/png',
      extensions: ['.png'],
      maxSize: 5 * 1024 * 1024, // 5MB
      description: 'PNG Image'
    },
    {
      mimeType: 'image/webp',
      extensions: ['.webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      description: 'WebP Image'
    },
    {
      mimeType: 'image/gif',
      extensions: ['.gif'],
      maxSize: 10 * 1024 * 1024, // 10MB untuk GIF animasi
      description: 'GIF Image'
    },
    {
      mimeType: 'image/svg+xml',
      extensions: ['.svg'],
      maxSize: 1 * 1024 * 1024, // 1MB
      description: 'SVG Vector Image'
    }
  ],
  documents: [
    {
      mimeType: 'application/pdf',
      extensions: ['.pdf'],
      maxSize: 20 * 1024 * 1024, // 20MB
      description: 'PDF Document'
    },
    {
      mimeType: 'application/msword',
      extensions: ['.doc'],
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Microsoft Word Document (Legacy)'
    },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extensions: ['.docx'],
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Microsoft Word Document'
    },
    {
      mimeType: 'application/vnd.ms-excel',
      extensions: ['.xls'],
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Microsoft Excel Spreadsheet (Legacy)'
    },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extensions: ['.xlsx'],
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Microsoft Excel Spreadsheet'
    },
    {
      mimeType: 'text/plain',
      extensions: ['.txt'],
      maxSize: 1 * 1024 * 1024, // 1MB
      description: 'Plain Text File'
    },
    {
      mimeType: 'text/csv',
      extensions: ['.csv'],
      maxSize: 5 * 1024 * 1024, // 5MB
      description: 'CSV File'
    }
  ],
  archives: [
    {
      mimeType: 'application/zip',
      extensions: ['.zip'],
      maxSize: 50 * 1024 * 1024, // 50MB
      description: 'ZIP Archive'
    },
    {
      mimeType: 'application/x-rar-compressed',
      extensions: ['.rar'],
      maxSize: 50 * 1024 * 1024, // 50MB
      description: 'RAR Archive'
    }
  ],
  videos: [
    {
      mimeType: 'video/mp4',
      extensions: ['.mp4'],
      maxSize: 100 * 1024 * 1024, // 100MB
      description: 'MP4 Video'
    },
    {
      mimeType: 'video/webm',
      extensions: ['.webm'],
      maxSize: 100 * 1024 * 1024, // 100MB
      description: 'WebM Video'
    }
  ],
  audio: [
    {
      mimeType: 'audio/mpeg',
      extensions: ['.mp3'],
      maxSize: 20 * 1024 * 1024, // 20MB
      description: 'MP3 Audio'
    },
    {
      mimeType: 'audio/wav',
      extensions: ['.wav'],
      maxSize: 50 * 1024 * 1024, // 50MB
      description: 'WAV Audio'
    }
  ]
}

/**
 * Mendapatkan semua MIME types yang diizinkan
 */
export function getAllowedMimeTypes(): string[] {
  const allTypes: string[] = []
  
  Object.values(fileTypesConfig).forEach((category: FileTypeConfig[]) => {
    category.forEach((config: FileTypeConfig) => {
      allTypes.push(config.mimeType)
    })
  })
  
  return allTypes
}

/**
 * Mendapatkan konfigurasi file berdasarkan MIME type
 */
export function getFileConfigByMimeType(mimeType: string): FileTypeConfig | null {
  for (const category of Object.values(fileTypesConfig)) {
    const config = category.find((c: FileTypeConfig) => c.mimeType === mimeType)
    if (config) return config
  }
  return null
}

/**
 * Mendapatkan ukuran maksimum file berdasarkan MIME type
 */
export function getMaxFileSizeByMimeType(mimeType: string, defaultMaxSize: number): number {
  const config = getFileConfigByMimeType(mimeType)
  return config?.maxSize || defaultMaxSize
}

/**
 * Validasi apakah MIME type diizinkan
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return getAllowedMimeTypes().includes(mimeType)
}

/**
 * Mendapatkan deskripsi file berdasarkan MIME type
 */
export function getFileDescription(mimeType: string): string {
  const config = getFileConfigByMimeType(mimeType)
  return config?.description || 'Unknown file type'
}

/**
 * Mendapatkan kategori file berdasarkan MIME type
 */
export function getFileCategory(mimeType: string): string | null {
  for (const [category, configs] of Object.entries(fileTypesConfig)) {
    if (configs.some((c: FileTypeConfig) => c.mimeType === mimeType)) {
      return category
    }
  }
  return null
}