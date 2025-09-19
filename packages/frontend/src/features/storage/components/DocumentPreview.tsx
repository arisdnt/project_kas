import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '@/core/store/authStore'

type Props = {
  name: string
  mimeType: string
  url: string
}

function inferType(mime: string):
  | 'image'
  | 'pdf'
  | 'text'
  | 'csv'
  | 'audio'
  | 'video'
  | 'office'
  | 'archive'
  | 'unknown' {
  console.log('Inferring type for MIME:', mime)

  if (mime.startsWith('image/')) return 'image'
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'text/plain') return 'text'
  if (mime === 'text/csv') return 'csv'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('video/')) return 'video'
  if (
    [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ].includes(mime)
  )
    return 'office'
  if (['application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip'].includes(mime)) return 'archive'

  // Fallback to unknown but log it
  console.warn('Unknown MIME type:', mime)
  return 'unknown'
}

function getExt(name: string): string {
  const p = name.split('.')
  return p.length > 1 ? p[p.length - 1].toLowerCase() : ''
}

// Function to fix MIME type based on filename
function fixMimeType(mimeType: string, filename: string): string {
  // If MIME type is application/octet-stream, try to infer from filename
  if (mimeType === 'application/octet-stream') {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'zip': 'application/zip'
    }
    return mimeTypeMap[ext || ''] || mimeType
  }
  return mimeType
}

export const DocumentPreview: React.FC<Props> = ({ name, mimeType, url }) => {
  // Fix MIME type if it's generic octet-stream
  const correctedMimeType = fixMimeType(mimeType, name)
  const kind = useMemo(() => inferType(correctedMimeType), [correctedMimeType])
  const token = useAuthStore.getState().token

  // Debug logging
  console.log('DocumentPreview:', {
    name,
    originalMimeType: mimeType,
    correctedMimeType,
    url,
    kind
  })

  const [textContent, setTextContent] = useState<string>('')
  const [textError, setTextError] = useState<string | null>(null)

  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [binaryError, setBinaryError] = useState<string | null>(null)

  const docxContainerRef = useRef<HTMLDivElement | null>(null)
  const [docxError, setDocxError] = useState<string | null>(null)

  const [xlsHtml, setXlsHtml] = useState<string | null>(null)

  // Load text content
  useEffect(() => {
    if (kind !== 'text' && kind !== 'csv') return
    setTextError(null)
    setTextContent('')
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        console.log('Text fetch response:', { url, status: r.status, ok: r.ok })
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
        return r.text()
      })
      .then((text) => {
        console.log('Text content loaded:', { length: text.length })
        setTextContent(text)
      })
      .catch((e) => {
        console.error('Text fetch error:', e)
        setTextError(e?.message || 'Gagal memuat konten')
      })
  }, [url, kind, token])

  // Create object URL for binary preview types
  useEffect(() => {
    if (!['image', 'pdf', 'audio', 'video'].includes(kind)) return
    setBinaryError(null)
    setObjectUrl(null)
    let revoked = false
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        console.log('Fetch response:', { url, status: r.status, ok: r.ok, headers: Object.fromEntries(r.headers.entries()) })
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
        const blob = await r.blob()
        console.log('Blob created:', { size: blob.size, type: blob.type })
        if (revoked) return
        const u = URL.createObjectURL(blob)
        setObjectUrl(u)
      })
      .catch((e) => {
        console.error('Binary fetch error:', e)
        setBinaryError(e?.message || 'Gagal memuat file')
      })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, kind, token])

  // DOCX render offline
  useEffect(() => {
    const ext = getExt(name)
    if (kind !== 'office' || ext !== 'docx') return
    setDocxError(null)
    if (docxContainerRef.current) docxContainerRef.current.innerHTML = ''
    ;(async () => {
      try {
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const buf = await resp.arrayBuffer()
        const mod = await import('docx-preview')
        await mod.renderAsync(buf, docxContainerRef.current as HTMLDivElement, undefined, {
          className: 'docx',
          inWrapper: false,
        })
      } catch (e: any) {
        setDocxError(e?.message || 'Gagal merender DOCX')
      }
    })()
  }, [url, kind, name, token])

  // XLS/XLSX render offline (first sheet to HTML)
  useEffect(() => {
    const ext = getExt(name)
    if (kind !== 'office' || (ext !== 'xlsx' && ext !== 'xls')) return
    setXlsHtml(null)
    ;(async () => {
      try {
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const buf = await resp.arrayBuffer()
        const XLSX = await import('xlsx')
        const wb = XLSX.read(buf, { type: 'array' })
        const first = wb.SheetNames[0]
        let html = XLSX.utils.sheet_to_html(wb.Sheets[first])
        // Keep only the table for clean embedding
        const match = html.match(/<table[\s\S]*?<\/table>/i)
        html = match ? match[0] : html
        // Remove inline styles to let our CSS control layout
        html = html
          .replace(/<table[^>]*>/gi, '<table>')
          .replace(/<td[^>]*>/gi, '<td>')
          .replace(/<th[^>]*>/gi, '<th>')
        setXlsHtml(html)
      } catch (e: any) {
        setXlsHtml(`<div class="text-red-600">${e?.message || 'Gagal merender spreadsheet'}</div>`)
      }
    })()
  }, [url, kind, name, token])

  return (
    <div className="h-full w-full">
      <style>{`
        .excel-wrap { width: 100%; height: 100%; overflow: auto; min-width: fit-content; }
        .excel-wrap table { border-collapse: collapse; border-spacing: 0; white-space: nowrap; font-size: 13px; }
        .excel-wrap th, .excel-wrap td { border: 1px solid #e5e7eb; padding: 8px 12px; }
        .excel-wrap thead th { position: sticky; top: 0; background: #f9fafb; z-index: 1; font-weight: 600; }
        .docx-preview { width: 100%; height: 100%; overflow: auto; }
        .docx-preview .docx-wrapper { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .docx-preview .docx-wrapper > section { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
        .docx-preview .docx-wrapper > section > * { max-width: 100% !important; }
      `}</style>

      {kind === 'image' && (
        <div className="w-full h-full flex items-center justify-center p-4">
          {objectUrl ? (
            <img src={objectUrl} alt={name} className="max-w-full max-h-full object-contain" />
          ) : binaryError ? (
            <div className="text-red-600 text-sm p-4 max-w-md text-center">
              <div className="font-medium mb-2">Gagal memuat gambar</div>
              <div className="text-xs">{binaryError}</div>
              <details className="text-xs mt-2">
                <summary className="cursor-pointer">Debug Info</summary>
                <div className="mt-2 p-2 bg-red-50 rounded text-left">
                  <div>URL: {url}</div>
                  <div>MIME: {mimeType}</div>
                </div>
              </details>
            </div>
          ) : (
            <div className="text-sm text-gray-600 p-4">Memuat gambar…</div>
          )}
        </div>
      )}

      {kind === 'pdf' && (
        <div className="w-full h-full flex items-center justify-center p-4">
          {objectUrl ? (
            <iframe title={name} src={objectUrl} className="max-w-full max-h-full border-0" />
          ) : binaryError ? (
            <div className="text-red-600 text-sm p-4">{binaryError}</div>
          ) : (
            <div className="text-sm text-gray-600 p-4">Memuat dokumen…</div>
          )}
        </div>
      )}

      {kind === 'video' && (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 p-4">
          {objectUrl ? (
            <video controls src={objectUrl} className="max-w-full max-h-full" />
          ) : binaryError ? (
            <div className="text-red-500 bg-gray-900 p-3 rounded">{binaryError}</div>
          ) : (
            <div className="text-gray-300 p-4">Memuat video…</div>
          )}
        </div>
      )}

      {kind === 'audio' && (
        <div className="w-full h-full flex items-center justify-center">
          {objectUrl ? (
            <audio controls src={objectUrl} className="w-full max-w-md" />
          ) : binaryError ? (
            <div className="text-red-600 text-sm p-4">{binaryError}</div>
          ) : (
            <div className="text-sm text-gray-600 p-4">Memuat audio…</div>
          )}
        </div>
      )}

      {(kind === 'text' || kind === 'csv') && (
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-lg font-mono text-sm w-full max-w-full">
            {textError ? (
              <div className="text-red-600 p-6">{textError}</div>
            ) : textContent ? (
              <pre className="whitespace-pre-wrap p-6 w-full overflow-auto max-h-[calc(100vh-250px)]">{textContent}</pre>
            ) : (
              <div className="text-sm text-gray-600 p-6">Memuat konten…</div>
            )}
          </div>
        </div>
      )}

      {kind === 'office' && (() => {
        const ext = getExt(name)
        if (ext === 'docx') {
          return (
            <div className="w-full h-full p-0">
              <div className="bg-white w-full h-full overflow-auto">
                {docxError ? (
                  <div className="text-red-600 text-sm p-6">{docxError}</div>
                ) : (
                  <div ref={docxContainerRef} className="docx-preview" />
                )}
              </div>
            </div>
          )
        }
        if (ext === 'xlsx' || ext === 'xls') {
          return (
            <div className="w-full h-full p-0">
              <div className="bg-white w-full h-full overflow-auto">
                {xlsHtml ? (
                  <div className="excel-wrap" dangerouslySetInnerHTML={{ __html: xlsHtml }} />
                ) : (
                  <div className="p-6 text-sm text-gray-600">Memuat spreadsheet…</div>
                )}
              </div>
            </div>
          )
        }
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-600 p-6">
            Pratinjau tidak tersedia untuk tipe ini
          </div>
        )
      })()}

      {(kind === 'archive' || kind === 'unknown') && (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 space-y-4">
          <div className="text-lg font-medium">Pratinjau tidak tersedia</div>
          <div className="text-sm text-gray-500 text-center max-w-md">
            File dengan tipe {mimeType} tidak dapat dipratinjau secara langsung.
            Gunakan tombol "Buka di tab baru" untuk melihat file atau "Unduh" untuk mengunduhnya.
          </div>
          {/* Debug info */}
          <details className="text-xs text-gray-400 mt-4">
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-left">
              <div>Name: {name}</div>
              <div>MIME: {mimeType}</div>
              <div>URL: {url}</div>
              <div>Kind: {kind}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

export default DocumentPreview
