import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Key, Save } from 'lucide-react'
import { ChangePasswordRequest } from '../types/profile.types'

interface PasswordChangeFormProps {
  onChangePassword: (data: ChangePasswordRequest) => Promise<boolean>
}

export function PasswordChangeForm({ onChangePassword }: PasswordChangeFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<string[]>([])

  const validatePassword = (): boolean => {
    const newErrors: string[] = []
    
    if (!passwordData.currentPassword) {
      newErrors.push('Password lama harus diisi')
    }
    
    if (!passwordData.newPassword) {
      newErrors.push('Password baru harus diisi')
    } else if (passwordData.newPassword.length < 6) {
      newErrors.push('Password baru minimal 6 karakter')
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.push('Konfirmasi password tidak cocok')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword()) {
      return
    }
    
    setLoading(true)
    
    const success = await onChangePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
    
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors([])
    } else {
      setErrors(['Gagal mengubah password. Periksa password lama Anda.'])
    }
    
    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Key className="w-5 h-5 text-red-600" />
          <span>Keamanan Akun</span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Kelola password dan pengaturan keamanan</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Lama</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              disabled={loading}
            />
          </div>
          
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <Button type="submit" disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Mengubah Password...' : 'Ubah Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
