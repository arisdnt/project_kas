import * as React from 'react'
import { TenanSidebar, TenanSidebarContent, TenanSidebarHeader, TenanSidebarTitle, TenanSidebarDescription, TenanSidebarFooter } from './TenanSidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'

export type TenanFormData = {
  nama: string
  email: string
  telepon?: string
  alamat?: string
  status: 'aktif' | 'nonaktif' | 'suspended'
  paket: 'basic' | 'premium' | 'enterprise'
  max_toko: number
  max_pengguna: number
}

type Props = {
  value: TenanFormData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: TenanFormData) => Promise<void>
  isLoading?: boolean
  canEdit: boolean
}

export const TenanEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, open, onOpenChange, onSave, isLoading, canEdit }, ref) => {
    const [form, setForm] = React.useState<TenanFormData | null>(value)

    React.useEffect(() => {
      setForm(value)
    }, [value])

    if (!form) return null

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canEdit) return
      await onSave(form)
    }

    return (
      <TenanSidebar open={open} onOpenChange={onOpenChange}>
        <TenanSidebarContent className="w-full max-w-xl" ref={ref}>
          <form onSubmit={onSubmit} className="flex flex-col h-full">
            <TenanSidebarHeader>
              <TenanSidebarTitle>{value ? 'Edit Tenan' : 'Tenan Baru'}</TenanSidebarTitle>
              <TenanSidebarDescription>Kelola informasi tenan, paket, dan batasan</TenanSidebarDescription>
            </TenanSidebarHeader>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama</Label>
                  <Input id="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input id="telepon" value={form.telepon || ''} onChange={(e) => setForm({ ...form, telepon: e.target.value })} disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                    <SelectTrigger id="status" disabled={!canEdit}>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paket">Paket</Label>
                  <Select value={form.paket} onValueChange={(v: any) => setForm({ ...form, paket: v })}>
                    <SelectTrigger id="paket" disabled={!canEdit}>
                      <SelectValue placeholder="Pilih paket" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_toko">Maks. Toko</Label>
                  <Input id="max_toko" type="number" min={1} value={form.max_toko} onChange={(e) => setForm({ ...form, max_toko: Number(e.target.value) })} disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_pengguna">Maks. Pengguna</Label>
                  <Input id="max_pengguna" type="number" min={1} value={form.max_pengguna} onChange={(e) => setForm({ ...form, max_pengguna: Number(e.target.value) })} disabled={!canEdit} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea id="alamat" rows={3} value={form.alamat || ''} onChange={(e) => setForm({ ...form, alamat: e.target.value })} disabled={!canEdit} />
              </div>
            </div>
            <TenanSidebarFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={!canEdit || isLoading} className="flex-1">{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </TenanSidebarFooter>
          </form>
        </TenanSidebarContent>
      </TenanSidebar>
    )
  }
)

TenanEditSidebar.displayName = 'TenanEditSidebar'

