// Komponen form untuk mengubah password user
import { useState } from 'react';
import { Card } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { ChangePasswordFormProps, ChangePasswordRequest } from '../types';

/**
 * Komponen form untuk mengubah password user
 */
export const ChangePasswordForm = ({ onSubmit, isLoading = false }: ChangePasswordFormProps) => {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<ChangePasswordRequest>>({});

  const handleInputChange = (field: keyof ChangePasswordRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error saat user mulai mengetik
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordRequest> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini wajib diisi';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password baru minimal 8 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password harus mengandung huruf besar, kecil, angka, dan simbol';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Password baru harus berbeda dari password saat ini';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form setelah berhasil
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Error handling akan ditangani oleh parent component
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Ubah Password
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Masukkan password saat ini"
              disabled={isLoading}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Masukkan password baru"
              disabled={isLoading}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
            <p className="text-xs text-gray-500">
              Password harus minimal 8 karakter dengan kombinasi huruf besar, kecil, angka, dan simbol
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Konfirmasi password baru"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Mengubah Password...' : 'Ubah Password'}
          </Button>
        </form>
      </div>
    </Card>
  );
};