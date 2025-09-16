import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Badge } from '@/core/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { useToast } from '@/core/hooks/use-toast'
import { Factory, Save, RefreshCw, Info, Mail, Phone, MapPin, Clock, Settings, BarChart3, Globe, DollarSign, Package, Users, AlertTriangle } from 'lucide-react'
import { useTokoStore } from './store/tokoStore'
import { TokoFormData, TokoOperatingHours } from './types/toko'

const DAYS = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
] as const

const TIMEZONES = [
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Pontianak'
]

const CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MYR', name: 'Malaysian Ringgit' }
]

const STATUS_OPTIONS = [
  { value: 'aktif', label: 'Aktif', color: 'bg-green-100 text-green-800' },
  { value: 'nonaktif', label: 'Non-aktif', color: 'bg-red-100 text-red-800' },
  { value: 'tutup_sementara', label: 'Tutup Sementara', color: 'bg-yellow-100 text-yellow-800' }
]

export function PengaturanTokoPage() {
  const { toast } = useToast()
  const {
    currentStore,
    currentStoreConfigs,
    currentStoreOperatingHours,
    currentStoreStats,
    loading,
    saving,
    loadCurrentStore,
    updateCurrentStore,
    loadCurrentStoreConfigs,
    updateStoreConfig,
    loadOperatingHours,
    updateOperatingHours,
    loadStoreStats
  } = useTokoStore()

  const [form, setForm] = useState<TokoFormData>({
    nama: '',
    kode: '',
    alamat: '',
    telepon: '',
    email: '',
    status: 'aktif',
    timezone: 'Asia/Jakarta',
    mata_uang: 'IDR',
    logo_url: ''
  })

  const [operatingHoursForm, setOperatingHoursForm] = useState<TokoOperatingHours[]>([])

  useEffect(() => {
    loadCurrentStore()
    loadCurrentStoreConfigs()
    loadOperatingHours()
    loadStoreStats()
  }, [])

  useEffect(() => {
    if (currentStore) {
      setForm({
        nama: currentStore.nama,
        kode: currentStore.kode,
        alamat: currentStore.alamat || '',
        telepon: currentStore.telepon || '',
        email: currentStore.email || '',
        status: currentStore.status,
        timezone: currentStore.timezone,
        mata_uang: currentStore.mata_uang,
        logo_url: currentStore.logo_url || ''
      })
    }
  }, [currentStore])

  useEffect(() => {
    if (currentStoreOperatingHours.length > 0) {
      setOperatingHoursForm(currentStoreOperatingHours)
    } else {
      // Initialize with default hours
      setOperatingHoursForm(DAYS.map(day => ({
        id: `temp-${day.key}`,
        toko_id: currentStore?.id || '',
        hari: day.key as any,
        jam_buka: '08:00',
        jam_tutup: '21:00',
        is_buka: day.key !== 'minggu'
      })))
    }
  }, [currentStoreOperatingHours, currentStore])

  const onSubmitBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateCurrentStore(form)
      toast({ title: 'Tersimpan', description: 'Informasi toko berhasil diperbarui' })
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan',
        description: err?.message || 'Terjadi kesalahan saat menyimpan',
        variant: 'destructive'
      })
    }
  }

  const onSubmitOperatingHours = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateOperatingHours(operatingHoursForm)
      toast({ title: 'Tersimpan', description: 'Jam operasional berhasil diperbarui' })
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan',
        description: err?.message || 'Terjadi kesalahan saat menyimpan',
        variant: 'destructive'
      })
    }
  }

  const updateOperatingHour = (index: number, field: keyof TokoOperatingHours, value: any) => {
    const updated = [...operatingHoursForm]
    updated[index] = { ...updated[index], [field]: value }
    setOperatingHoursForm(updated)
  }

  if (loading && !currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat informasi toko...</p>
        </div>
      </div>
    )
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === form.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Factory className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan Toko</h1>
                <p className="text-gray-600 mt-1">Kelola profil toko, jam operasional, dan konfigurasi sistem</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentStatus && (
                <Badge className={currentStatus.color}>
                  {currentStatus.label}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {form.kode || 'KODE-TOKO'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informasi Dasar
            </TabsTrigger>
            <TabsTrigger value="operating-hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Jam Operasional
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Konfigurasi
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistik
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar Toko</CardTitle>
                <CardDescription>Data ini ditampilkan pada kasir, struk, login, dan laporan</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmitBasicInfo} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Toko *</Label>
                      <Input
                        id="nama"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kode">Kode Toko *</Label>
                      <Input
                        id="kode"
                        value={form.kode}
                        onChange={(e) => setForm({ ...form, kode: e.target.value })}
                        required
                        placeholder="e.g., MAIN01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telepon">Telepon</Label>
                      <Input
                        id="telepon"
                        value={form.telepon}
                        onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Waktu</Label>
                      <Select value={form.timezone} onValueChange={(value) => setForm({ ...form, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map(tz => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mata_uang">Mata Uang</Label>
                      <Select value={form.mata_uang} onValueChange={(value) => setForm({ ...form, mata_uang: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        type="url"
                        value={form.logo_url}
                        onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="alamat">Alamat</Label>
                      <Textarea
                        id="alamat"
                        rows={3}
                        value={form.alamat}
                        onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview Identitas</CardTitle>
                  <CardDescription>Tampilan sebagaimana terlihat di aplikasi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-white p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {form.nama ? form.nama.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-semibold text-gray-900">{form.nama || '—'}</div>
                        <div className="flex items-center text-sm text-gray-700 gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" /> {form.alamat || '—'}
                        </div>
                        <div className="flex items-center text-sm text-gray-700 gap-2">
                          <Phone className="h-4 w-4 text-gray-500" /> {form.telepon || '—'}
                        </div>
                        <div className="flex items-center text-sm text-gray-700 gap-2">
                          <Mail className="h-4 w-4 text-gray-500" /> {form.email || '—'}
                        </div>
                        <div className="flex items-center text-sm text-gray-700 gap-2">
                          <Globe className="h-4 w-4 text-gray-500" /> {form.timezone}
                        </div>
                        <div className="flex items-center text-sm text-gray-700 gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" /> {form.mata_uang}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Sistem</CardTitle>
                  <CardDescription>Status dan konfigurasi teknis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Store ID:</span>
                      <span className="font-mono text-xs">{currentStore?.id || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenant ID:</span>
                      <span className="font-mono text-xs">{currentStore?.tenant_id || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dibuat:</span>
                      <span>{currentStore?.dibuat_pada ? new Date(currentStore.dibuat_pada).toLocaleDateString('id-ID') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terakhir Update:</span>
                      <span>{currentStore?.diperbarui_pada ? new Date(currentStore.diperbarui_pada).toLocaleDateString('id-ID') : '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operating Hours Tab */}
          <TabsContent value="operating-hours">
            <Card>
              <CardHeader>
                <CardTitle>Jam Operasional</CardTitle>
                <CardDescription>Atur jadwal buka dan tutup toko untuk setiap hari</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmitOperatingHours} className="space-y-5">
                  <div className="space-y-4">
                    {DAYS.map((day, index) => {
                      const hour = operatingHoursForm.find(h => h.hari === day.key) || operatingHoursForm[index]
                      if (!hour) return null

                      return (
                        <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-20 font-medium">{day.label}</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hour.is_buka}
                              onChange={(e) => updateOperatingHour(index, 'is_buka', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">Buka</span>
                          </div>
                          {hour.is_buka && (
                            <>
                              <div className="flex items-center gap-2">
                                <Label>Jam Buka</Label>
                                <Input
                                  type="time"
                                  value={hour.jam_buka}
                                  onChange={(e) => updateOperatingHour(index, 'jam_buka', e.target.value)}
                                  className="w-24"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label>Jam Tutup</Label>
                                <Input
                                  type="time"
                                  value={hour.jam_tutup}
                                  onChange={(e) => updateOperatingHour(index, 'jam_tutup', e.target.value)}
                                  className="w-24"
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  placeholder="Catatan (opsional)"
                                  value={hour.catatan || ''}
                                  onChange={(e) => updateOperatingHour(index, 'catatan', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Menyimpan...' : 'Simpan Jam Operasional'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Konfigurasi Toko</CardTitle>
                <CardDescription>Pengaturan khusus untuk toko ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentStoreConfigs.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{config.key}</div>
                        <div className="text-sm text-gray-600">{config.deskripsi}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={config.value}
                          onChange={(e) => {
                            // Handle config update
                          }}
                          className="w-40"
                        />
                        <Badge variant="outline">{config.tipe}</Badge>
                      </div>
                    </div>
                  ))}
                  {currentStoreConfigs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada konfigurasi yang diatur
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Produk</p>
                      <p className="text-2xl font-bold">{currentStoreStats?.total_products || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transaksi Hari Ini</p>
                      <p className="text-2xl font-bold">{currentStoreStats?.total_transactions_today || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Penjualan Hari Ini</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: form.mata_uang,
                          minimumFractionDigits: 0
                        }).format(currentStoreStats?.total_sales_today || 0)}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                      <p className="text-2xl font-bold">{currentStoreStats?.total_customers || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stok Menipis</p>
                      <p className="text-2xl font-bold">{currentStoreStats?.low_stock_items || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pengguna Aktif</p>
                      <p className="text-2xl font-bold">{currentStoreStats?.active_users || 0}</p>
                    </div>
                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PengaturanTokoPage

