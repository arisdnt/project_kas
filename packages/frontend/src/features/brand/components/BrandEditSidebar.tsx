import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'

type Props = {
  value: { nama: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { nama: string }) => Promise<void>
  isLoading?: boolean
}

export const BrandEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, open, onOpenChange, onSave, isLoading = false }, ref) => {
    const [nama, setNama] = React.useState('')
    const [error, setError] = React.useState<string | undefined>()

    React.useEffect(() => {
      setNama(value?.nama ?? '')
      setError(undefined)
    }, [value, open])

    const handleSubmit = async () => {
      const v = nama.trim()
      if (!v) {
        setError('Nama brand wajib diisi')
        return
      }
      setError(undefined)
      await onSave({ nama: v })
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent className="w-full max-w-md" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Brand' : 'Tambah Brand'}</SidebarTitle>
            <SidebarDescription>Masukkan detail brand</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">Nama Brand *</label>
              <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={error ? 'border-red-500' : ''} />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <SidebarFooter>
            <div className="flex gap-2 w-full">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">Batal</Button>
              <Button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1">{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

BrandEditSidebar.displayName = 'BrandEditSidebar'

