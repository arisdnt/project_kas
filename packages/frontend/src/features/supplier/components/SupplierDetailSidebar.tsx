import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { UISupplier } from '@/features/supplier/store/supplierStore'

type Props = {
  supplier: UISupplier | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SupplierDetailSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ supplier, open, onOpenChange }, ref) => {
    if (!supplier) return null
    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent className="w-full max-w-md" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>Detail Supplier</SidebarTitle>
            <SidebarDescription>Informasi lengkap supplier</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">ID</div>
              <div className="text-sm font-mono">{supplier.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Nama</div>
              <div className="text-sm font-medium">{supplier.nama}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Kontak</div>
                <div className="text-sm">{supplier.kontak_person || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Telepon</div>
                <div className="text-sm">{supplier.telepon || '-'}</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm">{supplier.email || '-'}</div>
            </div>
            {supplier.alamat && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Alamat</div>
                <div className="text-sm whitespace-pre-wrap">{supplier.alamat}</div>
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

SupplierDetailSidebar.displayName = 'SupplierDetailSidebar'

