/**
 * Komponen Form Edit Profil
 * Form untuk mengedit profil pengguna di kolom kanan
 */

import { useState, useEffect } from 'react';
import { ProfilUser, UpdateProfilUser, ProfilFormData, ValidationError } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Notification } from '@/core/components/ui/notification';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface ProfilEditFormProps {
  profil: ProfilUser | null;
  onUpdate: (data: UpdateProfilUser) => Promise<void>;
  loading: boolean;
  updating: boolean;
}

export function ProfilEditForm({ profil, onUpdate, loading, updating }: ProfilEditFormProps) {
  const [formData, setFormData] = useState<ProfilFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
    position: '',
    department: '',
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Update form data ketika profil berubah
  useEffect(() => {
    if (profil) {
      setFormData({
        fullName: profil.fullName || '',
        email: profil.email || '',
        phone: profil.phone || '',
        address: profil.address || '',
        birthDate: profil.birthDate ? profil.birthDate.split('T')[0] : '',
        gender: profil.gender || '',
        position: profil.position || '',
        department: profil.department || '',
      });
    }
  }, [profil]);

  const handleInputChange = (field: keyof ProfilFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error untuk field yang sedang diubah
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!formData.fullName.trim()) {
      newErrors.push({ field: 'fullName', message: 'Nama lengkap wajib diisi' });
    }

    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email wajib diisi' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Format email tidak valid' });
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.push({ field: 'phone', message: 'Format nomor telepon tidak valid' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const updateData: UpdateProfilUser = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      birthDate: formData.birthDate || undefined,
      gender: formData.gender as 'L' | 'P' | undefined,
      position: formData.position || undefined,
      department: formData.department || undefined,
    };

    await onUpdate(updateData);
    setIsDirty(false);
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Save className="w-5 h-5" />
          <span>Edit Profil</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="fullName">Nama Lengkap *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={getFieldError('fullName') ? 'border-red-500' : ''}
              />
              {getFieldError('fullName') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('fullName')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={getFieldError('email') ? 'border-red-500' : ''}
              />
              {getFieldError('email') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={getFieldError('phone') ? 'border-red-500' : ''}
              />
              {getFieldError('phone') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('phone')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Jabatan</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="department">Departemen</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <Notification variant="error">
              <AlertCircle className="h-4 w-4" />
              Mohon perbaiki kesalahan pada form sebelum menyimpan.
            </Notification>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={updating || !isDirty}
              className="min-w-[120px]"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}