import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { cn } from '@/core/lib/utils'
import { Save, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'

export interface MutasiStokFormData {
  id_produk: string
  jenis_mutasi: 'masuk' | 'keluar'
  jumlah: string
  keterangan?: string
}

interface MutasiStokEditSidebarProps {
  data: MutasiStokFormData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: MutasiStokFormData, scope?: ScopeData) => Promise<void>
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

export const MutasiStokEditSidebar = React.forwardRef<HTMLDivElement, MutasiStokEditSidebarProps>(
  ({ data, open, onOpenChange, onSave, isLoading = false, isCreate = false, className }, ref) => {
    const [formData, setFormData] = React.useState<MutasiStokFormData>({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
    const [scopeData, setScopeData] = React.useState<ScopeData>({})

    React.useEffect(() => {
      if (data) {
        setFormData(data)
      }
    }, [data])

    const handleChange = (field: keyof MutasiStokFormData, value: string | 'masuk' | 'keluar') => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.id_produk || !formData.jumlah) return
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
            <SidebarTitle>{isCreate ? 'Buat Mutasi Stok' : 'Edit Mutasi Stok'}</SidebarTitle>
            <SidebarDescription>
              {isCreate ? 'Tambahkan mutasi stok baru' : 'Perbarui data mutasi stok'}
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
                  <h3 className="text-sm font-medium">Detail Mutasi Stok</h3>
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
                      <Label htmlFor="jenis_mutasi">Jenis Mutasi *</Label>
                      <Select
                        value={formData.jenis_mutasi}
                        onValueChange={(value: 'masuk' | 'keluar') => handleChange('jenis_mutasi', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis mutasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masuk">Stok Masuk</SelectItem>
                          <SelectItem value="keluar">Stok Keluar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jumlah">Jumlah *</Label>
                      <Input
                        id="jumlah"
                        type="number"
                        value={formData.jumlah}
                        onChange={(e) => handleChange('jumlah', e.target.value)}
                        placeholder="Masukkan jumlah mutasi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keterangan">Keterangan</Label>
                      <Input
                        id="keterangan"
                        value={formData.keterangan}
                        onChange={(e) => handleChange('keterangan', e.target.value)}
                        placeholder="Keterangan opsional"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="edit_id_produk">Produk</Label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {formData.id_produk}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_jenis_mutasi">Jenis Mutasi *</Label>
                  <Select
                    value={formData.jenis_mutasi}
                    onValueChange={(value: 'masuk' | 'keluar') => handleChange('jenis_mutasi', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis mutasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masuk">Stok Masuk</SelectItem>
                      <SelectItem value="keluar">Stok Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_jumlah">Jumlah *</Label>
                  <Input
                    id="edit_jumlah"
                    type="number"
                    value={formData.jumlah}
                    onChange={(e) => handleChange('jumlah', e.target.value)}
                    placeholder="Masukkan jumlah mutasi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_keterangan">Keterangan</Label>
                  <Input
                    id="edit_keterangan"
                    value={formData.keterangan}
                    onChange={(e) => handleChange('keterangan', e.target.value)}
                    placeholder="Keterangan opsional"
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

MutasiStokEditSidebar.displayName = 'MutasiStokEditSidebar'
