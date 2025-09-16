import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import { Notification } from '@/core/components/ui/notification';
import { User, Settings, Loader2 } from 'lucide-react';
import { ProfilInfo, ProfilForm, TenantInfoCard, TokoInfoCard } from '../components';
import { profilsayaService } from '../services/profilsayaService';
import { ProfilUser, ProfilFormData, TenantInfo, TokoInfo, TenantStats } from '../types';

export function ProfilSayaPage() {
  const [profil, setProfil] = useState<ProfilUser | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [toko, setToko] = useState<TokoInfo[] | null>(null);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data profil saat komponen dimount
  useEffect(() => {
    loadAllData();
  }, []);

  // Fungsi untuk memuat semua data
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load data secara parallel
      const [profilResponse, tenantResponse, tokoResponse, statsResponse] = await Promise.allSettled([
        profilsayaService.getMyProfile(),
        profilsayaService.getTenantInfo(),
        profilsayaService.getTokoInfo(),
        profilsayaService.getTenantStats()
      ]);

      // Handle profil response
      if (profilResponse.status === 'fulfilled' && profilResponse.value.success) {
        setProfil(profilResponse.value.data || null);
      } else if (profilResponse.status === 'fulfilled') {
        console.warn('Failed to load profile:', profilResponse.value.message);
      }

      // Handle tenant response
      if (tenantResponse.status === 'fulfilled' && tenantResponse.value.success) {
        setTenant(tenantResponse.value.data || null);
      } else if (tenantResponse.status === 'fulfilled') {
        console.warn('Failed to load tenant:', tenantResponse.value.message);
      }

      // Handle toko response
      if (tokoResponse.status === 'fulfilled' && tokoResponse.value.success) {
        setToko(tokoResponse.value.data || null);
      } else if (tokoResponse.status === 'fulfilled') {
        console.warn('Failed to load toko:', tokoResponse.value.message);
      }

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        setTenantStats(statsResponse.value.data || null);
      } else if (statsResponse.status === 'fulfilled') {
        console.warn('Failed to load stats:', statsResponse.value.message);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk update profil
  const handleUpdateProfil = async (formData: ProfilFormData) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Transform formData untuk API
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender === '' ? undefined : formData.gender as 'L' | 'P',
        position: formData.position || undefined,
        department: formData.department || undefined
      };

      const response = await profilsayaService.updateMyProfile(updateData);
      
      if (response.success && response.data) {
        setProfil(response.data);
      } else {
        throw new Error(response.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profil:', error);
      throw error; // Re-throw untuk ditangani oleh ProfilForm
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Memuat data profil...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profil) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Profil Saya</h1>
        </div>
        
        <Notification
          variant="error"
          title="Error"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Profil Saya</h1>
      </div>

      {/* Error notification jika ada */}
      {error && (
        <Notification
          variant="error"
          title="Error"
          description={error}
          onDelete={() => setError(null)}
        />
      )}

      {/* Layout Grid */}
      <div className="space-y-6">
        {/* Baris Pertama - Informasi Profil dan Edit Profil */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri - Informasi Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfilInfo profil={profil} loading={isLoading} />
            </CardContent>
          </Card>

          {/* Kolom Kanan - Form Edit Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Edit Profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfilForm
                profil={profil}
                onSubmit={handleUpdateProfil}
                isLoading={isUpdating}
              />
            </CardContent>
          </Card>
        </div>

        {/* Baris Kedua - Informasi Tenant dan Toko */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi Tenant */}
          <TenantInfoCard
            tenant={tenant}
            stats={tenantStats}
            loading={isLoading}
          />

          {/* Informasi Toko */}
          <TokoInfoCard
            toko={toko}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}