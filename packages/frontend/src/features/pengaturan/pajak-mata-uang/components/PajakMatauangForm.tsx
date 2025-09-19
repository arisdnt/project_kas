import React, { useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Switch } from '@/core/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Separator } from '@/core/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Percent, DollarSign, Settings, AlertCircle } from 'lucide-react'
import { PajakSetting, MatauangSetting, CreatePajakRequest, CreateMatauangRequest } from '../types'

interface PajakMatauangFormProps {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
  type: 'pajak' | 'mata_uang'
  initialData?: PajakSetting | MatauangSetting
  onSubmit: (data: CreatePajakRequest | CreateMatauangRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PajakMatauangForm({
  isOpen,
  mode,
  type,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: PajakMatauangFormProps) {
  const [formData, setFormData] = useState(() => {
    if (type === 'pajak') {
      const data = initialData as PajakSetting
      return {
        nama: data?.nama || '',
        persentase: data?.persentase?.toString() || '',
        deskripsi: data?.deskripsi || '',
        aktif: data?.aktif ?? true,
        default: data?.default ?? false
      }
    } else {
      const data = initialData as MatauangSetting
      return {
        kode: data?.kode || '',
        nama: data?.nama || '',
        simbol: data?.simbol || '',
        format_tampilan: data?.format_tampilan || 'before' as 'before' | 'after',
        pemisah_desimal: data?.pemisah_desimal || ',',
        pemisah_ribuan: data?.pemisah_ribuan || '.',
        jumlah_desimal: data?.jumlah_desimal?.toString() || '2',
        aktif: data?.aktif ?? true,
        default: data?.default ?? false
      }
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (type === 'pajak') {
      if (!formData.nama?.trim()) {
        newErrors.nama = 'Nama pajak wajib diisi'
      }
      if (!formData.persentase || isNaN(Number(formData.persentase))) {
        newErrors.persentase = 'Persentase harus berupa angka'
      } else if (Number(formData.persentase) < 0 || Number(formData.persentase) > 100) {
        newErrors.persentase = 'Persentase harus antara 0-100'
      }
    } else {
      if (!formData.kode?.trim()) {
        newErrors.kode = 'Kode mata uang wajib diisi'
      }
      if (!formData.nama?.trim()) {
        newErrors.nama = 'Nama mata uang wajib diisi'
      }
      if (!formData.simbol?.trim()) {
        newErrors.simbol = 'Simbol mata uang wajib diisi'
      }
      if (!formData.jumlah_desimal || isNaN(Number(formData.jumlah_desimal))) {
        newErrors.jumlah_desimal = 'Jumlah desimal harus berupa angka'
      } else if (Number(formData.jumlah_desimal) < 0 || Number(formData.jumlah_desimal) > 10) {
        newErrors.jumlah_desimal = 'Jumlah desimal harus antara 0-10'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (type === 'pajak') {
      const pajakData: CreatePajakRequest = {
        nama: formData.nama!,
        persentase: Number(formData.persentase),
        deskripsi: formData.deskripsi || undefined,
        aktif: formData.aktif,
        default: formData.default
      }
      onSubmit(pajakData)
    } else {
      const matauangData: CreateMatauangRequest = {
        kode: formData.kode!,
        nama: formData.nama!,
        simbol: formData.simbol!,
        format_tampilan: formData.format_tampilan as 'before' | 'after',
        pemisah_desimal: formData.pemisah_desimal!,
        pemisah_ribuan: formData.pemisah_ribuan!,
        jumlah_desimal: Number(formData.jumlah_desimal),
        aktif: formData.aktif,
        default: formData.default
      }
      onSubmit(matauangData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatPreview = () => {
    if (type === 'mata_uang' && formData.simbol && formData.nama) {
      const amount = 1234567.89
      const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: Number(formData.jumlah_desimal) || 0,
        maximumFractionDigits: Number(formData.jumlah_desimal) || 0
      }).format(amount)

      const withCustomSeparators = formatted
        .replace(/,/g, '|||TEMP|||')
        .replace(/\./g, formData.pemisah_ribuan)
        .replace(/\|\|\|TEMP\|\|\|/g, formData.pemisah_desimal)

      return formData.format_tampilan === 'before'
        ? `${formData.simbol}${withCustomSeparators}`
        : `${withCustomSeparators} ${formData.simbol}`
    }
    return null
  }

  const isReadOnly = mode === 'view'
  const title = mode === 'create'
    ? `Tambah ${type === 'pajak' ? 'Pajak' : 'Mata Uang'}`
    : mode === 'edit'
    ? `Edit ${type === 'pajak' ? 'Pajak' : 'Mata Uang'}`
    : `Detail ${type === 'pajak' ? 'Pajak' : 'Mata Uang'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 rounded-lg bg-blue-50">
          {type === 'pajak' ? (
            <Percent className="h-5 w-5 text-blue-600" />
          ) : (
            <DollarSign className="h-5 w-5 text-green-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {type === 'pajak'
              ? 'Kelola pengaturan tarif pajak untuk transaksi'
              : 'Kelola pengaturan mata uang dan format tampilan'
            }
          </p>
        </div>
      </div>

      {type === 'pajak' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Pajak *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="PPN, PPh, dll"
                disabled={isReadOnly}
                className={errors.nama ? 'border-red-500' : ''}
              />
              {errors.nama && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nama}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="persentase">Persentase (%) *</Label>
              <Input
                id="persentase"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.persentase}
                onChange={(e) => handleInputChange('persentase', e.target.value)}
                placeholder="11.00"
                disabled={isReadOnly}
                className={errors.persentase ? 'border-red-500' : ''}
              />
              {errors.persentase && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.persentase}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Deskripsi penggunaan pajak ini..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Status Aktif</Label>
              <p className="text-sm text-muted-foreground">
                Pajak ini akan ditampilkan dalam pilihan transaksi
              </p>
            </div>
            <Switch
              checked={formData.aktif}
              onCheckedChange={(checked) => handleInputChange('aktif', checked)}
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Pajak Default</Label>
              <p className="text-sm text-muted-foreground">
                Pajak ini akan dipilih secara otomatis pada transaksi baru
              </p>
            </div>
            <Switch
              checked={formData.default}
              onCheckedChange={(checked) => handleInputChange('default', checked)}
              disabled={isReadOnly}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Mata Uang *</Label>
              <Input
                id="kode"
                value={formData.kode}
                onChange={(e) => handleInputChange('kode', e.target.value.toUpperCase())}
                placeholder="IDR, USD, EUR"
                maxLength={3}
                disabled={isReadOnly}
                className={errors.kode ? 'border-red-500' : ''}
              />
              {errors.kode && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.kode}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama">Nama Mata Uang *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="Rupiah, Dollar Amerika, Euro"
                disabled={isReadOnly}
                className={errors.nama ? 'border-red-500' : ''}
              />
              {errors.nama && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nama}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="simbol">Simbol *</Label>
              <Input
                id="simbol"
                value={formData.simbol}
                onChange={(e) => handleInputChange('simbol', e.target.value)}
                placeholder="Rp, $, €"
                disabled={isReadOnly}
                className={errors.simbol ? 'border-red-500' : ''}
              />
              {errors.simbol && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.simbol}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="format_tampilan">Format Tampilan</Label>
              <Select
                value={formData.format_tampilan}
                onValueChange={(value) => handleInputChange('format_tampilan', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Simbol di Depan (Rp1.000)</SelectItem>
                  <SelectItem value="after">Simbol di Belakang (1.000 Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Pengaturan Format Angka
              </CardTitle>
              <CardDescription>
                Atur cara tampilan angka dan pemisah untuk mata uang ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pemisah_desimal">Pemisah Desimal</Label>
                  <Input
                    id="pemisah_desimal"
                    value={formData.pemisah_desimal}
                    onChange={(e) => handleInputChange('pemisah_desimal', e.target.value)}
                    placeholder=","
                    maxLength={1}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pemisah_ribuan">Pemisah Ribuan</Label>
                  <Input
                    id="pemisah_ribuan"
                    value={formData.pemisah_ribuan}
                    onChange={(e) => handleInputChange('pemisah_ribuan', e.target.value)}
                    placeholder="."
                    maxLength={1}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jumlah_desimal">Jumlah Desimal</Label>
                  <Input
                    id="jumlah_desimal"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.jumlah_desimal}
                    onChange={(e) => handleInputChange('jumlah_desimal', e.target.value)}
                    disabled={isReadOnly}
                    className={errors.jumlah_desimal ? 'border-red-500' : ''}
                  />
                  {errors.jumlah_desimal && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.jumlah_desimal}
                    </p>
                  )}
                </div>
              </div>

              {formatPreview() && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium">Preview Format:</Label>
                  <div className="text-lg font-mono mt-1">{formatPreview()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Status Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Mata uang ini akan ditampilkan dalam pilihan transaksi
                </p>
              </div>
              <Switch
                checked={formData.aktif}
                onCheckedChange={(checked) => handleInputChange('aktif', checked)}
                disabled={isReadOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Mata Uang Default</Label>
                <p className="text-sm text-muted-foreground">
                  Mata uang ini akan dipilih secara otomatis pada transaksi baru
                </p>
              </div>
              <Switch
                checked={formData.default}
                onCheckedChange={(checked) => handleInputChange('default', checked)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Perbarui'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Batal
          </Button>
        </div>
      )}

      {isReadOnly && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1"
          >
            Tutup
          </Button>
        </div>
      )}
    </form>
  )
}