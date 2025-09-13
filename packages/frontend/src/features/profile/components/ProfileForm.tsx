import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Card, CardContent } from '@/core/components/ui/card'
import { Edit, Save, X, User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { CompleteProfileData, ProfileFormData, UpdateProfileRequest } from '../types/profile.types'

interface ProfileFormProps {
  profile: CompleteProfileData['profile']
  onUpdate: (data: UpdateProfileRequest) => Promise<boolean>
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setFormData({
      fullName: profile.nama_lengkap || '',
      email: profile.email || '',
      phone: profile.telepon || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }, [profile])

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      setFormData({
        fullName: profile.nama_lengkap || '',
        email: profile.email || '',
        phone: profile.telepon || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setSuccess(false)
    }
    setIsEditing(!isEditing)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)
    
    const success = await onUpdate({
      nama_lengkap: formData.fullName,
      email: formData.email,
      telepon: formData.phone
    })
    
    if (success) {
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setLoading(false)
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Profil berhasil diperbarui!</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full Name Field */}
        <div className="space-y-3">
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>Nama Lengkap</span>
          </Label>
          <div className="relative">
            <Input
              id="fullName"
              value={isEditing ? formData.fullName : profile.nama_lengkap}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={!isEditing}
              className={`pl-4 pr-4 py-3 ${!isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Masukkan nama lengkap"
            />
          </div>
        </div>
        
        {/* Email Field */}
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>Email</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={isEditing ? formData.email : profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={`pl-4 pr-4 py-3 ${!isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Masukkan alamat email"
            />
          </div>
        </div>
        
        {/* Phone Field */}
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span>Telepon</span>
          </Label>
          <div className="relative">
            <Input
              id="phone"
              value={isEditing ? formData.phone : (profile.telepon || '')}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className={`pl-4 pr-4 py-3 ${!isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Masukkan nomor telepon"
            />
          </div>
        </div>

        {/* Username Field (Read-only) */}
        <div className="space-y-3">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>Username</span>
          </Label>
          <div className="relative">
            <Input
              id="username"
              value={profile.username}
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

      {/* Additional Information Card */}
      {!isEditing && (
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
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        {isEditing ? (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleEditToggle}
              disabled={loading}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            onClick={handleEditToggle}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        )}
      </div>
    </div>
  )
}