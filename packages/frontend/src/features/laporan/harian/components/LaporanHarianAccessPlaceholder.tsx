import { ShieldX, BarChart3 } from 'lucide-react'
import { cn } from '@/core/lib/utils'

interface LaporanHarianAccessPlaceholderProps {
  className?: string
}

export function LaporanHarianAccessPlaceholder({ className }: LaporanHarianAccessPlaceholderProps) {
  return (
    <div className={cn("text-center space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200", className)}>
      <div className="flex justify-center">
        <div className="p-3 rounded-full bg-gray-200">
          <ShieldX className="h-8 w-8 text-gray-500" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Akses Terbatas
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Anda tidak memiliki akses untuk mengelola laporan harian.
          Hubungi administrator untuk mendapatkan akses yang diperlukan.
        </p>
      </div>
      <div className="text-xs text-gray-500">
        Diperlukan level akses: Admin atau Super Admin
      </div>
    </div>
  )
}