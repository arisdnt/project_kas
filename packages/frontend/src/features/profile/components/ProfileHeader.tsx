import React from 'react'
import { Badge } from '@/core/components/ui/badge'
import { User, Shield } from 'lucide-react'
import { CompleteProfileData } from '../types/profile.types'

interface ProfileHeaderProps {
  profile: CompleteProfileData['profile']
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          {profile.foto_profil ? (
            <img 
              src={profile.foto_profil} 
              alt={profile.nama_lengkap}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-500" />
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">{profile.nama_lengkap}</h2>
        <p className="text-gray-600">{profile.email}</p>
        
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant={profile.is_active ? "default" : "secondary"}>
            {profile.is_active ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
          
          {profile.is_super_admin && (
            <Badge variant="destructive">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          )}
          
          {profile.nama_peran && (
            <Badge variant="outline">
              {profile.nama_peran}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}