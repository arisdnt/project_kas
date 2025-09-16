// Komponen untuk menampilkan data profil user
import { Card } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { ProfileCardProps } from '../types';

/**
 * Komponen untuk menampilkan informasi profil user
 */
export const ProfileCard = ({ profile, isLoading = false }: ProfileCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Jika profile null atau undefined, tampilkan pesan error
  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p>Data profil tidak tersedia</p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'default';
      case 'nonaktif':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'cuti':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Profil Pengguna
          </h3>
          <Badge variant={getStatusBadgeVariant(profile.status || 'nonaktif')}>
            {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Tidak Diketahui'}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Username</span>
            <span className="text-base text-gray-900">{profile.username || 'Tidak tersedia'}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">ID Pengguna</span>
            <span className="text-sm text-gray-600 font-mono">{profile.id || 'Tidak tersedia'}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Login Terakhir</span>
            <span className="text-sm text-gray-600">
              {profile.last_login ? formatDate(profile.last_login) : 'Belum pernah login'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Dibuat Pada</span>
            <span className="text-sm text-gray-600">
              {profile.dibuat_pada ? formatDate(profile.dibuat_pada) : 'Tidak tersedia'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Diperbarui Pada</span>
            <span className="text-sm text-gray-600">
              {profile.diperbarui_pada ? formatDate(profile.diperbarui_pada) : 'Tidak tersedia'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};