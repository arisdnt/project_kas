import { ShieldAlert } from 'lucide-react'
import { Card } from '@/core/components/ui/card'

interface KategoriAccessPlaceholderProps {
  className?: string
}

export function KategoriAccessPlaceholder({ className = '' }: KategoriAccessPlaceholderProps) {
  return (
    <Card
      className={`border-dashed border-orange-200 bg-orange-50/60 p-6 text-center shadow-none ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-orange-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Akses Dibatasi</h3>
          <p className="text-sm text-gray-600">
            Anda tidak memiliki izin untuk mengubah pengaturan ini. Silakan hubungi administrator
            untuk mendapatkan akses.
          </p>
        </div>
      </div>
    </Card>
  )
}
