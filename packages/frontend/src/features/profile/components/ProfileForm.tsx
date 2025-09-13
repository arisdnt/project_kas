import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Edit, Save, X } from 'lucide-react'
import { CompleteProfileData, ProfileFormData, UpdateProfileRequest } from '../types/profile.types'

interface ProfileFormProps {
  profile: CompleteProfileData['profile']
  onUpdate: (data: UpdateProfileRequest) => Promise<boolean>
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
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
    }
    setIsEditing(!isEditing)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    const success = await onUpdate({
      nama_lengkap: formData.fullName,
      email: formData.email,
      telepon: formData.phone
    })
    
    if (success) {
      setIsEditing(false)
    }
    
    setLoading(false)
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input
            id="fullName"
            value={isEditing ? formData.fullName : profile.nama_lengkap}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={isEditing ? formData.email : profile.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telepon</Label>
          <Input
            id="phone"
            value={isEditing ? formData.phone : (profile.telepon || '')}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        

      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        {isEditing ? (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleEditToggle}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={handleEditToggle}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        )}
      </div>
    </div>
  )
}