import React, { useState, useEffect } from 'react';
import { Promo, CreatePromoRequest, UpdatePromoRequest, PromoStats } from '../types/promo';
import { usePromos } from '../hooks/usePromos';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/core/components/ui/dialog';
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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function PromoPage() {
  const { promos, stats, loading, error, createPromo, deletePromo, togglePromoStatus } = usePromos();
  const [filteredPromos, setFilteredPromos] = useState<Promo[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPromo, setNewPromo] = useState({
    nama: '',
    deskripsi: '',
    tipe: 'diskon_persen' as Promo['tipe'],
    nilai: 0,
    syarat_minimum: 0,
    kuota: 0,
    mulai_tanggal: '',
    selesai_tanggal: ''
  });

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

  const handleCreatePromo = async () => {
    try {
      const promoRequest: CreatePromoRequest = {
        nama: newPromo.nama,
        deskripsi: newPromo.deskripsi,
        tipe: newPromo.tipe,
        nilai: newPromo.nilai,
        syarat_minimum: newPromo.syarat_minimum || undefined,
        kuota: newPromo.kuota || undefined,
        mulai_tanggal: newPromo.mulai_tanggal,
        selesai_tanggal: newPromo.selesai_tanggal
      };
      
      await createPromo(promoRequest);
      
      setNewPromo({
        nama: '',
        deskripsi: '',
        tipe: 'diskon_persen',
        nilai: 0,
        syarat_minimum: 0,
        kuota: 0,
        mulai_tanggal: '',
        selesai_tanggal: ''
      });
      
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error('Failed to create promo:', err);
    }
  };

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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Promo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Promo Baru</DialogTitle>
              <DialogDescription>
                Buat promo baru untuk meningkatkan penjualan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Promo</Label>
                  <Input
                    id="nama"
                    value={newPromo.nama}
                    onChange={(e) => setNewPromo({ ...newPromo, nama: e.target.value })}
                    placeholder="Contoh: Diskon Akhir Tahun"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipe">Tipe Promo</Label>
                  <Select onValueChange={(value) => setNewPromo({ ...newPromo, tipe: value as Promo['tipe'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe promo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diskon_persen">Diskon Persen</SelectItem>
                      <SelectItem value="diskon_nominal">Diskon Nominal</SelectItem>
                      <SelectItem value="beli_n_gratis_n">Beli N Gratis N</SelectItem>
                      <SelectItem value="bundling">Bundling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Input
                  id="deskripsi"
                  value={newPromo.deskripsi}
                  onChange={(e) => setNewPromo({ ...newPromo, deskripsi: e.target.value })}
                  placeholder="Deskripsi promo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nilai">Nilai</Label>
                  <Input
                    id="nilai"
                    type="number"
                    value={newPromo.nilai}
                    onChange={(e) => setNewPromo({ ...newPromo, nilai: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syarat_minimum">Minimum Pembelian</Label>
                  <Input
                    id="syarat_minimum"
                    type="number"
                    value={newPromo.syarat_minimum}
                    onChange={(e) => setNewPromo({ ...newPromo, syarat_minimum: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mulai_tanggal">Mulai Tanggal</Label>
                  <Input
                    id="mulai_tanggal"
                    type="date"
                    value={newPromo.mulai_tanggal}
                    onChange={(e) => setNewPromo({ ...newPromo, mulai_tanggal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selesai_tanggal">Selesai Tanggal</Label>
                  <Input
                    id="selesai_tanggal"
                    type="date"
                    value={newPromo.selesai_tanggal}
                    onChange={(e) => setNewPromo({ ...newPromo, selesai_tanggal: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePromo}>Simpan Promo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(promo.id)}
                  >
                    {promo.aktif ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePromo(promo.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </div>
  );
}