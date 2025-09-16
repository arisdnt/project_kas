// Halaman utama pengaturan saya dengan layout 2 kolom
import { useState, useEffect } from 'react';
import { ProfileCard, ChangePasswordForm } from '../components';
import { getUserProfile, changePassword } from '../services/userService';
import { UserProfile, ChangePasswordRequest } from '../types';
import { useToast } from '@/core/hooks/use-toast';

/**
 * Halaman pengaturan saya dengan profil user dan form ubah password
 */
export const PengaturanSaya = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  /**
   * Mengambil data profil user saat komponen dimount
   */
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await getUserProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        console.error('Failed to load profile:', response);
        toast({
          title: 'Error',
          description: response.message || 'Gagal mengambil data profil',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat mengambil data profil',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    try {
      setIsChangingPassword(true);
      const response = await changePassword(data);
      
      if (response.success) {
        toast({
          title: 'Berhasil',
          description: response.message || 'Password berhasil diubah',
          variant: 'default'
        });
      } else {
        console.error('Failed to change password:', response);
        throw new Error(response.message || 'Gagal mengubah password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat mengubah password',
        variant: 'destructive'
      });
      throw error; // Re-throw untuk handling di form
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Saya</h1>
        <p className="text-gray-600 mt-1">
          Kelola profil dan keamanan akun Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri - Profil User */}
        <div className="space-y-6">
          <ProfileCard 
            profile={profile} 
            isLoading={isLoadingProfile} 
          />
        </div>

        {/* Kolom Kanan - Form Ubah Password */}
        <div className="space-y-6">
          <ChangePasswordForm 
            onSubmit={handleChangePassword}
            isLoading={isChangingPassword}
          />
        </div>
      </div>
    </div>
  );
};