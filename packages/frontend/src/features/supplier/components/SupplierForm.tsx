import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Loader2, Save, X, User, Phone, Mail, MapPin, Building, CreditCard, Landmark } from 'lucide-react'
import { UISupplier } from '@/features/supplier/types/supplier'

export type SupplierFormData = {
  nama: string
  kontak_person?: string
  email?: string
  telepon?: string
  alamat?: string
  npwp?: string
  bank_nama?: string
  bank_rekening?: string
  bank_atas_nama?: string
  status?: 'aktif' | 'nonaktif' | 'blacklist'
}

interface SupplierFormProps {
  value: SupplierFormData | null
  editingSupplier?: UISupplier | null
  onSave: (data: SupplierFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function SupplierForm({
  value,
  editingSupplier,
  onSave,
  onCancel,
  isLoading
}: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    nama: '',
    kontak_person: '',
    email: '',
    telepon: '',
    alamat: '',
    npwp: '',
    bank_nama: '',
    bank_rekening: '',
    bank_atas_nama: '',
    status: 'aktif'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (value) {
      setFormData(value)
    }
  }, [value])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama supplier wajib diisi'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (formData.telepon && !/^[0-9+\-\s()]+$/.test(formData.telepon)) {
      newErrors.telepon = 'Format telepon tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  const handleInputChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <User className="h-4 w-4" />
            Informasi Dasar
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="nama" className="text-sm font-medium text-gray-700">
                Nama Supplier *
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="Masukkan nama supplier"
                className={errors.nama ? 'border-red-500' : ''}
              />
              {errors.nama && <p className="text-sm text-red-500 mt-1">{errors.nama}</p>}
            </div>

            <div>
              <Label htmlFor="kontak_person" className="text-sm font-medium text-gray-700">
                Kontak Person
              </Label>
              <Input
                id="kontak_person"
                value={formData.kontak_person || ''}
                onChange={(e) => handleInputChange('kontak_person', e.target.value)}
                placeholder="Nama person yang bisa dihubungi"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={formData.status || 'aktif'}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  <SelectItem value="blacklist">Blacklist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Phone className="h-4 w-4" />
            Informasi Kontak
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@supplier.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="telepon" className="text-sm font-medium text-gray-700">
                Telepon
              </Label>
              <Input
                id="telepon"
                value={formData.telepon || ''}
                onChange={(e) => handleInputChange('telepon', e.target.value)}
                placeholder="0812-3456-7890"
                className={errors.telepon ? 'border-red-500' : ''}
              />
              {errors.telepon && <p className="text-sm text-red-500 mt-1">{errors.telepon}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="alamat" className="text-sm font-medium text-gray-700">
              Alamat
            </Label>
            <Textarea
              id="alamat"
              value={formData.alamat || ''}
              onChange={(e) => handleInputChange('alamat', e.target.value)}
              placeholder="Alamat lengkap supplier"
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Tax Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Building className="h-4 w-4" />
            Informasi Pajak
          </div>

          <div>
            <Label htmlFor="npwp" className="text-sm font-medium text-gray-700">
              NPWP
            </Label>
            <Input
              id="npwp"
              value={formData.npwp || ''}
              onChange={(e) => handleInputChange('npwp', e.target.value)}
              placeholder="00.000.000.0-000.000"
            />
          </div>
        </div>

        {/* Bank Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Landmark className="h-4 w-4" />
            Informasi Bank
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="bank_nama" className="text-sm font-medium text-gray-700">
                Nama Bank
              </Label>
              <Input
                id="bank_nama"
                value={formData.bank_nama || ''}
                onChange={(e) => handleInputChange('bank_nama', e.target.value)}
                placeholder="Bank BCA"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bank_rekening" className="text-sm font-medium text-gray-700">
                  Nomor Rekening
                </Label>
                <Input
                  id="bank_rekening"
                  value={formData.bank_rekening || ''}
                  onChange={(e) => handleInputChange('bank_rekening', e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <Label htmlFor="bank_atas_nama" className="text-sm font-medium text-gray-700">
                  Atas Nama
                </Label>
                <Input
                  id="bank_atas_nama"
                  value={formData.bank_atas_nama || ''}
                  onChange={(e) => handleInputChange('bank_atas_nama', e.target.value)}
                  placeholder="Nama pemilik rekening"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 h-10"
        >
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {editingSupplier ? 'Perbarui' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}