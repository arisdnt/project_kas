import React from 'react'
import { Dialog, DialogContentNoClose, DialogTitle, DialogDescription } from '@/core/components/ui/dialog'
import { X } from 'lucide-react'
import DocumentPreview from './DocumentPreview'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  mimeType: string
  size?: number
  url: string // stream/same-origin url for preview
  openUrl?: string // optional presigned url for open/download
}

export default function DocumentPreviewModal({ open, onOpenChange, name, mimeType, size, url, openUrl }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNoClose className="p-0 min-w-[400px] max-w-[96vw] w-[96vw] h-[92vh] grid grid-rows-[auto,1fr]">
        {/* Hidden elements for accessibility */}
        <DialogTitle className="sr-only">
          Pratinjau Dokumen - {name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Pratinjau dokumen {mimeType} dengan opsi untuk membuka di tab baru atau mengunduh file
        </DialogDescription>
        
        {/* Header dengan fixed height */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white/90 backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate text-gray-900" title={name}>
                {name}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {mimeType}{size ? ` • ${Math.round((size || 0) / 1024)} KB` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {openUrl && (
                <a 
                  href={openUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  Buka di tab baru
                </a>
              )}
              {openUrl && (
                <a 
                  href={openUrl} 
                  download 
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Unduh
                </a>
              )}
              <button
                aria-label="Tutup"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
        </div>
        
        {/* Content area full height with internal scroll */}
        <div className="min-h-0 overflow-auto bg-white">
          <DocumentPreview name={name} mimeType={mimeType} url={url} />
        </div>
      </DialogContentNoClose>
    </Dialog>
  )
}
