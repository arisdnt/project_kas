import * as React from 'react'
import { TenanSidebar, TenanSidebarContent, TenanSidebarHeader, TenanSidebarTitle, TenanSidebarDescription, TenanSidebarFooter } from './TenanSidebar'
import { Button } from '@/core/components/ui/button'
import { Tenan } from '@/features/tenan/store/tenanStore'

type Props = {
  tenan: Tenan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TenanDetailSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ tenan, open, onOpenChange }, ref) => {
    if (!tenan) return null
    return (
      <TenanSidebar open={open} onOpenChange={onOpenChange}>
        <TenanSidebarContent className="w-full max-w-lg" ref={ref}>
          <TenanSidebarHeader>
            <TenanSidebarTitle>Detail Tenan</TenanSidebarTitle>
            <TenanSidebarDescription>Informasi tenan dan paket langganan</TenanSidebarDescription>
          </TenanSidebarHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">ID</div>
                <div className="text-sm font-mono break-all">{tenan.id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Nama</div>
                <div className="text-sm font-medium">{tenan.nama}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm">{tenan.email}</div>
              </div>
              {tenan.telepon ? (
                <div>
                  <div className="text-xs text-gray-500">Telepon</div>
                  <div className="text-sm">{tenan.telepon}</div>
                </div>
              ) : null}
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="text-sm capitalize">{tenan.status}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Paket</div>
                <div className="text-sm capitalize">{tenan.paket}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Batas</div>
                <div className="text-sm">{tenan.max_toko} toko • {tenan.max_pengguna} pengguna</div>
              </div>
            </section>

            {tenan.alamat ? (
              <div>
                <div className="text-xs text-gray-500">Alamat</div>
                <div className="text-sm whitespace-pre-line">{tenan.alamat}</div>
              </div>
            ) : null}

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Dibuat</div>
                <div className="text-xs text-gray-600">{tenan.dibuat_pada ? new Date(tenan.dibuat_pada).toLocaleString('id-ID') : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Diperbarui</div>
                <div className="text-xs text-gray-600">{tenan.diperbarui_pada ? new Date(tenan.diperbarui_pada).toLocaleString('id-ID') : '—'}</div>
              </div>
            </section>
          </div>
          <TenanSidebarFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Tutup</Button>
          </TenanSidebarFooter>
        </TenanSidebarContent>
      </TenanSidebar>
    )
  }
)

TenanDetailSidebar.displayName = 'TenanDetailSidebar'

