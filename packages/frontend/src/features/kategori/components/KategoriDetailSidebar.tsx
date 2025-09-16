import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { UIKategori } from '@/features/kategori/types/kategori'

type Props = {
  kategori: UIKategori | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const KategoriDetailSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ kategori, open, onOpenChange }, ref) => {
    if (!kategori) return null
    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent className="w-full max-w-md" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>Detail Kategori</SidebarTitle>
            <SidebarDescription>Informasi kategori produk</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">ID</div>
              <div className="text-sm font-mono">{kategori.id}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Nama</div>
              <div className="text-sm font-medium">{kategori.nama}</div>
            </div>

            {kategori.deskripsi && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Deskripsi</div>
                <div className="text-sm">{kategori.deskripsi}</div>
              </div>
            )}

            {kategori.icon_url && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Icon</div>
                <div className="text-sm">
                  <img src={kategori.icon_url} alt="Icon kategori" className="w-8 h-8 object-contain" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Urutan</div>
              <div className="text-sm">{kategori.urutan}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-sm">
                <Badge variant={kategori.status === 'aktif' ? 'default' : 'secondary'}>
                  {kategori.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Dibuat</div>
              <div className="text-sm">{new Date(kategori.dibuat_pada).toLocaleDateString('id-ID')}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Diperbarui</div>
              <div className="text-sm">{new Date(kategori.diperbarui_pada).toLocaleDateString('id-ID')}</div>
            </div>
          </div>
          <SidebarFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Tutup</Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

KategoriDetailSidebar.displayName = 'KategoriDetailSidebar'

