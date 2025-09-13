import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { User, Settings, Building2, Shield, Monitor, BarChart3, Activity, Users, Calendar, Mail, Phone, MapPin, Store, Package } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('profile')
  const [activeLeftTab, setActiveLeftTab] = useState('account')
  const [activeTenantTab, setActiveTenantTab] = useState('info')
  
  const { 
    loading, 
    completeProfile, 
    error, 
    updateProfile, 
    changePassword 
  } = useProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg text-gray-600">Memuat data profil...</div>
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
              <div className="text-lg text-red-500 mb-2">
                {error || 'Gagal memuat data profil'}
              </div>
              <p className="text-gray-500">Silakan coba lagi atau hubungi administrator</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      {/* 2-Column Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Column - Information Section */}
        <div className="lg:w-1/2 bg-white">
          <div className="p-6 lg:p-8 h-full overflow-y-auto">
            <div className="max-w-none space-y-8">
              {/* Profile Header */}
              <ProfileHeader profile={completeProfile.profile} />
              
              {/* Profile Statistics */}
              <ProfileStats 
                statistics={completeProfile.statistics}
                profile={completeProfile.profile}
              />
              
              {/* Left Column Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                  {[
                    { id: 'account', name: 'Akun Detail', icon: User },
                    { id: 'sessions', name: 'Sesi Aktif', icon: Monitor },
                    { id: 'activity', name: 'Log Aktivitas', icon: BarChart3 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLeftTab(tab.id)}
                      className={`${
                        activeLeftTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="mt-6">
                {/* Account Detail Tab */}
                {activeLeftTab === 'account' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun Detail</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Bergabung</p>
                              <p className="text-xs text-gray-600">Tanggal registrasi</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-blue-700">
                            {new Date(completeProfile.profile.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        {completeProfile.statistics.lastLogin && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Activity className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Terakhir Login</p>
                                <p className="text-xs text-gray-600">Login terakhir</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-green-700">
                              {new Date(completeProfile.statistics.lastLogin).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Username</p>
                              <p className="text-xs text-gray-600">Nama pengguna</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-purple-700">{completeProfile.profile.username}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Shield className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Status Keamanan</p>
                              <p className="text-xs text-gray-600">Verifikasi akun</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            completeProfile.profile.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {completeProfile.profile.is_active ? 'Terverifikasi' : 'Belum Verifikasi'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sessions Tab */}
                {activeLeftTab === 'sessions' && (
                  <SessionsList sessions={completeProfile.sessions} />
                )}
                
                {/* Activity Tab */}
                {activeLeftTab === 'activity' && (
                  <AuditLogsList auditLogs={completeProfile.auditLogs} />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Forms Section */}
        <div className="lg:w-1/2 bg-white">
          <div className="p-6 lg:p-8 h-full overflow-y-auto">
            <div className="max-w-none space-y-8">
              {/* Form Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                  {[
                    { id: 'profile', name: 'Profil', icon: User },
                    { id: 'security', name: 'Keamanan', icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Profile Form */}
              {activeTab === 'profile' && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <span>Informasi Profil</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Kelola informasi pribadi dan kontak Anda</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ProfileForm 
                      profile={completeProfile.profile}
                      onUpdate={updateProfile}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Security Form */}
              {activeTab === 'security' && (
                <PasswordChangeForm onChangePassword={changePassword} />
              )}
              
              {/* Tenant Information with Tabs */}
              <div className="space-y-6">
                {/* Tenant Tabs Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8" aria-label="Tenant Tabs">
                    {[
                      { id: 'info', name: 'Informasi Tenant', icon: Building2 },
                      { id: 'contact', name: 'Kontak & Alamat', icon: Mail },
                      { id: 'capacity', name: 'Batas & Kapasitas', icon: Store },
                      { id: 'status', name: 'Status Tenant', icon: Shield },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTenantTab(tab.id)}
                        className={`${
                          activeTenantTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tenant Tab Content */}
                <div className="mt-6">
                  {/* Tenant Info Tab */}
                  {activeTenantTab === 'info' && (
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                          <span>Informasi Tenant</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{completeProfile.profile.nama_tenant || 'Tidak Ada Tenant'}</h3>
                            <p className="text-gray-600">ID Tenant: {completeProfile.profile.tenant_id || 'N/A'}</p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                            <Package className="w-3 h-3 mr-1" />
                            {completeProfile.profile.paket_tenant || 'Basic'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contact & Address Tab */}
                  {activeTenantTab === 'contact' && (
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle>Kontak & Alamat</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{completeProfile.profile.email_tenant || 'Tidak tersedia'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Telepon</p>
                              <p className="font-medium">{completeProfile.profile.telepon_tenant || 'Tidak tersedia'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Alamat</p>
                            <p className="font-medium">{completeProfile.profile.alamat_tenant || 'Tidak tersedia'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Capacity Tab */}
                  {activeTenantTab === 'capacity' && (
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle>Batas & Kapasitas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Store className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Maksimal Toko</p>
                              <p className="text-2xl font-bold text-blue-600">{completeProfile.profile.max_toko || 0}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Maksimal Pengguna</p>
                              <p className="text-2xl font-bold text-green-600">{completeProfile.profile.max_pengguna || 0}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Status Tab */}
                  {activeTenantTab === 'status' && (
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle>Status Tenant</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status Akun:</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              completeProfile.profile.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {completeProfile.profile.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Paket Berlangganan:</span>
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {completeProfile.profile.paket_tenant || 'Basic'}
                            </div>
                          </div>
                          
                          {completeProfile.profile.is_super_admin && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Hak Akses:</span>
                              <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1">
                                <Shield className="w-3 h-3 mr-1" />
                                Super Administrator
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
