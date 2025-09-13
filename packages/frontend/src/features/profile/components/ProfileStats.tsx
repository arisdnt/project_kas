import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Activity, Database, Users, Clock, TrendingUp, Shield, Calendar } from 'lucide-react'
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
      description: 'Jumlah sesi login',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700'
    },
    {
      title: 'Sesi Aktif',
      value: statistics.activeSessions,
      icon: Activity,
      description: 'Sesi yang sedang aktif',
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    },
    {
      title: 'Log Audit',
      value: statistics.totalAuditLogs,
      icon: Database,
      description: 'Total aktivitas tercatat',
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700'
    },
    {
      title: 'Status Akun',
      value: profile.is_active ? 'Aktif' : 'Nonaktif',
      icon: Shield,
      description: profile.is_super_admin ? 'Super Administrator' : 'Pengguna Biasa',
      color: profile.is_active ? 'green' : 'red',
      bgColor: profile.is_active ? 'bg-green-50' : 'bg-red-50',
      iconColor: profile.is_active ? 'text-green-600' : 'text-red-600',
      textColor: profile.is_active ? 'text-green-700' : 'text-red-700'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}