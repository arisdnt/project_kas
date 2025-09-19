import * as React from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { User, Mail, Phone, MapPin, Calendar, Briefcase, UserCheck, CreditCard, Percent, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { UIPelanggan } from '../types/pelanggan'
import { PelangganAccessPlaceholder } from './PelangganAccessPlaceholder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Label } from '@/core/components/ui/label'

export type PelangganFormData = {
  nama: string
  email?: string
  telepon?: string
  alamat?: string
  tanggal_lahir?: string
  jenis_kelamin?: 'pria' | 'wanita'
  pekerjaan?: string
  tipe: 'reguler' | 'vip' | 'member' | 'wholesale'
  diskon_persen?: number
  limit_kredit?: number
}

type Props = {
  value?: PelangganFormData | null
  editingPelanggan?: UIPelanggan | null
  onSave?: (data: PelangganFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function PelangganForm({
  value,
  editingPelanggan,
  onSave,
  onCancel,
  isLoading = false
}: Props) {
  const { user } = useAuthStore()
  const [form, setForm] = React.useState<PelangganFormData>({
    nama: value?.nama || '',
    email: value?.email || '',
    telepon: value?.telepon || '',
    alamat: value?.alamat || '',
    tanggal_lahir: value?.tanggal_lahir || '',
    jenis_kelamin: value?.jenis_kelamin || undefined,
    pekerjaan: value?.pekerjaan || '',
    tipe: value?.tipe || 'reguler',
    diskon_persen: value?.diskon_persen || 0,
    limit_kredit: value?.limit_kredit || 0
  })

  React.useEffect(() => {
    setForm({
      nama: value?.nama || '',
      email: value?.email || '',
      telepon: value?.telepon || '',
      alamat: value?.alamat || '',
      tanggal_lahir: value?.tanggal_lahir || '',
      jenis_kelamin: value?.jenis_kelamin || undefined,
      pekerjaan: value?.pekerjaan || '',
      tipe: value?.tipe || 'reguler',
      diskon_persen: value?.diskon_persen || 0,
      limit_kredit: value?.limit_kredit || 0
    })
  }, [value])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSave) return

    try {
      await onSave(form)
      if (!editingPelanggan) {
        setForm({
          nama: '',
          email: '',
          telepon: '',
          alamat: '',
          tanggal_lahir: '',
          jenis_kelamin: undefined,
          pekerjaan: '',
          tipe: 'reguler',
          diskon_persen: 0,
          limit_kredit: 0
        })
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const pelangganTypes = [
    { value: 'reguler', label: 'Reguler' },
    { value: 'vip', label: 'VIP' },
    { value: 'member', label: 'Member' },
    { value: 'wholesale', label: 'Wholesale' }
  ]

  const genderOptions = [
    { value: 'pria', label: 'Pria' },
    { value: 'wanita', label: 'Wanita' }
  ]

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {editingPelanggan ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
              </CardTitle>
              <CardDescription>
                {editingPelanggan
                  ? 'Perbarui informasi pelanggan di bawah ini.'
                  : 'Lengkapi informasi di bawah ini untuk menambah pelanggan baru.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Pelanggan <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={(e) => setForm(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama pelanggan"
                    required
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telepon" className="text-sm font-medium">
                  Nomor Telepon
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="telepon"
                    value={form.telepon}
                    onChange={(e) => setForm(prev => ({ ...prev, telepon: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipe" className="text-sm font-medium">
                  Tipe Pelanggan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.tipe}
                  onValueChange={(value) => setForm(prev => ({ ...prev, tipe: value as any }))}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Pilih tipe pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pelangganTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir" className="text-sm font-medium">
                  Tanggal Lahir
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="tanggal_lahir"
                    type="date"
                    value={form.tanggal_lahir}
                    onChange={(e) => setForm(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin" className="text-sm font-medium">
                  Jenis Kelamin
                </Label>
                <Select
                  value={form.jenis_kelamin}
                  onValueChange={(value) => setForm(prev => ({ ...prev, jenis_kelamin: value as any }))}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pekerjaan" className="text-sm font-medium">
                  Pekerjaan
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pekerjaan"
                    value={form.pekerjaan}
                    onChange={(e) => setForm(prev => ({ ...prev, pekerjaan: e.target.value }))}
                    placeholder="Pekerjaan pelanggan"
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diskon_persen" className="text-sm font-medium">
                  Diskon (%)
                </Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="diskon_persen"
                    type="number"
                    value={form.diskon_persen}
                    onChange={(e) => setForm(prev => ({ ...prev, diskon_persen: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit_kredit" className="text-sm font-medium">
                  Limit Kredit
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="limit_kredit"
                    type="number"
                    value={form.limit_kredit}
                    onChange={(e) => setForm(prev => ({ ...prev, limit_kredit: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat" className="text-sm font-medium">
                Alamat
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="alamat"
                  value={form.alamat}
                  onChange={(e) => setForm(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Alamat lengkap pelanggan"
                  rows={3}
                  className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {!editingPelanggan && user?.level !== 3 && user?.level !== 4 && (
              <PelangganAccessPlaceholder className="mt-2" />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.nama.trim() || (!editingPelanggan && user?.level !== 3 && user?.level !== 4)}
                className="px-5 py-2 h-10 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : editingPelanggan ? (
                  'Perbarui Pelanggan'
                ) : (
                  'Simpan Pelanggan'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}