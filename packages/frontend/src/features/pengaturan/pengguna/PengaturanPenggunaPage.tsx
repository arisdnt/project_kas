/**
 * Halaman Pengaturan Pengguna
 * Mengelola data pengguna dengan integrasi API real
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Crown,
  Store,
  Loader2,
  Mail,
  Calendar,
  Calculator
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { usePengguna } from './hooks/usePengguna'
import { CreatePenggunaRequest, UpdatePenggunaRequest } from './services/penggunaService'

// Interface untuk form data
interface FormData {
  username: string
  nama_lengkap: string
  id_peran: number
  password: string
  aktif: boolean
}

export function PengaturanPenggunaPage() {
  // Hook untuk mengelola data pengguna
  const {
    pengguna,
    peran,
    loading,
    loadingCreate,
    loadingUpdate,
    loadingDelete,
    error,
    pagination,
    fetchPengguna,
    createPengguna,
    updatePengguna,
    deletePengguna,
    selectPengguna,
    selectedPengguna
  } = usePengguna()
  
  // State untuk UI
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeran, setFilterPeran] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    nama_lengkap: '',
    id_peran: 0,
    password: '',
    aktif: true
  })
  
  // Filter pengguna berdasarkan pencarian dan peran
  const filteredPengguna = useMemo(() => {
    return pengguna.filter(user => {
      // Pastikan properti tidak null/undefined sebelum memanggil toLowerCase
      const namaLengkap = user.nama_lengkap || ''
      const username = user.username || ''
      
      const matchesSearch = namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           username.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterPeran === 'all' || user.id_peran.toString() === filterPeran
      return matchesSearch && matchesRole
    })
  }, [pengguna, searchTerm, filterPeran])
  
  // Fungsi untuk mendapatkan icon peran
  const getRoleIcon = (peranId: number) => {
    switch (peranId) {
      case 1: return <Crown className="h-4 w-4" />
      case 2: return <Shield className="h-4 w-4" />
      case 3: return <Calculator className="h-4 w-4" />
      case 4: return <Store className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }
  
  // Fungsi untuk mendapatkan warna peran
  const getRoleColor = (peranId: number) => {
    switch (peranId) {
      case 1: return 'bg-purple-100 text-purple-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-green-100 text-green-800'
      case 4: return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Handler untuk edit pengguna
  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      id_peran: user.id_peran,
      password: '',
      aktif: user.aktif
    })
    setIsDialogOpen(true)
  }
  
  // Handler untuk tambah pengguna baru
  const handleAdd = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      nama_lengkap: '',
      id_peran: 0,
      password: '',
      aktif: true
    })
    setIsDialogOpen(true)
  }
  
  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Update pengguna
        const updateData: UpdatePenggunaRequest = {
          username: formData.username,
          nama_lengkap: formData.nama_lengkap,
          id_peran: formData.id_peran,
          aktif: formData.aktif
        }
        
        // Hanya tambahkan password jika diisi
        if (formData.password.trim()) {
          updateData.password = formData.password
        }
        
        const success = await updatePengguna(editingUser.id, updateData)
        if (success) {
          setIsDialogOpen(false)
        }
      } else {
        // Buat pengguna baru
        const createData: CreatePenggunaRequest = {
          username: formData.username,
          nama_lengkap: formData.nama_lengkap,
          id_peran: formData.id_peran,
          password: formData.password,
          aktif: formData.aktif
        }
        
        const success = await createPengguna(createData)
        if (success) {
          setIsDialogOpen(false)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }
  
  // Handler untuk hapus pengguna
  const handleDelete = async (userId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      await deletePengguna(userId)
    }
  }
  
  // Format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Handler untuk refresh data
  const handleRefresh = () => {
    fetchPengguna({ page: 1, limit: 50 })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pengaturan Pengguna</h1>
                <p className="text-sm text-gray-500">Kelola akun pengguna dan hak akses sistem</p>
              </div>
            </div>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                  <p className="text-2xl font-bold text-gray-900">{pengguna.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pengguna.filter(u => u.aktif).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nonaktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pengguna.filter(u => !u.aktif).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Peran</p>
                  <p className="text-2xl font-bold text-gray-900">{peran.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterPeran} onValueChange={setFilterPeran}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Peran</SelectItem>
                    {peran.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription>
              Menampilkan {filteredPengguna.length} dari {pengguna.length} pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPengguna.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nama_lengkap}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.id_peran)}>
                          <div className="flex items-center">
                            {getRoleIcon(user.id_peran)}
                            <span className="ml-1">{user.nama_peran || 'Unknown'}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.aktif ? 'default' : 'secondary'}>
                          {user.aktif ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Aktif</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Nonaktif</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(user.dibuat_pada)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => selectPengguna(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600"
                              disabled={loadingDelete}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Perbarui informasi pengguna yang dipilih'
                : 'Buat akun pengguna baru untuk sistem'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama_lengkap" className="text-right">
                  Nama Lengkap
                </Label>
                <Input
                  id="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_peran" className="text-right">
                  Peran
                </Label>
                <Select 
                  value={formData.id_peran.toString()} 
                  onValueChange={(value) => setFormData({...formData, id_peran: parseInt(value)})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    {peran.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {editingUser ? 'Password Baru' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="col-span-3"
                  required={!editingUser}
                  placeholder={editingUser ? 'Kosongkan jika tidak diubah' : ''}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aktif" className="text-right">
                  Status
                </Label>
                <Select 
                  value={formData.aktif.toString()} 
                  onValueChange={(value) => setFormData({...formData, aktif: value === 'true'})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={loadingCreate || loadingUpdate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(loadingCreate || loadingUpdate) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingUser ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PengaturanPenggunaPage