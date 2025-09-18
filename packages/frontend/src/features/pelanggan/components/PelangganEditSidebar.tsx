import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'

export type PelangganFormData = {
  nama: string
  email?: string
  telepon?: string
  alamat?: string
  tipe: 'reguler' | 'vip' | 'member' | 'wholesale'
  // Scope
  targetTenantId?: string
  targetStoreId?: string
  applyToAllTenants?: boolean
  applyToAllStores?: boolean
}

interface Props {
  value: { nama: string; email?: string; telepon?: string; alamat?: string; tipe: 'reguler' | 'vip' | 'member' | 'wholesale' } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: PelangganFormData) => Promise<void>
  isLoading?: boolean
}

export const PelangganEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, open, onOpenChange, onSave, isLoading = false }, ref) => {
    const [form, setForm] = React.useState<PelangganFormData>({ nama: '', email: '', telepon: '', alamat: '', tipe: 'reguler' })
    const [errors, setErrors] = React.useState<{ nama?: string; email?: string }>({})
    const [scopeData, setScopeData] = React.useState<{
      targetTenantId?: string
      targetStoreId?: string
      applyToAllTenants?: boolean
      applyToAllStores?: boolean
    }>({})

    React.useEffect(() => {
      setForm({
        nama: value?.nama ?? '',
        email: value?.email ?? '',
        telepon: value?.telepon ?? '',
        alamat: value?.alamat ?? '',
        tipe: value?.tipe ?? 'reguler'
      })
      setErrors({})
      setScopeData({})
    }, [value, open])

    const handleChange = <K extends keyof PelangganFormData>(k: K, v: PelangganFormData[K]) => {
      setForm((s) => ({ ...s, [k]: v }))
    }

    const validate = () => {
      const e: { nama?: string; email?: string } = {}
      if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid'
      setErrors(e)
      return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
      if (!validate()) return
      await onSave({ ...form, nama: form.nama.trim(), ...(value ? {} : scopeData) })
      onOpenChange(false)
    }

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent className="w-full max-w-md" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</SidebarTitle>
            <SidebarDescription>Masukkan detail pelanggan</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            {!value && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Scope</h3>
                <ScopeSelector onScopeChange={setScopeData} disabled={isLoading} compact />
                <Separator />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama *</label>
              <Input value={form.nama} onChange={(e) => handleChange('nama', e.target.value)} className={errors.nama ? 'border-red-500' : ''} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} className={errors.email ? 'border-red-500' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telepon</label>
                <Input value={form.telepon || ''} onChange={(e) => handleChange('telepon', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipe</label>
                <select
                  value={form.tipe}
                  onChange={(e) => handleChange('tipe', e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="reguler">Reguler</option>
                  <option value="vip">VIP</option>
                  <option value="member">Member</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat</label>
              <textarea
                rows={3}
                value={form.alamat || ''}
                onChange={(e) => handleChange('alamat', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <SidebarFooter>
            <div className="flex gap-2 w-full">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">Batal</Button>
              <Button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1">{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

PelangganEditSidebar.displayName = 'PelangganEditSidebar'
