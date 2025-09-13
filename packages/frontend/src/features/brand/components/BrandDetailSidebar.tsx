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
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">ID</div>
              <div className="text-sm font-mono">{brand.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Nama</div>
              <div className="text-sm font-medium">{brand.nama}</div>
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

BrandDetailSidebar.displayName = 'BrandDetailSidebar'

