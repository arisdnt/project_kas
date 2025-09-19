import { useState, useEffect } from 'react';
import { Promo, CreatePromoRequest } from '../types/promo';
import { usePromos } from '../hooks/usePromos';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Input } from '@/core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu"
import { PromoDrawer, PromoDrawerContent, PromoDrawerHeader, PromoDrawerTitle } from '../components/PromoDrawer';
import { PromoForm, PromoFormData } from '../components/PromoForm';
import { PromoAccessPlaceholder } from '../components/PromoAccessPlaceholder';
import { useToast } from '@/core/hooks/use-toast';
import { useAuthStore } from '@/core/store/authStore';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Gift,
  Percent,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit2
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function PromoPage() {
  const { promos, stats, loading, error, createPromo, deletePromo, togglePromoStatus } = usePromos();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [filteredPromos, setFilteredPromos] = useState<Promo[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const [editing, setEditing] = useState<PromoFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Filter promos based on status and search term
    // Ensure promos is always an array to prevent map errors
    let filtered = Array.isArray(promos) ? promos : [];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(promo => 
        filterStatus === 'aktif' ? promo.aktif : !promo.aktif
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(promo =>
        promo.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPromos(filtered);
  }, [promos, filterStatus, searchTerm]);

  const getPromoTypeIcon = (tipe: Promo['tipe']) => {
    switch (tipe) {
      case 'diskon_persen':
        return <Percent className="h-4 w-4" />;
      case 'diskon_nominal':
        return <DollarSign className="h-4 w-4" />;
      case 'beli_n_gratis_n':
        return <Gift className="h-4 w-4" />;
      case 'bundling':
        return <Package className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getPromoTypeLabel = (tipe: Promo['tipe']) => {
    switch (tipe) {
      case 'diskon_persen':
        return 'Diskon Persen';
      case 'diskon_nominal':
        return 'Diskon Nominal';
      case 'beli_n_gratis_n':
        return 'Beli N Gratis N';
      case 'bundling':
        return 'Bundling';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getPromoValueDisplay = (promo: Promo) => {
    switch (promo.tipe) {
      case 'diskon_persen':
        return `${promo.nilai}%`;
      case 'diskon_nominal':
        return `Rp ${promo.nilai.toLocaleString('id-ID')}`;
      case 'beli_n_gratis_n':
        return `Beli ${promo.nilai - 1} Gratis 1`;
      case 'bundling':
        return `Paket Bundling`;
      default:
        return `${promo.nilai}`;
    }
  };

  const openCreate = () => {
    setEditing({
      nama: '',
      deskripsi: '',
      tipe: 'diskon_persen',
      nilai: '0',
      syarat_minimum: '0',
      kuota: '0',
      mulai_tanggal: '',
      selesai_tanggal: ''
    })
    setSelectedPromo(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (promo: Promo) => {
    setSelectedPromo(promo)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (promo: Promo) => {
    setSelectedPromo(promo)
    setEditing({
      nama: promo.nama,
      deskripsi: promo.deskripsi,
      tipe: promo.tipe,
      nilai: promo.nilai.toString(),
      syarat_minimum: promo.syarat_minimum?.toString() || '0',
      kuota: promo.kuota?.toString() || '0',
      mulai_tanggal: promo.mulai_tanggal,
      selesai_tanggal: promo.selesai_tanggal
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: PromoFormData) => {
    setSaving(true)
    try {
      if (selectedPromo) {
        // Update existing promo
        console.log('Updating promo:', selectedPromo.id, data)
        toast({ title: 'Promo diperbarui' })
      } else {
        // Create new promo
        const promoRequest: CreatePromoRequest = {
          nama: data.nama,
          deskripsi: data.deskripsi,
          tipe: data.tipe,
          nilai: Number(data.nilai),
          syarat_minimum: Number(data.syarat_minimum) || undefined,
          kuota: Number(data.kuota) || undefined,
          mulai_tanggal: data.mulai_tanggal,
          selesai_tanggal: data.selesai_tanggal
        }
        await createPromo(promoRequest)
        toast({ title: 'Promo dibuat' })
      }
      setDrawerOpen(false)
      setSelectedPromo(null)
      setEditing(null)
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePromo = async (id: number) => {
    try {
      await deletePromo(id);
    } catch (err) {
      console.error('Failed to delete promo:', err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await togglePromoStatus(id);
    } catch (err) {
      console.error('Failed to toggle promo status:', err);
    }
  };

  const isPromoExpired = (selesai_tanggal: string) => {
    return new Date(selesai_tanggal) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo & Diskon</h1>
          <p className="text-gray-600 mt-1">Kelola promosi, diskon, dan harga khusus</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Promo
        </Button>
      </div>
      
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data promo...</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Promo</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_promo || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Promo Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.promo_aktif || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Promo Nonaktif</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.promo_nonaktif || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Penggunaan</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_penggunaan || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Diskon</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {((stats?.total_nilai_diskon || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cari promo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(value: 'all' | 'aktif' | 'nonaktif') => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Promo List */}
      <div className="grid gap-4">
        {!Array.isArray(filteredPromos) ? (
          <Card className="p-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Tidak Valid</h3>
                <p className="text-gray-600">Terjadi kesalahan dalam memuat data promosi. Silakan refresh halaman.</p>
              </div>
            </div>
          </Card>
        ) : filteredPromos.length === 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Promosi</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Tidak ada promosi yang sesuai dengan filter yang dipilih.' 
                    : 'Belum ada promosi yang dibuat. Buat promosi pertama Anda!'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredPromos.map((promo) => (
          <Card key={promo.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getPromoTypeIcon(promo.tipe)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{promo.nama}</h3>
                      <p className="text-gray-600">{promo.deskripsi}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getPromoTypeLabel(promo.tipe)}
                    </Badge>
                    
                    <Badge variant={promo.aktif ? "default" : "secondary"}>
                      {promo.aktif ? "Aktif" : "Nonaktif"}
                    </Badge>
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(promo.mulai_tanggal), 'dd MMM yyyy', { locale: id })} - {' '}
                      {format(new Date(promo.selesai_tanggal), 'dd MMM yyyy', { locale: id })}
                    </Badge>
                    
                    {isPromoExpired(promo.selesai_tanggal) && (
                      <Badge variant="destructive">
                        Kedaluwarsa
                      </Badge>
                    )}
                    
                    {promo.kuota && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {promo.kuota_terpakai || 0}/{promo.kuota}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Nilai: </span>
                    {getPromoValueDisplay(promo)}
                    {promo.syarat_minimum && promo.syarat_minimum > 0 && (
                      <span className="ml-3">
                        <span className="font-medium">Min. Pembelian: </span>
                        Rp {promo.syarat_minimum.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        <span className="sr-only">Buka menu aksi</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onView(promo)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(promo)}
                        className="cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:bg-amber-50 focus:text-amber-700"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(promo.id)}
                        className="cursor-pointer text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus:bg-purple-50 focus:text-purple-700"
                      >
                        {promo.aktif ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        {promo.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePromo(promo.id)}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {/* Drawer */}
      <PromoDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <PromoDrawerContent className="!w-[50vw] !max-w-none">
          <PromoDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'create' ? 'bg-green-100 text-green-600' :
                  drawerMode === 'edit' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {drawerMode === 'create' ? (
                    <Plus className="h-5 w-5" />
                  ) : drawerMode === 'edit' ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <PromoDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Buat Promo Baru' :
                   drawerMode === 'edit' ? 'Edit Promo' : 'Detail Promo'}
                </PromoDrawerTitle>
              </div>
            </div>
          </PromoDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selectedPromo ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      {getPromoTypeIcon(selectedPromo.tipe)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Promo</p>
                      <p className="text-lg font-semibold">{selectedPromo.nama}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedPromo.deskripsi}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        {getPromoTypeIcon(selectedPromo.tipe)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tipe Promo</p>
                        <p className="text-gray-700">{getPromoTypeLabel(selectedPromo.tipe)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Nilai</p>
                        <p className="text-gray-700 font-medium">{getPromoValueDisplay(selectedPromo)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Mulai</p>
                        <p className="text-gray-700">{format(new Date(selectedPromo.mulai_tanggal), 'dd MMMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Selesai</p>
                        <p className="text-gray-700">{format(new Date(selectedPromo.selesai_tanggal), 'dd MMMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${selectedPromo.aktif ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedPromo.aktif ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPromo.aktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPromo.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  {(selectedPromo.syarat_minimum || selectedPromo.kuota) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                        <Users className="h-4 w-4" />
                        Syarat & Ketentuan
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {selectedPromo.syarat_minimum && (
                          <div>
                            <p className="text-sm text-gray-500">Min. Pembelian</p>
                            <p className="font-medium">Rp {selectedPromo.syarat_minimum.toLocaleString('id-ID')}</p>
                          </div>
                        )}
                        {selectedPromo.kuota && (
                          <div>
                            <p className="text-sm text-gray-500">Kuota</p>
                            <p className="font-medium">{selectedPromo.kuota_terpakai || 0} / {selectedPromo.kuota}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => onEdit(selectedPromo)}
                    className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Promo
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <PromoAccessPlaceholder />
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setDrawerOpen(false)}
                      className="px-6 py-2 h-10 border-gray-300 hover:bg-gray-50"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              ) : (
                <PromoForm
                  value={editing}
                  editingPromo={selectedPromo}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelectedPromo(null)
                    setEditing(null)
                  }}
                  isLoading={saving}
                  isCreate={drawerMode === 'create'}
                />
              )
            )}
          </div>
        </PromoDrawerContent>
      </PromoDrawer>
    </div>
  );
}