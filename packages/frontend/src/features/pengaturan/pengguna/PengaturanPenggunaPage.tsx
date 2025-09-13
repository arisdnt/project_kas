import { config } from '@/core/config'
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
  Mail,
  Phone,
  Calendar,
  Key,
  Settings,
  CheckCircle,
  XCircle,
  Crown,
  Store,
  Calculator
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface Pengguna {
  id: number
  id_toko: number
  id_peran: number
  username: string
  password_hash: string
  nama_lengkap: string
  aktif: boolean
  dibuat_pada: string
  diperbarui_pada: string
  nama_peran?: string
  nama_toko?: string
}

interface Peran {
  id: number
  nama: string
}

interface FormData {
  username: string
  nama_lengkap: string
  id_peran: number
  password: string
  aktif: boolean
}

export function PengaturanPenggunaPage() {
  const [pengguna, setPengguna] = useState<Pengguna[]>([])
  const [peran, setPeran] = useState<Peran[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeran, setFilterPeran] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Pengguna | null>(null)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    nama_lengkap: '',
    id_peran: 0,
    password: '',
    aktif: true
  })

  // Mock data - dalam implementasi nyata akan diambil dari API
  useEffect(() => {
    const mockPengguna: Pengguna[] = [
      {
        id: 1,
        id_toko: 1,
        id_peran: 1,
        username: 'admin',
        password_hash: 'hash123',
        nama_lengkap: 'Administrator Sistem',
        aktif: true,
        dibuat_pada: '2024-01-01T00:00:00Z',
        diperbarui_pada: '2024-01-01T00:00:00Z',
        nama_peran: 'Admin',
        nama_toko: 'Toko Utama'
      },
      {
        id: 2,
        id_toko: 1,
        id_peran: 2,
        username: 'kasir1',
        password_hash: 'hash456',
        nama_lengkap: 'Ahmad Kasir',
        aktif: true,
        dibuat_pada: '2024-01-02T00:00:00Z',
        diperbarui_pada: '2024-01-02T00:00:00Z',
        nama_peran: 'Kasir',
        nama_toko: 'Toko Utama'
      },
      {
        id: 3,
        id_toko: 1,
        id_peran: 3,
        username: 'manager',
        password_hash: 'hash789',
        nama_lengkap: 'Budi Manager',
        aktif: false,
        dibuat_pada: '2024-01-03T00:00:00Z',
        diperbarui_pada: '2024-01-03T00:00:00Z',
        nama_peran: 'Manager',
        nama_toko: 'Toko Utama'
      }
    ]

    const mockPeran: Peran[] = [
      { id: 1, nama: 'Admin' },
      { id: 2, nama: 'Kasir' },
      { id: 3, nama: 'Manager' }
    ]

    setPengguna(mockPengguna)
    setPeran(mockPeran)
    setLoading(false)
  }, [])

  const filteredPengguna = pengguna.filter(user => {
    const matchesSearch = user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterPeran === 'all' || user.nama_peran === filterPeran
    return matchesSearch && matchesRole
  })

  const getRoleIcon = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'kasir':
        return <Calculator className="h-4 w-4" />
      case 'manager':
        return <Store className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'kasir':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleEdit = (user: Pengguna) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementasi API call akan ditambahkan di sini
    console.log('Submitting form:', formData)
    setIsDialogOpen(false)
  }

  const handleDelete = (userId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      // Implementasi API call akan ditambahkan di sini
      console.log('Deleting user:', userId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan Pengguna</h1>
                <p className="text-gray-600 mt-1">Kelola pengguna dan peran akses sistem</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {filteredPengguna.length} Pengguna
              </Badge>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah Pengguna
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingUser ? 'Edit informasi pengguna yang ada' : 'Tambahkan pengguna baru ke sistem'}
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
                            {peran.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {!editingUser && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Password
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="col-span-3"
                            required={!editingUser}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="aktif" className="text-right">
                          Status
                        </Label>
                        <Select 
                          value={formData.aktif ? 'true' : 'false'} 
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
                      <Button type="submit">
                        {editingUser ? 'Update' : 'Simpan'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                  <p className="text-2xl font-bold text-gray-900">{pengguna.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pengguna Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pengguna.filter(u => u.aktif).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pengguna Nonaktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pengguna.filter(u => !u.aktif).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Peran</p>
                  <p className="text-2xl font-bold text-gray-900">{peran.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari pengguna berdasarkan nama atau username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterPeran} onValueChange={setFilterPeran}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Peran</SelectItem>
                  {peran.map((role) => (
                    <SelectItem key={role.id} value={role.nama}>
                      {role.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription>
              Semua pengguna yang terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPengguna.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna</h3>
                        <p className="text-gray-600">Tidak ada pengguna yang sesuai dengan filter yang dipilih</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPengguna.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {user.nama_lengkap.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.nama_lengkap}</div>
                            <div className="text-sm text-gray-500">{user.nama_toko}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.nama_peran || '')}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(user.nama_peran || '')}
                            <span>{user.nama_peran}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.aktif ? 'default' : 'secondary'}>
                          {user.aktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(user.dibuat_pada)}</span>
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
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PengaturanPenggunaPage