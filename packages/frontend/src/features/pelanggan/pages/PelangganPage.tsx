import { PelangganToolbar } from '@/features/pelanggan/components/PelangganToolbar'
import { PelangganTable } from '@/features/pelanggan/components/PelangganTable'

export function PelangganPage() {
  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <PelangganToolbar />
      </div>
      <div className="flex-1 min-h-0">
        <PelangganTable />
      </div>
    </div>
  )
}

