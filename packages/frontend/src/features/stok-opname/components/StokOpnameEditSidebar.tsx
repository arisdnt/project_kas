import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { cn } from '@/core/lib/utils'
import { Save, X } from 'lucide-react'

export interface StokOpnameFormData {
  id_produk: string
  stok_fisik: string
  catatan?: string
}

interface StokOpnameEditSidebarProps {
  data: StokOpnameFormData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: StokOpnameFormData, scope?: ScopeData) => Promise<void>
  isLoading?: boolean
  isCreate?: boolean
  className?: string
}

export interface ScopeData {
  targetTenantId?: string
  targetStoreId?: string
  applyToAllTenants?: boolean
  applyToAllStores?: boolean
}

export const StokOpnameEditSidebar = React.forwardRef<HTMLDivElement, StokOpnameEditSidebarProps>(
  ({ data, open, onOpenChange, onSave, isLoading = false, isCreate = false, className }, ref) => {
    const [formData, setFormData] = React.useState<StokOpnameFormData>({ id_produk: '', stok_fisik: '', catatan: '' })
    const [scopeData, setScopeData] = React.useState<ScopeData>({})

    React.useEffect(() => {
      if (data) {
        setFormData(data)
      }
    }, [data])

    const handleChange = (field: keyof StokOpnameFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.id_produk || !formData.stok_fisik) return
      await onSave(formData, isCreate ? scopeData : undefined)
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    if (!data) return null

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className={cn('w-full', className)} ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{isCreate ? 'Buat Stok Opname' : 'Edit Stok Opname'}</SidebarTitle>
            <SidebarDescription>
              {isCreate ? 'Tambahkan stok opname baru' : 'Perbarui data stok opname'}
            </SidebarDescription>
          </SidebarHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            {isCreate ? (
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* Left: Scope */}
                <div className="col-span-2 space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Scope Selection</h3>
                    <ScopeSelector onScopeChange={setScopeData} disabled={isLoading} compact />
                  </div>
                </div>
                {/* Right: Form */}
                <div className="col-span-3 space-y-4">
                  <h3 className="text-sm font-medium">Detail Stok Opname</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="id_produk">ID Produk *</Label>
                      <Input
                        id="id_produk"
                        value={formData.id_produk}
                        onChange={(e) => handleChange('id_produk', e.target.value)}
                        placeholder="Masukkan ID produk"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stok_fisik">Stok Fisik *</Label>
                      <Input
                        id="stok_fisik"
                        type="number"
                        value={formData.stok_fisik}
                        onChange={(e) => handleChange('stok_fisik', e.target.value)}
                        placeholder="Masukkan jumlah stok fisik"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan</Label>
                      <Input
                        id="catatan"
                        value={formData.catatan}
                        onChange={(e) => handleChange('catatan', e.target.value)}
                        placeholder="Catatan opsional"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="id_produk">ID Produk *</Label>
                  <Input
                    id="id_produk"
                    value={formData.id_produk}
                    onChange={(e) => handleChange('id_produk', e.target.value)}
                    placeholder="Masukkan ID produk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stok_fisik">Stok Fisik *</Label>
                  <Input
                    id="stok_fisik"
                    type="number"
                    value={formData.stok_fisik}
                    onChange={(e) => handleChange('stok_fisik', e.target.value)}
                    placeholder="Masukkan jumlah stok fisik"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catatan">Catatan</Label>
                  <Input
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => handleChange('catatan', e.target.value)}
                    placeholder="Catatan opsional"
                  />
                </div>
              </div>
            )}
          </form>

          <SidebarFooter className="mt-6">
            {isCreate ? (
              <div className="grid grid-cols-5 gap-6">
                <div className="col-span-2">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 w-full max-w-md mx-auto">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
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

StokOpnameEditSidebar.displayName = 'StokOpnameEditSidebar'
