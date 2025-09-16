import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/ui/card';
import { Notification } from '@/core/components/ui/notification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { User, Settings, Loader2, RefreshCw, Store } from 'lucide-react';
import { ProfilInfo, ProfilForm, TenantInfoCard, TokoInfoCard } from '../components';
import { profilsayaService } from '../services/profilsayaService';
import { ProfilUser, ProfilFormData, TenantInfo, TokoInfo, TenantStats } from '../types';
import { ProfileAvatar } from '../components/ui/profile-avatar';
import { Button } from '@/core/components/ui/button';

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
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        telepon: formData.telepon || undefined,
        alamat: formData.alamat || undefined,
        tanggal_lahir: formData.tanggal_lahir || undefined,
        jenis_kelamin: formData.jenis_kelamin === '' ? undefined : (formData.jenis_kelamin as 'L' | 'P'),
        gaji_poko: formData.gaji_poko || undefined,
        komisi_persen: formData.komisi_persen || undefined,
        tanggal_masuk: formData.tanggal_masuk || undefined,
        tanggal_keluar: formData.tanggal_keluar || undefined
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

  const handleAvatarUpload = async (file: File) => {
    // TODO: Integrasi endpoint upload avatar bila tersedia
    console.log('Selected avatar file', file);
    // Placeholder untuk feedback UX
  };

  const skeleton = (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Memuat data...</span>
      </div>
    </div>
  );

  const PageHeader = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola informasi akun, keamanan, dan preferensi aplikasi</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={loadAllData} disabled={isLoading} className="gap-1">
          <RefreshCw className={"h-4 w-4" + (isLoading ? ' animate-spin' : '')} />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {PageHeader}

      {error && (
        <Notification
          variant="error"
          title="Error"
          description={error}
          onDelete={() => setError(null)}
        />
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Ringkasan Samping */}
          <Card className="xl:col-span-1 h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Ringkasan Akun</CardTitle>
              <CardDescription>Identitas singkat dan status tenant</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center gap-4">
                <ProfileAvatar
                  name={profil?.nama_lengkap}
                  src={undefined}
                  editable
                  size="xl"
                  onChangeFile={handleAvatarUpload}
                />
                <div className="text-center space-y-1">
                  <p className="font-medium text-lg leading-tight">{profil?.nama_lengkap || '—'}</p>
                  <p className="text-sm text-muted-foreground">{profil?.email || '—'}</p>
                  {tenant && (
                    <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-background/50">
                      Tenant: {tenant.nama}
                    </div>
                  )}
                </div>
                <div className="w-full space-y-3 pt-2">
                  <TenantInfoCard tenant={tenant} stats={tenantStats} loading={isLoading} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nested Tabs untuk konten utama */}
          <div className="space-y-6 xl:col-span-2">
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="info" className="gap-1"><User className="h-4 w-4" /> <span>Informasi Profil</span></TabsTrigger>
                <TabsTrigger value="edit" className="gap-1"><Settings className="h-4 w-4" /> <span>Edit Profil</span></TabsTrigger>
                <TabsTrigger value="toko" className="gap-1"><Store className="h-4 w-4" /> <span>Informasi Toko</span></TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Informasi Profil</CardTitle>
                    <CardDescription>Data personal yang dapat dilihat oleh tim internal Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? skeleton : <ProfilInfo profil={profil} loading={isLoading} />}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="edit" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Edit Profil</CardTitle>
                    <CardDescription>Perbarui informasi akun Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ProfilForm
                      profil={profil}
                      onSubmit={handleUpdateProfil}
                      isLoading={isUpdating}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="toko" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2"><Store className="h-4 w-4" /> Informasi Toko</CardTitle>
                    <CardDescription>Daftar toko yang terasosiasi dengan akun Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <TokoInfoCard toko={toko} loading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

    </div>
  );
}