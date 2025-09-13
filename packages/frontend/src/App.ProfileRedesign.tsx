import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock profile components for preview
import { Card, CardContent, CardHeader, CardTitle } from './core/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './core/components/ui/tabs'
import { Badge } from './core/components/ui/badge'
import { Button } from './core/components/ui/button'
import { Input } from './core/components/ui/input'
import { Label } from './core/components/ui/label'
import { 
  User, Settings, BarChart3, Monitor, Building2, Shield, Activity, 
  Camera, Mail, Phone, Calendar, MapPin, Clock, TrendingUp, Database,
  Users, Edit, Save, X, AlertCircle, CheckCircle
} from 'lucide-react'

// Mock data
const mockProfile = {
  id: "1",
  username: "admin",
  email: "admin@kasirpro.com",
  nama_lengkap: "Administrator Sistem",
  telepon: "+62 812-3456-7890",
  foto_profil: null,
  is_active: "1",
  is_super_admin: 1,
  created_at: "2024-01-15T08:30:00Z",
  updated_at: "2024-12-20T10:15:00Z",
  nama_tenant: "PT. Teknologi Kasir Indonesia",
  nama_toko: "Toko Pusat Jakarta",
  nama_peran: "Super Administrator"
};

const mockStatistics = {
  totalSessions: 15,
  activeSessions: 2,
  lastLogin: "2024-12-20T08:00:00Z",
  totalAuditLogs: 127
};

function MockProfilePage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const statsCards = [
    {
      title: 'Total Sesi',
      value: mockStatistics.totalSessions,
      icon: Users,
      description: 'Jumlah sesi login',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700'
    },
    {
      title: 'Sesi Aktif',
      value: mockStatistics.activeSessions,
      icon: Activity,
      description: 'Sesi yang sedang aktif',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    },
    {
      title: 'Log Audit',
      value: mockStatistics.totalAuditLogs,
      icon: Database,
      description: 'Total aktivitas tercatat',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700'
    },
    {
      title: 'Status Akun',
      value: 'Aktif',
      icon: Shield,
      description: 'Super Administrator',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    }
  ]

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
                <p className="text-gray-600 mt-1">Kelola informasi akun dan pengaturan keamanan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header Card */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </Button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 mt-4 sm:mt-0 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{mockProfile.nama_lengkap}</h2>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Aktif
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Super Admin
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {mockProfile.nama_peran}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{mockProfile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Telepon</p>
                        <p className="text-sm font-medium text-gray-900">{mockProfile.telepon}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Bergabung</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(mockProfile.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Tenant</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{mockProfile.nama_tenant}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Toko</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{mockProfile.nama_toko}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Username</p>
                        <p className="text-sm font-medium text-gray-900">{mockProfile.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <div className="border-b border-gray-200 mb-8">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center justify-center space-x-2 px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none bg-transparent"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profil</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tenant" 
                  className="flex items-center justify-center space-x-2 px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none bg-transparent"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Tenant</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center justify-center space-x-2 px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none bg-transparent"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Keamanan</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions" 
                  className="flex items-center justify-center space-x-2 px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none bg-transparent"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Sesi Login</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="flex items-center justify-center space-x-2 px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none bg-transparent"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Aktivitas</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-8">
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

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span>Informasi Profil</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Kelola informasi pribadi dan kontak Anda</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Nama Lengkap</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={mockProfile.nama_lengkap}
                          disabled={true}
                          className="pl-4 pr-4 py-3 bg-gray-50 text-gray-700 border-gray-300"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>Email</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={mockProfile.email}
                          disabled={true}
                          className="pl-4 pr-4 py-3 bg-gray-50 text-gray-700 border-gray-300"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>Telepon</span>
                        </Label>
                        <Input
                          id="phone"
                          value={mockProfile.telepon}
                          disabled={true}
                          className="pl-4 pr-4 py-3 bg-gray-50 text-gray-700 border-gray-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Username</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="username"
                            value={mockProfile.username}
                            disabled={true}
                            className="pl-4 pr-4 py-3 bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Username tidak dapat diubah</p>
                      </div>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Informasi Penting</h4>
                            <p className="text-sm text-blue-700">
                              Pastikan informasi profil Anda selalu terbaru untuk memudahkan komunikasi dan verifikasi akun.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <Button 
                        type="button" 
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other tabs content placeholder */}
            <TabsContent value="tenant">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Tenant</h3>
                  <p className="text-gray-600">Konten informasi tenant akan ditampilkan di sini</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pengaturan Keamanan</h3>
                  <p className="text-gray-600">Form ubah password dan pengaturan keamanan</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sessions">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sesi Login</h3>
                  <p className="text-gray-600">Daftar sesi login aktif dan riwayat</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Log Aktivitas</h3>
                  <p className="text-gray-600">Riwayat aktivitas dan audit log</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen">
        <MockProfilePage />
      </div>
    </BrowserRouter>
  );
}