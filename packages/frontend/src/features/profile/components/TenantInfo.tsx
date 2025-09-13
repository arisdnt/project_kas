import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Building2, Mail, Phone, MapPin, Package, Users, Store } from 'lucide-react'
import { CompleteProfileData } from '../types/profile.types'

interface TenantInfoProps {
  profile: CompleteProfileData['profile']
}

export function TenantInfo({ profile }: TenantInfoProps) {
  // Fungsi untuk format paket tenant
  const formatPaket = (paket: string) => {
    switch (paket?.toLowerCase()) {
      case 'basic':
        return { label: 'Basic', variant: 'secondary' as const }
      case 'premium':
        return { label: 'Premium', variant: 'default' as const }
      case 'enterprise':
        return { label: 'Enterprise', variant: 'destructive' as const }
      default:
        return { label: paket || 'Tidak Diketahui', variant: 'outline' as const }
    }
  }

  const paketInfo = formatPaket(profile.paket_tenant || '')

  return (
    <div className="space-y-6">
      {/* Header Tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Informasi Tenant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{profile.nama_tenant || 'Tidak Ada Tenant'}</h3>
              <p className="text-gray-600">ID Tenant: {profile.tenant_id || 'N/A'}</p>
            </div>
            <Badge variant={paketInfo.variant}>
              <Package className="w-3 h-3 mr-1" />
              {paketInfo.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detail Kontak Tenant */}
      <Card>
        <CardHeader>
          <CardTitle>Kontak & Alamat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile.email_tenant || 'Tidak tersedia'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Telepon</p>
                <p className="font-medium">{profile.telepon_tenant || 'Tidak tersedia'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Alamat</p>
              <p className="font-medium">{profile.alamat_tenant || 'Tidak tersedia'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batas & Kapasitas */}
      <Card>
        <CardHeader>
          <CardTitle>Batas & Kapasitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Store className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Maksimal Toko</p>
                <p className="text-2xl font-bold text-blue-600">{profile.max_toko || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Maksimal Pengguna</p>
                <p className="text-2xl font-bold text-green-600">{profile.max_pengguna || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tenant */}
      <Card>
        <CardHeader>
          <CardTitle>Status Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status Akun:</span>
              <Badge variant={profile.is_active ? "default" : "secondary"}>
                {profile.is_active ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Paket Berlangganan:</span>
              <Badge variant={paketInfo.variant}>
                {paketInfo.label}
              </Badge>
            </div>
            
            {profile.is_super_admin && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hak Akses:</span>
                <Badge variant="destructive">
                  Super Administrator
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}