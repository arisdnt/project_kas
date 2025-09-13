import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react'
import { SessionData } from '../types/profile.types'

interface SessionsListProps {
  sessions: SessionData[]
}

export function SessionsList({ sessions }: SessionsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return Smartphone
    if (userAgent.includes('Tablet')) return Tablet
    return Monitor
  }

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Browser Lain'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span>Sesi Login Aktif</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada sesi aktif
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.user_agent)
              const browserName = getBrowserName(session.user_agent)
              const isActive = session.is_active === 1
              
              return (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DeviceIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{browserName}</span>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        IP: {session.ip_address}
                      </div>
                      <div className="text-xs text-gray-400">
                        Login: {formatDate(session.created_at)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Berakhir: {formatDate(session.expires_at)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}