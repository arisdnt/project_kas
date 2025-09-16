/**
 * Komponen Informasi Profil
 * Menampilkan informasi profil pengguna di kolom kiri
 */

import { ProfilUser } from '../types';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  
  Clock,
  DollarSign,
  Percent,
  UserCheck,
  UserX
} from 'lucide-react';

interface ProfilInfoProps {
  profil: ProfilUser | null;
  loading: boolean;
}

export function ProfilInfo({ profil, loading }: ProfilInfoProps) {
  if (loading) {
    return (
      <div className="h-full">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="space-y-4 animate-pulse mt-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="h-full flex items-center justify-center py-8">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Data profil tidak tersedia</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return '-';
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(numAmount);
  };

  const formatPercent = (percent?: string) => {
    if (!percent) return '-';
    return `${percent}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          {profil.avatar_url ? (
            <img 
              src={profil.avatar_url} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <div className="text-xl font-semibold">{profil.nama_lengkap || 'Nama tidak tersedia'}</div>
          <p className="text-sm text-gray-600">ID: {profil.user_id}</p>
          <div className="mt-1">
            <Badge variant="default">
              {profil.jenis_kelamin === 'L' ? 'Laki-laki' : profil.jenis_kelamin === 'P' ? 'Perempuan' : 'Tidak diketahui'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Informasi Kontak */}
        <div className="grid gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <span className="text-sm">{profil.email || '-'}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <span className="text-sm">{profil.telepon || '-'}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-sm">{profil.alamat || '-'}</span>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Tanggal Lahir: {formatDate(profil.tanggal_lahir)}</span>
          </div>
        </div>

        <Separator />

        {/* Informasi Pekerjaan */}
        <div className="grid gap-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Gaji Pokok: {formatCurrency(profil.gaji_poko)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Percent className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Komisi: {formatPercent(profil.komisi_persen)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Tanggal Masuk: {formatDate(profil.tanggal_masuk)}</span>
          </div>
          
          {profil.tanggal_keluar && (
            <div className="flex items-center space-x-3">
              <UserX className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600">Tanggal Keluar: {formatDate(profil.tanggal_keluar)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Informasi Sistem */}
        <div className="grid gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Dibuat: {formatDate(profil.dibuat_pada)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Diperbarui: {formatDate(profil.diperbarui_pada)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}