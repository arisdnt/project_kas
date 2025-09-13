import { useState, useEffect } from 'react'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'
import { CompleteProfileData, ProfileFormData, UpdateProfileRequest, ChangePasswordRequest } from '../types/profile.types'

export function useProfile() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [completeProfile, setCompleteProfile] = useState<CompleteProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCompleteProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${config.api.url}:${config.api.port}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setCompleteProfile(result.data)
      } else {
        setError('Gagal memuat data profil')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Terjadi kesalahan saat memuat profil')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${config.api.url}:${config.api.port}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        await fetchCompleteProfile()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const changePassword = async (data: ChangePasswordRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${config.api.url}:${config.api.port}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      return response.ok
    } catch (error) {
      console.error('Error changing password:', error)
      return false
    }
  }

  useEffect(() => {
    fetchCompleteProfile()
  }, [])

  return {
    loading,
    completeProfile,
    error,
    fetchCompleteProfile,
    updateProfile,
    changePassword
  }
}