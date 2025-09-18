import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { CreateKategoriRequest } from '@/features/kategori/types/kategori'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'

type Props = {
  value: CreateKategoriRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateKategoriRequest) => Promise<void>
  isLoading?: boolean
}

export const KategoriEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, open, onOpenChange, onSave, isLoading = false }, ref) => {
    const [nama, setNama] = React.useState('')
    const [deskripsi, setDeskripsi] = React.useState('')
    const [iconUrl, setIconUrl] = React.useState('')
    const [urutan, setUrutan] = React.useState(0)
  const [error, setError] = React.useState<string | undefined>()
  const [scopeData, setScopeData] = React.useState<{ targetTenantId?: string; targetStoreId?: string; applyToAllTenants?: boolean; applyToAllStores?: boolean }>({})

    React.useEffect(() => {
      setNama(value?.nama ?? '')
      setDeskripsi(value?.deskripsi ?? '')
      setIconUrl(value?.icon_url ?? '')
      setUrutan(value?.urutan ?? 0)
      setError(undefined)
    }, [value, open])

    const handleSubmit = async () => {
      const v = nama.trim()
      if (!v) {
        setError('Nama kategori wajib diisi')
        return
      }
      setError(undefined)

      const data: CreateKategoriRequest = {
        nama: v,
        ...(deskripsi.trim() && { deskripsi: deskripsi.trim() }),
        ...(iconUrl.trim() && { icon_url: iconUrl.trim() }),
        urutan
      }

      // Gabungkan scope hanya saat create (value == null menandakan create mode di halaman pemanggil)
      let payload: any = data
      if (!value) {
        payload = {
          ...data,
          ...(scopeData.targetTenantId ? { targetTenantId: scopeData.targetTenantId } : {}),
          ...(scopeData.targetStoreId ? { targetStoreId: scopeData.targetStoreId } : {}),
          ...(scopeData.applyToAllTenants ? { applyToAllTenants: true } : {}),
          ...(scopeData.applyToAllStores ? { applyToAllStores: true } : {}),
        }
      }

      await onSave(payload)
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className="w-full" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Kategori' : 'Tambah Kategori'}</SidebarTitle>
            <SidebarDescription>Masukkan detail kategori</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto">
            {!value ? (
              // Create mode: 2-column layout
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* Left column: Scope Selection */}
                <div className="col-span-2 space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Scope Selection</h3>
                    <ScopeSelector
                      onScopeChange={setScopeData}
                      disabled={isLoading}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Right column: Category Details */}
                <div className="col-span-3 space-y-4">
                  <h3 className="text-sm font-medium">Detail Kategori</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nama" className="text-sm font-medium">Nama Kategori *</label>
                      <Input
                        id="nama"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className={error ? 'border-red-500' : ''}
                        placeholder="Masukkan nama kategori"
                      />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                      <Textarea
                        id="deskripsi"
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Deskripsi kategori (opsional)"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="icon_url" className="text-sm font-medium">URL Icon</label>
                      <Input
                        id="icon_url"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        placeholder="https://example.com/icon.png (opsional)"
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="urutan" className="text-sm font-medium">Urutan</label>
                      <Input
                        id="urutan"
                        value={urutan}
                        onChange={(e) => setUrutan(Number(e.target.value) || 0)}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode: single column
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <label htmlFor="nama" className="text-sm font-medium">Nama Kategori *</label>
                  <Input
                    id="nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className={error ? 'border-red-500' : ''}
                    placeholder="Masukkan nama kategori"
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                  <Textarea
                    id="deskripsi"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Deskripsi kategori (opsional)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="icon_url" className="text-sm font-medium">URL Icon</label>
                  <Input
                    id="icon_url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://example.com/icon.png (opsional)"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="urutan" className="text-sm font-medium">Urutan</label>
                  <Input
                    id="urutan"
                    value={urutan}
                    onChange={(e) => setUrutan(Number(e.target.value) || 0)}
                    placeholder="0"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
          <SidebarFooter className="mt-6">
            {!value ? (
              // Create mode: buttons matching column layout
              <div className="grid grid-cols-5 gap-6">
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            ) : (
              // Edit mode: centered buttons
              <div className="flex gap-2 w-full max-w-md mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            )}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

KategoriEditSidebar.displayName = 'KategoriEditSidebar'

