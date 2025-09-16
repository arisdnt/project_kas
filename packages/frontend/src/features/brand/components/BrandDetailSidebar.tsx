import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { UIBrand } from '@/features/brand/store/brandStore'

type Props = {
  brand: UIBrand | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const BrandDetailSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ brand, open, onOpenChange }, ref) => {
    if (!brand) return null
    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent className="w-full max-w-md" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>Detail Brand</SidebarTitle>
            <SidebarDescription>Informasi brand produk</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-4 px-1">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">ID</div>
              <div className="text-sm font-mono break-all">{brand.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Nama</div>
              <div className="text-sm font-medium">{brand.nama}</div>
            </div>
            {brand.deskripsi && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Deskripsi</div>
                <div className="text-sm">{brand.deskripsi}</div>
              </div>
            )}
            {brand.logo_url && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Logo URL</div>
                <a href={brand.logo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {brand.logo_url}
                </a>
              </div>
            )}
            {brand.website && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Website</div>
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                  {brand.website}
                </a>
              </div>
            )}
            {brand.status && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-sm capitalize">{brand.status}</div>
              </div>
            )}
          </div>
          <SidebarFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Tutup</Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

BrandDetailSidebar.displayName = 'BrandDetailSidebar'

