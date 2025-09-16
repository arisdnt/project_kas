/**
 * Komponen untuk menampilkan informasi toko
 */

import { Badge } from '@/core/components/ui/badge';
import { Store } from 'lucide-react';
import { TokoInfo } from '../types';

interface TokoInfoCardProps {
  toko: TokoInfo[] | null;
  loading?: boolean;
}

export function TokoInfoCard({ toko, loading = false }: TokoInfoCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!toko || toko.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <Store className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>Tidak ada data toko tersedia</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'default';
      case 'nonaktif':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'secondary';
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] table-auto text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground border-b">
            <th className="py-3 px-3">Nama</th>
            <th className="py-3 px-3">Kode</th>
            <th className="py-3 px-3">Alamat</th>
            <th className="py-3 px-3">Telepon</th>
            <th className="py-3 px-3">Email</th>
            <th className="py-3 px-3">Timezone</th>
            <th className="py-3 px-3">Mata Uang</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-3">Dibuat / Diperbarui</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {toko.map((tokoItem) => (
            <tr key={tokoItem.id} className="align-top">
              <td className="py-3 px-3">
                <div className="font-medium">{tokoItem.nama}</div>
              </td>
              <td className="py-3 px-3 text-muted-foreground">{tokoItem.kode}</td>
              <td className="py-3 px-3">{tokoItem.alamat || '—'}</td>
              <td className="py-3 px-3">{tokoItem.telepon || '—'}</td>
              <td className="py-3 px-3">{tokoItem.email || '—'}</td>
              <td className="py-3 px-3">{tokoItem.timezone}</td>
              <td className="py-3 px-3">{tokoItem.mata_uang}</td>
              <td className="py-3 px-3">
                <Badge variant={getStatusBadgeVariant(tokoItem.status)}>
                  {tokoItem.status.charAt(0).toUpperCase() + tokoItem.status.slice(1)}
                </Badge>
              </td>
              <td className="py-3 px-3 text-xs text-muted-foreground">
                <div>D: {formatDate(tokoItem.dibuat_pada)}</div>
                <div>U: {formatDate(tokoItem.diperbarui_pada)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}