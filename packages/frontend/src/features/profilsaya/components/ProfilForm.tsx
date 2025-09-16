import React, { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Notification } from '@/core/components/ui/notification';
import { Save, Loader2 } from 'lucide-react';
import { ProfilUser, ProfilFormData, ValidationError } from '../types';

interface ProfilFormProps {
  profil: ProfilUser | null;
  onSubmit: (data: ProfilFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfilForm({ profil, onSubmit, isLoading = false }: ProfilFormProps) {
  const [formData, setFormData] = useState<ProfilFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
    position: '',
    department: ''
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Mengisi form dengan data profil saat ini
  useEffect(() => {
    if (profil) {
      setFormData({
        fullName: profil.fullName || '',
        email: profil.email || '',
        phone: profil.phone || '',
        address: profil.address || '',
        birthDate: profil.birthDate || '',
        gender: profil.gender || '',
        position: profil.position || '',
        department: profil.department || ''
      });
    }
  }, [profil]);

  // Validasi form
  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!formData.fullName.trim()) {
      newErrors.push({ field: 'fullName', message: 'Nama wajib diisi' });
    }

    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email wajib diisi' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Format email tidak valid' });
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.push({ field: 'phone', message: 'Format telepon tidak valid' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle perubahan input
  const handleInputChange = (field: keyof ProfilFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Hapus error untuk field yang sedang diubah
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setNotification({
        type: 'success',
        message: 'Profil berhasil diperbarui'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Gagal memperbarui profil. Silakan coba lagi.'
      });
    }
  };

  // Mendapatkan error untuk field tertentu
  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  return (
    <div className="space-y-6">
      {/* Notifikasi */}
      {notification && (
        <Notification
          variant={notification.type}
          title={notification.type === 'success' ? 'Berhasil' : 'Error'}
          description={notification.message}
          onDelete={() => setNotification(null)}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap *</Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Masukkan nama lengkap"
            className={getFieldError('fullName') ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {getFieldError('fullName') && (
            <p className="text-sm text-red-600">{getFieldError('fullName')}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Masukkan email"
            className={getFieldError('email') ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {getFieldError('email') && (
            <p className="text-sm text-red-600">{getFieldError('email')}</p>
          )}
        </div>

        {/* Telepon */}
        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Masukkan nomor telepon"
            className={getFieldError('phone') ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {getFieldError('phone') && (
            <p className="text-sm text-red-600">{getFieldError('phone')}</p>
          )}
        </div>

        {/* Alamat */}
        <div className="space-y-2">
          <Label htmlFor="address">Alamat</Label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Masukkan alamat lengkap"
            rows={3}
            className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${
              getFieldError('address') ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {getFieldError('address') && (
            <p className="text-sm text-red-600">{getFieldError('address')}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}