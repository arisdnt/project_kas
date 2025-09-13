import { useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Badge } from '@/core/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Camera,
  Save,
  Key,
  Edit3,
  X,
  Loader2
} from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { ProfileFormData, PasswordChangeData } from '../types/profile'

export function ProfilePage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [tempProfileData, setTempProfileData] = useState<ProfileFormData>({
    fullName: user?.nama || '',
    email: user?.email || '',
    telepon: '',
    alamat: ''
  })
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fullName: user?.nama || '',
    email: user?.email || '',
    telepon: '',
    alamat: ''
  })

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  })

  const handleEditToggle = () => {
    if (editMode) {
      setTempProfileData({ ...profileData })
    } else {
      setTempProfileData({ ...profileData })
    }
    setEditMode(!editMode)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfileData({ ...tempProfileData })
      setEditMode(false)
      console.log('Profile updated:', tempProfileData)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.passwordBaru !== passwordData.konfirmasiPassword) {
      alert('Password baru dan konfirmasi password tidak cocok')
      return
    }

    if (passwordData.passwordBaru.length < 6) {
      alert('Password baru minimal 6 karakter')
      return
    }

    setIsChangingPassword(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordData({
        passwordLama: '',
        passwordBaru: '',
        konfirmasiPassword: ''
      })
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header - Full Width */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between max-w-none">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 truncate">Profile</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola informasi akun Anda</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditToggle}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {editMode ? (
                <>
                  <X className="h-4 w-4" />
                  Batal
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full space-y-6">
          {/* Profile Header - Full Width */}
          <div className="w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-6 w-full">
              <div className="relative group flex-shrink-0">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {(user?.nama || user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-3 w-3 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {user?.nama || user?.username}
                    </h2>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      <Shield className="h-3 w-3 mr-1" />
                      {user?.peran || 'User'}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 truncate">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Status: Aktif</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content - Full Width */}
          <Tabs defaultValue="informasi" className="w-full space-y-4">
            <div className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="informasi" className="text-sm">
                  Informasi Pribadi
                </TabsTrigger>
                <TabsTrigger value="keamanan" className="text-sm">
                  Keamanan
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="informasi" className="w-full">
              <form onSubmit={handleProfileUpdate} className="w-full space-y-6">
                <div className="w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <div className="w-full space-y-6">
                    {/* Form Fields - Responsive Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2 w-full">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          Nama Lengkap
                        </Label>
                        <div className="relative w-full">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            type="text"
                            value={editMode ? tempProfileData.fullName : profileData.fullName}
                            onChange={(e) => setTempProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                            disabled={!editMode}
                            className={`pl-10 w-full ${editMode ? 'border-blue-200 focus:border-blue-500' : 'bg-gray-50'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 w-full">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <div className="relative w-full">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={editMode ? tempProfileData.email : profileData.email}
                            onChange={(e) => setTempProfileData(prev => ({ ...prev, email: e.target.value }))}
                            disabled={!editMode}
                            className={`pl-10 w-full ${editMode ? 'border-blue-200 focus:border-blue-500' : 'bg-gray-50'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 w-full">
                        <Label htmlFor="telepon" className="text-sm font-medium text-gray-700">
                          No. Telepon
                        </Label>
                        <div className="relative w-full">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="telepon"
                            type="tel"
                            value={editMode ? tempProfileData.telepon || '' : profileData.telepon || ''}
                            onChange={(e) => setTempProfileData(prev => ({ ...prev, telepon: e.target.value }))}
                            disabled={!editMode}
                            placeholder="Opsional"
                            className={`pl-10 w-full ${editMode ? 'border-blue-200 focus:border-blue-500' : 'bg-gray-50'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 w-full">
                        <Label htmlFor="alamat" className="text-sm font-medium text-gray-700">
                          Alamat
                        </Label>
                        <div className="relative w-full">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="alamat"
                            type="text"
                            value={editMode ? tempProfileData.alamat || '' : profileData.alamat || ''}
                            onChange={(e) => setTempProfileData(prev => ({ ...prev, alamat: e.target.value }))}
                            disabled={!editMode}
                            placeholder="Opsional"
                            className={`pl-10 w-full ${editMode ? 'border-blue-200 focus:border-blue-500' : 'bg-gray-50'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 w-full" />

                    {/* Action Buttons */}
                    {editMode && (
                      <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEditToggle}
                          disabled={isLoading}
                          className="px-6 w-full sm:w-auto"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 flex items-center gap-2 w-full sm:w-auto"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Simpan Perubahan
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="keamanan" className="w-full">
              <div className="w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <form onSubmit={handlePasswordChange} className="w-full space-y-6">
                  <div className="w-full space-y-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="passwordLama" className="text-sm font-medium text-gray-700">
                        Password Saat Ini
                      </Label>
                      <div className="relative w-full">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="passwordLama"
                          type="password"
                          value={passwordData.passwordLama}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, passwordLama: e.target.value }))}
                          className="pl-10 w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="passwordBaru" className="text-sm font-medium text-gray-700">
                        Password Baru
                      </Label>
                      <div className="relative w-full">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="passwordBaru"
                          type="password"
                          value={passwordData.passwordBaru}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, passwordBaru: e.target.value }))}
                          className="pl-10 w-full"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Password minimal 6 karakter</p>
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="konfirmasiPassword" className="text-sm font-medium text-gray-700">
                        Konfirmasi Password Baru
                      </Label>
                      <div className="relative w-full">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="konfirmasiPassword"
                          type="password"
                          value={passwordData.konfirmasiPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, konfirmasiPassword: e.target.value }))}
                          className="pl-10 w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 w-full" />

                    <div className="flex justify-end w-full">
                      <Button 
                        type="submit" 
                        disabled={isChangingPassword} 
                        className="px-6 flex items-center gap-2 w-full sm:w-auto"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mengubah...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4" />
                            Ubah Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          {/* Account Information - Full Width */}
          <div className="w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-full">
                <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">Username</p>
                  <p className="text-sm text-gray-600 truncate">{user?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-full">
                <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <p className="text-sm text-gray-600 truncate">{user?.peran || 'User'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-full sm:col-span-2 lg:col-span-1">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600 truncate">Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}