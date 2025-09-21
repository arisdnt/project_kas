import { z } from 'zod'

const StorageConfigSchema = z.object({
  enabled: z.boolean().default(false),
  endpoint: z.string().default('localhost'),
  port: z.number().int().min(1).max(65535).default(9000),
  useSsl: z.boolean().default(false),
  accessKey: z.string().default(''),
  secretKey: z.string().default(''),
  bucket: z.string().default('pos-files'),
  region: z.string().optional(),
  presignExpirySeconds: z.number().int().min(60).max(86400).default(300),
})

export type StorageConfig = z.infer<typeof StorageConfigSchema>

const defaultConfig: StorageConfig = {
  enabled: process.env.MINIO_ENABLED === 'true',
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9001', 10),
  useSsl: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
  bucket: process.env.MINIO_BUCKET || 'pos-files',
  region: process.env.MINIO_REGION,
  presignExpirySeconds: parseInt(process.env.MINIO_PRESIGN_EXPIRY || '300', 10),
}

export const storageConfig = StorageConfigSchema.parse(defaultConfig)
export { StorageConfigSchema }

