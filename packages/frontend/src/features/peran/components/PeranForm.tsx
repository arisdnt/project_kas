import React, { useState, useEffect } from 'react';
import { peranService, CreatePeranInput, PeranDTO, UpdatePeranInput } from '../services/peranService';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/core/components/ui/select';
import { Button } from '@/core/components/ui/button';
import { Label } from '@/core/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Shield, UserPlus, Users } from 'lucide-react';

interface PeranFormProps {
  mode: 'create' | 'edit';
  initialData?: PeranDTO | null;
  onSuccess: (peran: PeranDTO) => void;
  onCancel: () => void;
}

export const PeranForm: React.FC<PeranFormProps> = ({ mode, initialData, onSuccess, onCancel }) => {
  const [form, setForm] = useState<CreatePeranInput>({ nama: '', deskripsi: '', level: 1, status: 'aktif' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        nama: initialData.nama,
        deskripsi: initialData.deskripsi || '',
        level: initialData.level || 1,
        status: initialData.status
      });
    }
  }, [mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'level' ? (value ? parseInt(value, 10) : undefined) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let result: PeranDTO;
      if (mode === 'create') {
        result = await peranService.create(form);
      } else if (initialData) {
        const update: UpdatePeranInput = {};
        if (form.nama !== initialData.nama) update.nama = form.nama;
        if (form.deskripsi !== (initialData.deskripsi || '')) update.deskripsi = form.deskripsi;
        if (form.level !== initialData.level) update.level = form.level;
        if (form.status !== initialData.status) update.status = form.status;
        result = await peranService.update(initialData.id, update);
      } else {
        throw new Error('Invalid form state');
      }
      onSuccess(result);
    } catch (err:any) {
      setError(err.message || 'Gagal menyimpan peran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {mode === 'create' ? 'Tambah Peran Baru' : 'Edit Peran'}
              </CardTitle>
              <CardDescription>
                {mode === 'create'
                  ? 'Lengkapi informasi di bawah ini untuk menambah peran baru.'
                  : 'Perbarui informasi peran di bawah ini.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Peran <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nama"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Masukkan nama peran"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium">
                  Level
                </Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  min={1}
                  value={form.level}
                  onChange={handleChange}
                  disabled={loading}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi
              </Label>
              <Textarea
                id="deskripsi"
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Masukkan deskripsi peran"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                name="status"
                value={form.status}
                onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}
                disabled={loading}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Aktif
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="nonaktif">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        Nonaktif
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <div>{error}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-5 py-2 h-10 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : mode === 'create' ? (
                  'Simpan Peran'
                ) : (
                  'Update Peran'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
