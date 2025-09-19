import React, { useRef, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
} from '@/core/components/ui/sidebar'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Separator } from '@/core/components/ui/separator'
import { type UploadTarget } from '@/features/storage/services/storageService'
import { Upload, ChevronDown } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (formData: DocumentUploadData) => Promise<void>
  isLoading: boolean
}

export interface DocumentUploadData {
  file: File
  kategori_dokumen: UploadTarget
  targetTenantId?: string
  targetStoreId?: string
  applyToAllTenants?: boolean
  applyToAllStores?: boolean
}

export default function DocumentUploadDrawer({
  open,
  onOpenChange,
  onUpload,
  isLoading
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [target, setTarget] = useState<UploadTarget>('other')
  const [scopeData, setScopeData] = useState<{
    targetTenantId?: string
    targetStoreId?: string
    applyToAllTenants?: boolean
    applyToAllStores?: boolean
  }>({})

  const helperText = {
    other: 'Dokumen umum (semua jenis file)',
    image: 'Gambar (jpeg, png, webp, gif)',
    document: 'Dokumen (PDF, Word)',
    invoice: 'Faktur/Invoice (PDF, gambar)',
    receipt: 'Kwitansi (PDF, gambar)',
    contract: 'Kontrak (PDF, Word)',
  }[target]

  const handleSubmit = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    const uploadData: DocumentUploadData = {
      file,
      kategori_dokumen: target,
      ...scopeData
    }

    await onUpload(uploadData)

    // Reset form after successful upload
    if (fileRef.current) fileRef.current.value = ''
    setTarget('other')
    setScopeData({})
    onOpenChange(false)
  }

  const resetForm = () => {
    if (fileRef.current) fileRef.current.value = ''
    setTarget('other')
    setScopeData({})
  }

  return (
    <Sidebar
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetForm()
      }}
    >
      <SidebarContent side="right" size="fifty">
        <SidebarHeader>
          <SidebarTitle>Upload File Baru</SidebarTitle>
          <SidebarDescription>
            Unggah dokumen ke sistem dengan kategori dan pengaturan akses yang sesuai
          </SidebarDescription>
        </SidebarHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - Scope Selection */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Pengaturan Akses</h3>
                  <ScopeSelector
                    onScopeChange={setScopeData}
                    compact={false}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Separator className="lg:hidden" />
            </div>

            {/* Right Column - File Upload Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Pilih File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileRef}
                    className="cursor-pointer"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal 10MB. Format: JPEG, PNG, PDF, DOC, DOCX, TXT, CSV, XLSX, ZIP
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Kategori Dokumen</Label>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        disabled={isLoading}
                      >
                        <span className="capitalize">{target}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="w-full min-w-[280px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                        {(['other', 'image', 'document', 'invoice', 'receipt', 'contract'] as UploadTarget[]).map((t) => (
                          <DropdownMenu.Item
                            key={t}
                            className="px-3 py-2 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer"
                            onSelect={() => setTarget(t)}
                          >
                            <span className="capitalize">{t}</span>
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                  <p className="text-xs text-muted-foreground">{helperText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SidebarFooter>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !fileRef.current?.files?.[0]}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}