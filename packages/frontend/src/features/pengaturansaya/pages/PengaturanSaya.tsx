// Halaman utama pengaturan saya (versi tanpa tabs & tanpa card berlebih)
import { useState, useEffect } from 'react';
import { ProfileCard, ChangePasswordForm } from '../components';
import { getUserProfile, changePassword } from '../services/userService';
import { UserProfile, ChangePasswordRequest } from '../types';
import { useToast } from '@/core/hooks/use-toast';
import { Button } from '@/core/components/ui/button';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

/**
 * Halaman Pengaturan Saya: hanya dua bagian utama (Profil & Ubah Password) tanpa lapisan box berlebih.
 */
export const PengaturanSaya = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  // Ambil profil saat mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fungsi memuat profil
  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await getUserProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Gagal mengambil data profil',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      // Kesalahan ambil profil
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat mengambil data profil',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Ubah password
  const handleChangePassword = async (data: ChangePasswordRequest) => {
    try {
      setIsChangingPassword(true);
      const response = await changePassword(data);
      if (response.success) {
        toast({
          title: 'Berhasil',
            description: response.message || 'Password berhasil diubah'
        });
      } else {
        throw new Error(response.message || 'Gagal mengubah password');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat mengubah password',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Header page
  const Header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SlidersHorizontal className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">Pengaturan Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola profil dan keamanan akun Anda</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={loadUserProfile} disabled={isLoadingProfile} className="gap-1">
          <RefreshCw className={"h-4 w-4" + (isLoadingProfile ? ' animate-spin' : '')} />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {Header}
      {/* Layout grid sederhana tanpa tabs */}
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-1 space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Informasi Profil</h2>
            <ProfileCard profile={profile} isLoading={isLoadingProfile} />
          </div>
        </div>
        <div className="xl:col-span-2 space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Ubah Password</h2>
            <p className="text-xs text-muted-foreground -mt-1">Gunakan password yang kuat dan tidak digunakan di layanan lain.</p>
            <ChangePasswordForm onSubmit={handleChangePassword} isLoading={isChangingPassword} />
          </div>
        </div>
      </div>
    </div>
  );
};