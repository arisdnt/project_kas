import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'

type BrandFormData = {
  nama: string
  deskripsi?: string
  logo_url?: string
  website?: string
  // Scope data
  targetTenantId?: string
  targetStoreId?: string
  applyToAllTenants?: boolean
  applyToAllStores?: boolean
}

type Props = {
  value: { nama: string; deskripsi?: string; logo_url?: string; website?: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: BrandFormData) => Promise<void>
  isLoading?: boolean
}

export const BrandEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, open, onOpenChange, onSave, isLoading = false }, ref) => {
    const [nama, setNama] = React.useState('')
    const [deskripsi, setDeskripsi] = React.useState('')
    const [logoUrl, setLogoUrl] = React.useState('')
    const [website, setWebsite] = React.useState('')
    const [error, setError] = React.useState<string | undefined>()
    const [scopeData, setScopeData] = React.useState<{
      targetTenantId?: string
      targetStoreId?: string
      applyToAllTenants?: boolean
      applyToAllStores?: boolean
    }>({})

    React.useEffect(() => {
      setNama(value?.nama ?? '')
      setDeskripsi(value?.deskripsi ?? '')
      setLogoUrl(value?.logo_url ?? '')
      setWebsite(value?.website ?? '')
      setError(undefined)
      setScopeData({}) // Reset scope data when opening
    }, [value, open])

    const handleSubmit = async () => {
      const v = nama.trim()
      if (!v) {
        setError('Nama brand wajib diisi')
        return
      }
      setError(undefined)
      await onSave({
        nama: v,
        deskripsi: deskripsi.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
        website: website.trim() || undefined,
        ...scopeData
      })
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className="w-full" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Brand' : 'Tambah Brand'}</SidebarTitle>
            <SidebarDescription>Masukkan detail brand</SidebarDescription>
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

                {/* Right column: Brand Details */}
                <div className="col-span-3 space-y-4">
                  <h3 className="text-sm font-medium">Detail Brand</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nama" className="text-sm font-medium">Nama Brand *</label>
                      <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={error ? 'border-red-500' : ''} />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                      <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="logo_url" className="text-sm font-medium">URL Logo</label>
                      <Input id="logo_url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">Website</label>
                      <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode: single column
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <label htmlFor="nama" className="text-sm font-medium">Nama Brand *</label>
                  <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={error ? 'border-red-500' : ''} />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                  <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="logo_url" className="text-sm font-medium">URL Logo</label>
                  <Input id="logo_url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            )}
          </div>
          <SidebarFooter className="mt-6">
            {!value ? (
              // Create mode: buttons matching column layout
              <div className="grid grid-cols-5 gap-6">
                <div className="col-span-2">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full">
                    Batal
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            ) : (
              // Edit mode: centered buttons
              <div className="flex gap-2 w-full max-w-md mx-auto">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
                  Batal
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1">
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

BrandEditSidebar.displayName = 'BrandEditSidebar'

