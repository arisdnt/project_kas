import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'

type Props = {
  value: { nama: string; kontak_person?: string; email?: string; telepon?: string; alamat?: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { nama: string; kontak_person?: string; email?: string; telepon?: string; alamat?: string }) => Promise<void>
  isLoading?: boolean
}

export const SupplierEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, open, onOpenChange, onSave, isLoading = false }, ref) => {
    const [form, setForm] = React.useState({ nama: '', kontak_person: '', email: '', telepon: '', alamat: '' })
    const [errors, setErrors] = React.useState<{ nama?: string; email?: string }>({})

    React.useEffect(() => {
      setForm({
        nama: value?.nama ?? '',
        kontak_person: value?.kontak_person ?? '',
        email: value?.email ?? '',
        telepon: value?.telepon ?? '',
        alamat: value?.alamat ?? '',
      })
      setErrors({})
    }, [value, open])

    const validate = () => {
      const e: { nama?: string; email?: string } = {}
      if (!form.nama.trim()) e.nama = 'Nama supplier wajib diisi'
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid'
      setErrors(e)
      return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
      if (!validate()) return
      await onSave({ ...form, nama: form.nama.trim() })
      onOpenChange(false)
    }

    const handleChange = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }))

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent className="w-full max-w-md" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Supplier' : 'Tambah Supplier'}</SidebarTitle>
            <SidebarDescription>Masukkan detail supplier</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="nama">Nama *</label>
              <Input id="nama" value={form.nama} onChange={(e) => handleChange('nama', e.target.value)} className={errors.nama ? 'border-red-500' : ''} />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="kontak">Kontak</label>
                <Input id="kontak" value={form.kontak_person} onChange={(e) => handleChange('kontak_person', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="telepon">Telepon</label>
                <Input id="telepon" value={form.telepon} onChange={(e) => handleChange('telepon', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={errors.email ? 'border-red-500' : ''} />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="alamat">Alamat</label>
              <textarea id="alamat" rows={3} value={form.alamat} onChange={(e) => handleChange('alamat', e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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

SupplierEditSidebar.displayName = 'SupplierEditSidebar'

