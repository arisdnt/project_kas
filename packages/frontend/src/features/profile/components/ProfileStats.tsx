import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Activity, Database, Users, Clock } from 'lucide-react'
import { CompleteProfileData } from '../types/profile.types'

interface ProfileStatsProps {
  statistics: CompleteProfileData['statistics']
  profile: CompleteProfileData['profile']
}

export function ProfileStats({ statistics, profile }: ProfileStatsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah login'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statsCards = [
    {
      title: 'Total Sesi',
      value: statistics.totalSessions,
      icon: Users,
      description: 'Jumlah sesi login'
    },
    {
      title: 'Sesi Aktif',
      value: statistics.activeSessions,
      icon: Activity,
      description: 'Sesi yang sedang aktif'
    },
    {
      title: 'Log Audit',
      value: statistics.totalAuditLogs,
      icon: Database,
      description: 'Total aktivitas tercatat'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Informasi Akun</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bergabung:</span>
            <span className="text-sm font-medium">
              {formatDate(profile.created_at)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Terakhir Login:</span>
            <span className="text-sm font-medium">
              {formatDate(statistics.lastLogin)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Username:</span>
            <span className="text-sm font-medium">{profile.username}</span>
          </div>
          
          {profile.nama_tenant && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tenant:</span>
              <span className="text-sm font-medium">{profile.nama_tenant}</span>
            </div>
          )}
          
          {profile.nama_toko && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toko:</span>
              <span className="text-sm font-medium">{profile.nama_toko}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}