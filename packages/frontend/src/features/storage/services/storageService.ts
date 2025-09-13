import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'

export type UploadTarget = 'umum' | 'produk' | 'dokumen'

const BASE = `${config.api.url}:${config.api.port}/api/files`

const authHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token
  return token ? ({ Authorization: `Bearer ${token}` } as HeadersInit) : ({} as HeadersInit)
}

export async function uploadFile(file: File, target: UploadTarget = 'umum'): Promise<{ key: string }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('target', target)

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Gagal mengunggah file')
  return { key: data.key as string }
}

export async function getFileUrl(key: string): Promise<string> {
  const res = await fetch(`${BASE}/${encodeURIComponent(key)}/url`, {
    headers: { ...authHeaders() },
  })
  const data = await res.json()
  if (!res.ok || !data?.url) throw new Error(data?.error || 'Gagal mendapatkan URL')
  return data.url as string
}

export async function deleteFile(key: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Gagal menghapus file')
}
