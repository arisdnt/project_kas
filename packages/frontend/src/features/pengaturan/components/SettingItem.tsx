import type React from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { ChevronRight, Edit, Copy, MoreVertical } from 'lucide-react'

interface SettingItemProps {
  title: string
  description: string
  value: string | number | boolean
  icon: React.ReactNode
  category: string
  badge?: boolean
  onClick?: () => void
  action?: 'edit' | 'copy' | 'view'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    toko: 'bg-green-100 text-green-800 border-green-200',
    keuangan: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pajak: 'bg-red-100 text-red-800 border-red-200',
    waktu: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    printer: 'bg-purple-100 text-purple-800 border-purple-200',
    api: 'bg-blue-100 text-blue-800 border-blue-200',
    jwt: 'bg-orange-100 text-orange-800 border-orange-200'
  }
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function getActionIcon(action: 'edit' | 'copy' | 'view') {
  switch (action) {
    case 'edit':
      return <Edit className="h-4 w-4" />
    case 'copy':
      return <Copy className="h-4 w-4" />
    default:
      return <ChevronRight className="h-4 w-4" />
  }
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'Aktif' : 'Tidak Aktif'
  }
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID')
  }
  return String(value)
}

export function SettingItem({ 
  title, 
  description, 
  value, 
  icon, 
  category, 
  badge = false, 
  onClick,
  action = 'view'
}: SettingItemProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer"
          onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className={getCategoryColor(category)}>
                    {category.toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {formatValue(value)}
                </p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {getActionIcon(action)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SettingItem