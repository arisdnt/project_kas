import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Badge } from '@/core/components/ui/badge'
import { useToast } from '@/core/hooks/use-toast'
import { config } from '@/core/config'
import { Factory, Save, RefreshCw, Info, Mail, Phone, MapPin } from 'lucide-react'
import { getInfoToko, updateInfoToko } from './services/tokoService'

type FormState = {
  nama: string
  alamat: string
  emailKontak: string
  teleponKontak: string
}

export function PengaturanTokoPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    nama: '',
    alamat: '',
    emailKontak: '',
    teleponKontak: ''
  })

  const defaults = useMemo<FormState>(() => ({
    nama: config.infoToko.nama,
    alamat: config.infoToko.alamat,
    emailKontak: config.infoToko.emailKontak,
    teleponKontak: config.infoToko.teleponKontak
  }), [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getInfoToko()
        if (!mounted) return
        setForm({
          nama: data.nama,
          alamat: data.alamat,
          emailKontak: data.emailKontak,
          teleponKontak: data.teleponKontak
        })
      } catch (err) {
        // Fallback telah ditangani di service; tampilkan notifikasi ringan
        toast({
          title: 'Mode lokal',
          description: 'Memuat informasi toko dari konfigurasi lokal',
        })
        setForm(defaults)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [defaults, toast])

  const onReset = () => {
    setForm(defaults)
    toast({ title: 'Dikembalikan', description: 'Nilai dikembalikan ke default' })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateInfoToko(form)
      toast({ title: 'Tersimpan', description: 'Informasi toko berhasil disimpan' })
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan',
        description: err?.message || 'API belum tersedia, perubahan hanya tersimpan di sesi',
      })
    } finally {
      setSaving(false)
    }
  }

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
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan Toko/Tenant</h1>
                <p className="text-gray-600 mt-1">Profil toko, informasi kontak, dan identitas yang tampil di struk & antarmuka</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              Identitas
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Informasi Toko */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
            <CardDescription>Data ini ditampilkan pada kasir, struk, login, dan laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Toko</Label>
                  <Input id="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailKontak">Email</Label>
                  <Input id="emailKontak" type="email" value={form.emailKontak} onChange={(e) => setForm({ ...form, emailKontak: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teleponKontak">Telepon</Label>
                  <Input id="teleponKontak" value={form.teleponKontak} onChange={(e) => setForm({ ...form, teleponKontak: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea id="alamat" rows={3} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving || loading} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button type="button" variant="secondary" onClick={onReset} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kembalikan Default
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
              <CardDescription>Tampilan ringkas sebagaimana terlihat di aplikasi</CardDescription>
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
                      <Phone className="h-4 w-4 text-gray-500" /> {form.teleponKontak || '—'}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 gap-2">
                      <Mail className="h-4 w-4 text-gray-500" /> {form.emailKontak || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
              <CardDescription>Integrasi dengan sistem yang sudah ada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600" />
                  <p>Nilai di atas digunakan oleh komponen kasir (struk), halaman login, dan laporan melalui objek konfigurasi.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600" />
                  <p>Penyimpanan permanen akan mengarah ke endpoint API begitu tersedia. Untuk saat ini, perubahan disimpan di sesi.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PengaturanTokoPage

