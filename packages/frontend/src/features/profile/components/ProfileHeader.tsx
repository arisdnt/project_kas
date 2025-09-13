import React from 'react'
import { User, Shield, Camera, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import { CompleteProfileData } from '../types/profile.types'

interface ProfileHeaderProps {
  profile: CompleteProfileData['profile']
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 border-2 border-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.foto_profil ? (
                    <img 
                      src={profile.foto_profil} 
                      alt={profile.nama_lengkap}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                  <Camera className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.nama_lengkap}</h1>
                <p className="text-gray-600 mt-1">@{profile.username}</p>
                
                {/* Status Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.is_active 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </div>
                  
                  {profile.is_super_admin && (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Super Admin</span>
                    </div>
                  )}
                  
                  {profile.nama_peran && (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {profile.nama_peran}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-900 font-medium">{profile.email}</p>
            </div>
          </div>

          {profile.telepon && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                <p className="text-sm text-gray-900 font-medium">{profile.telepon}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Member Since</p>
              <p className="text-sm text-gray-900 font-medium">{formatDate(profile.created_at)}</p>
            </div>
          </div>

          {profile.nama_tenant && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Organization</p>
                <p className="text-sm text-gray-900 font-medium">{profile.nama_tenant}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}