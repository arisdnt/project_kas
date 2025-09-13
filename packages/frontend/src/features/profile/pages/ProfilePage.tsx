import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Separator } from '@/core/components/ui/separator'
import { User, Settings, BarChart3, Monitor, Building2 } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { 
  ProfileHeader, 
  ProfileForm, 
  ProfileStats, 
  PasswordChangeForm,
  TenantInfo 
} from '../components'
import { SessionsList } from '../components/SessionsList'
import { AuditLogsList } from '../components/AuditLogsList'

export function ProfilePage() {
  const { 
    loading, 
    completeProfile, 
    error, 
    updateProfile, 
    changePassword 
  } = useProfile()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Memuat data profil...</div>
        </div>
      </div>
    )
  }

  if (error || !completeProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            {error || 'Gagal memuat data profil'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-2">
        <User className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Profil Pengguna</h1>
      </div>
      
      <Separator />
      
      {/* Profile Header */}
      <ProfileHeader profile={completeProfile.profile} />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="tenant" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Tenant</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Keamanan</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Sesi Login</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Log Aktivitas</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <ProfileStats 
              statistics={completeProfile.statistics}
              profile={completeProfile.profile}
            />
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm 
                  profile={completeProfile.profile}
                  onUpdate={updateProfile}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tenant Tab */}
        <TabsContent value="tenant">
          <TenantInfo profile={completeProfile.profile} />
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-4">
            <PasswordChangeForm onChangePassword={changePassword} />
          </div>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <SessionsList sessions={completeProfile.sessions} />
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <AuditLogsList auditLogs={completeProfile.auditLogs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}