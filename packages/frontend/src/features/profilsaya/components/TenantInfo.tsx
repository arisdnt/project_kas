/**
 * Komponen untuk menampilkan informasi tenant
 */

import { Badge } from '@/core/components/ui/badge';
import { Building, Users, Database } from 'lucide-react';
import { TenantInfo, TenantStats } from '../types';

interface TenantInfoCardProps {
  tenant: TenantInfo | null;
  stats?: TenantStats | null;
  loading?: boolean;
}

export function TenantInfoCard({ tenant, stats, loading = false }: TenantInfoCardProps) {
  if (loading) {
    return (
      <div className="p-2">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-4 text-center text-gray-500">Data tenant tidak tersedia</div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'default';
      case 'nonaktif':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaketBadgeVariant = (paket: string) => {
    switch (paket) {
      case 'enterprise':
        return 'default';
      case 'premium':
        return 'secondary';
      case 'basic':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          <div className="font-medium">Informasi Tenant</div>
        </div>
        <div className="flex space-x-2">
          <Badge variant={getStatusBadgeVariant(tenant.status)}>
            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
          </Badge>
          <Badge variant={getPaketBadgeVariant(tenant.paket)}>
            {tenant.paket.charAt(0).toUpperCase() + tenant.paket.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Nama Tenant</span>
          <p className="text-base font-semibold text-gray-900">{tenant.nama}</p>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Email</span>
          <p className="text-sm text-gray-700">{tenant.email}</p>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Telepon</span>
          <p className="text-sm text-gray-700">{tenant.telepon}</p>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Alamat</span>
          <p className="text-sm text-gray-700">{tenant.alamat}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Max Toko</span>
            <p className="text-sm text-gray-700">{tenant.max_toko}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Max Pengguna</span>
            <p className="text-sm text-gray-700">{tenant.max_pengguna}</p>
          </div>
        </div>

        {stats && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Statistik</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Building className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-lg font-semibold text-gray-900">{stats.total_toko}</span>
                </div>
                <p className="text-xs text-gray-500">Toko</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-lg font-semibold text-gray-900">{stats.total_pengguna}</span>
                </div>
                <p className="text-xs text-gray-500">Pengguna</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Database className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-lg font-semibold text-gray-900">{stats.total_transaksi}</span>
                </div>
                <p className="text-xs text-gray-500">Transaksi</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4 text-xs text-gray-500">
          <p>Dibuat: {formatDate(tenant.dibuat_pada)}</p>
          <p>Diperbarui: {formatDate(tenant.diperbarui_pada)}</p>
        </div>
      </div>
    </div>
  );
}