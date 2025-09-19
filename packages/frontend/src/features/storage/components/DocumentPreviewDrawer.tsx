import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from '@/core/components/ui/drawer'
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

export default function DocumentPreviewDrawer({
  open,
  onOpenChange,
  name,
  mimeType,
  size,
  url,
  openUrl
}: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="w-[90%] max-w-none sm:w-[90%]"
      >
        {/* Hidden elements for accessibility */}
        <DrawerTitle className="sr-only">
          Pratinjau Dokumen - {name}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Pratinjau dokumen {mimeType} dengan opsi untuk membuka di tab baru atau mengunduh file
        </DrawerDescription>

        {/* Header */}
        <DrawerHeader className="flex items-center justify-between px-6 py-4 border-b bg-background shadow-sm">
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
        </DrawerHeader>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-auto bg-muted/50">
          <div className="h-full bg-background">
            <DocumentPreview name={name} mimeType={mimeType} url={url} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}