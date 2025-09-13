import { Badge } from '@/core/components/ui/badge'
import { Settings } from 'lucide-react'

interface SettingsHeaderProps {
  settingsCount: number
}

export function SettingsHeader({ settingsCount }: SettingsHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
              <p className="text-gray-600 mt-1">Kelola konfigurasi aplikasi sesuai BLUEPRINT</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {settingsCount} Pengaturan
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsHeader