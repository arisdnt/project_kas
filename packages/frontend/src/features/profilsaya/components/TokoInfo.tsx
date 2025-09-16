/**
 * Komponen untuk menampilkan informasi toko
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Store, MapPin, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { TokoInfo } from '../types';

interface TokoInfoCardProps {
  toko: TokoInfo[] | null;
  loading?: boolean;
}

export function TokoInfoCard({ toko, loading = false }: TokoInfoCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Informasi Toko</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!toko || toko.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Informasi Toko</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <Store className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Tidak ada data toko tersedia</p>
          </div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span>Informasi Toko ({toko.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {toko.map((tokoItem, index) => (
            <div key={tokoItem.id} className={`p-4 rounded-lg border ${index !== 0 ? 'border-t border-gray-200 pt-4' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{tokoItem.nama}</h4>
                  <p className="text-sm text-gray-500">Kode: {tokoItem.kode}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(tokoItem.status)}>
                  {tokoItem.status.charAt(0).toUpperCase() + tokoItem.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {tokoItem.alamat && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tokoItem.alamat}</span>
                  </div>
                )}

                {tokoItem.telepon && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tokoItem.telepon}</span>
                  </div>
                )}

                {tokoItem.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tokoItem.email}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500">Timezone</span>
                      <p className="text-sm text-gray-700">{tokoItem.timezone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500">Mata Uang</span>
                      <p className="text-sm text-gray-700">{tokoItem.mata_uang}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 text-xs text-gray-500">
                  <p>Dibuat: {formatDate(tokoItem.dibuat_pada)}</p>
                  <p>Diperbarui: {formatDate(tokoItem.diperbarui_pada)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}