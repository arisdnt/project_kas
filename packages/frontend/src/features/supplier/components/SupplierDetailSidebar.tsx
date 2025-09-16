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
            {supplier.status && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Status</div>
                <div className={`text-sm font-medium px-2 py-1 rounded text-center w-fit ${
                  supplier.status === 'aktif' ? 'bg-green-100 text-green-800' :
                  supplier.status === 'nonaktif' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </div>
              </div>
            )}
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
            {supplier.npwp && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">NPWP</div>
                <div className="text-sm font-mono">{supplier.npwp}</div>
              </div>
            )}
            {(supplier.bank_nama || supplier.bank_rekening || supplier.bank_atas_nama) && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Informasi Bank</div>
                <div className="text-sm space-y-1">
                  {supplier.bank_nama && <div><span className="text-gray-500">Bank:</span> {supplier.bank_nama}</div>}
                  {supplier.bank_rekening && <div><span className="text-gray-500">No. Rekening:</span> {supplier.bank_rekening}</div>}
                  {supplier.bank_atas_nama && <div><span className="text-gray-500">Atas Nama:</span> {supplier.bank_atas_nama}</div>}
                </div>
              </div>
            )}
            {(supplier.dibuat_pada || supplier.diperbarui_pada) && (
              <div className="border-t pt-4 space-y-2">
                {supplier.dibuat_pada && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Dibuat Pada</div>
                    <div className="text-sm">{new Date(supplier.dibuat_pada).toLocaleString('id-ID')}</div>
                  </div>
                )}
                {supplier.diperbarui_pada && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Diperbarui Pada</div>
                    <div className="text-sm">{new Date(supplier.diperbarui_pada).toLocaleString('id-ID')}</div>
                  </div>
                )}
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

