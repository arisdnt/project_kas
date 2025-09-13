import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Settings, Shield, User } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { ProfileForm, PasswordChangeForm } from '../components'

export function PengaturanProfilPage() {
  const { loading, completeProfile, error, updateProfile, changePassword } = useProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg text-gray-600">Memuat pengaturan profil...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !completeProfile) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-red-500 mb-2">{error || 'Gagal memuat data profil'}</div>
              <p className="text-gray-500">Silakan coba lagi atau hubungi administrator</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Pengaturan Profil</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Kelola informasi akun dan keamanan Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Informasi Profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ProfileForm profile={completeProfile.profile} onUpdate={updateProfile} />
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>Keamanan Akun</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PasswordChangeForm onChangePassword={changePassword} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

