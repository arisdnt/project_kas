import { Client } from 'minio'
import type { Readable } from 'stream'
import { storageConfig } from '@/core/config/storage'
import { logger } from '@/core/utils/logger'

let client: Client | null = null

export function getMinioClient(): Client | null {
  if (!storageConfig.enabled) return null
  if (client) return client

  try {
    client = new Client({
      endPoint: storageConfig.endpoint,
      port: storageConfig.port,
      useSSL: storageConfig.useSsl,
      accessKey: storageConfig.accessKey,
      secretKey: storageConfig.secretKey,
      region: storageConfig.region,
    })
    return client
  } catch (err) {
    logger.error({ err }, 'Failed to initialize MinIO client')
    return null
  }
}

export async function ensureBucket(): Promise<boolean> {
  if (!storageConfig.enabled) {
    logger.warn('Object storage disabled; skipping bucket check')
    return false
  }
  const c = getMinioClient()
  if (!c) return false
  try {
    const exists = await c.bucketExists(storageConfig.bucket)
    if (!exists) {
      await c.makeBucket(storageConfig.bucket, storageConfig.region)
      logger.info({ bucket: storageConfig.bucket }, 'Created MinIO bucket')
    }
    return true
  } catch (err) {
    logger.error({ err }, 'Failed to ensure MinIO bucket')
    return false
  }
}

export async function putObject(
  objectName: string,
  buffer: Buffer,
  meta?: { [key: string]: string }
): Promise<void> {
  const c = getMinioClient()
  if (!c) throw new Error('Object storage not configured')
  await c.putObject(storageConfig.bucket, objectName, buffer, undefined, meta)
}

export async function getPresignedGetUrl(objectName: string): Promise<string> {
  const c = getMinioClient()
  if (!c) throw new Error('Object storage not configured')
  return c.presignedGetObject(storageConfig.bucket, objectName, storageConfig.presignExpirySeconds)
}

export async function removeObject(objectName: string): Promise<void> {
  const c = getMinioClient()
  if (!c) throw new Error('Object storage not configured')
  await c.removeObject(storageConfig.bucket, objectName)
}

export async function getObjectStream(objectName: string): Promise<{ stream: Readable; contentType?: string; size?: number; metaData?: Record<string, string> }> {
  const c = getMinioClient()
  if (!c) throw new Error('Object storage not configured')
  const stat = await c.statObject(storageConfig.bucket, objectName)
  const stream = await c.getObject(storageConfig.bucket, objectName)
  return { stream, contentType: stat?.metaData?.['content-type'], size: stat?.size, metaData: stat?.metaData as any }
}
