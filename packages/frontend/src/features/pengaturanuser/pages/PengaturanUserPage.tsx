import React, { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Badge } from '@/core/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import {
  User,
  Edit,
  Shield,
  Activity,
  Key,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/core/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  status: 'aktif' | 'nonaktif' | 'suspended' | 'cuti';
  peran?: {
    id: string;
    nama: string;
    level: number;
    deskripsi?: string;
  };
  toko?: {
    id: string;
    nama: string;
    kode: string;
  };
  last_login?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

interface UserStats {
  total_transactions_today: number;
  total_sales_today: number;
  total_transactions_month: number;
  total_sales_month: number;
  commission_earned_month: number;
}

interface UpdateProfileData {
  username?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function PengaturanUserPage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateProfileData>({});
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pengaturanuser/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
        setUpdateData({ username: data.data.username });
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStats = async () => {
    if (!userProfile) return;

    try {
      const response = await fetch(`/api/pengaturanuser/${userProfile.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/pengaturanuser/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
        setIsEditingProfile(false);
        fetchMyProfile();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/pengaturanuser/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(passwordData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully"
        });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to change password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    }
  };


  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aktif': return 'default';
      case 'nonaktif': return 'secondary';
      case 'suspended': return 'destructive';
      case 'cuti': return 'outline';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchMyStats();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-2">Kelola informasi akun dan preferensi personal Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>

                {userProfile && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {userProfile.username}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {userProfile.peran?.nama || 'No Role Assigned'}
                    </p>
                    <div className="mt-3">
                      <Badge variant={getStatusBadgeVariant(userProfile.status)}>
                        {userProfile.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Toko</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {userProfile?.toko?.nama || 'Tidak ada toko'}
                  </div>
                  {userProfile?.toko?.kode && (
                    <div className="text-xs text-gray-500">Kode: {userProfile.toko.kode}</div>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {userProfile?.last_login ? formatDate(userProfile.last_login) : 'Belum pernah login'}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {userProfile ? formatDate(userProfile.dibuat_pada) : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Management */}
          <div className="lg:col-span-2">
            {userProfile ? (
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="w-4 h-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="password" className="gap-2">
                    <Key className="w-4 h-4" />
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2">
                    <Activity className="w-4 h-4" />
                    Statistik
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold">Informasi Profil</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        {isEditingProfile ? 'Batal' : 'Edit'}
                      </Button>
                    </div>

                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-username">Username</Label>
                          <Input
                            id="edit-username"
                            value={updateData.username || ''}
                            onChange={(e) => setUpdateData({ ...updateData, username: e.target.value })}
                            placeholder="Masukkan username baru"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setUpdateData({ username: userProfile.username });
                            }}
                          >
                            Batal
                          </Button>
                          <Button onClick={handleUpdateProfile} className="gap-2">
                            <Save className="w-4 h-4" />
                            Simpan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Username</Label>
                            <p className="text-lg font-semibold text-gray-900">{userProfile.username}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Status Akun</Label>
                            <div className="mt-1">
                              <Badge variant={getStatusBadgeVariant(userProfile.status)}>
                                {userProfile.status}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Peran</Label>
                            <p className="text-sm text-gray-900">{userProfile.peran?.nama || 'Tidak ada peran'}</p>
                            {userProfile.peran?.deskripsi && (
                              <p className="text-xs text-gray-500 mt-1">{userProfile.peran.deskripsi}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Toko</Label>
                            <p className="text-sm text-gray-900">{userProfile.toko?.nama || 'Tidak ada toko'}</p>
                            {userProfile.toko?.kode && (
                              <p className="text-xs text-gray-500">Kode: {userProfile.toko.kode}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Bergabung Sejak</Label>
                            <p className="text-sm text-gray-900">{formatDate(userProfile.dibuat_pada)}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</Label>
                            <p className="text-sm text-gray-900">{formatDate(userProfile.diperbarui_pada)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="password" className="space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Pastikan password baru Anda aman dan mudah diingat.
                    </p>

                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Password Saat Ini</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          placeholder="Masukkan password saat ini"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">Password Baru</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          placeholder="Masukkan password baru"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          placeholder="Konfirmasi password baru"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPasswordData({
                            current_password: '',
                            new_password: '',
                            confirm_password: ''
                          })}
                        >
                          Reset
                        </Button>
                        <Button onClick={handleChangePassword} className="gap-2">
                          <Key className="w-4 h-4" />
                          Ubah Password
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Statistik Performa Saya</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMyStats}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </Button>
                    </div>

                    {userStats ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-600">Transaksi Hari Ini</div>
                          <div className="text-2xl font-bold text-blue-900 mt-1">
                            {userStats.total_transactions_today}
                          </div>
                          <div className="text-sm text-blue-600 mt-1">
                            {formatCurrency(userStats.total_sales_today)}
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="text-sm font-medium text-green-600">Transaksi Bulan Ini</div>
                          <div className="text-2xl font-bold text-green-900 mt-1">
                            {userStats.total_transactions_month}
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            {formatCurrency(userStats.total_sales_month)}
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="text-sm font-medium text-purple-600">Komisi Bulan Ini</div>
                          <div className="text-2xl font-bold text-purple-900 mt-1">
                            {formatCurrency(userStats.commission_earned_month)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p>Memuat statistik...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* Loading State */
              <div className="bg-white rounded-lg border p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Memuat Profil</h3>
                <p className="text-gray-500">
                  Sedang mengambil data profil Anda...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}