import React, { useState, useEffect } from 'react';
import { peranService, CreatePeranInput, PeranDTO, UpdatePeranInput } from '../services/peranService';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Nama<span className="text-red-500">*</span></label>
        <input name="nama" value={form.nama} onChange={handleChange} required disabled={loading}
               className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Deskripsi</label>
        <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} disabled={loading}
                  className="w-full border rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring focus:ring-blue-200" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Level</label>
          <input name="level" type="number" min={1} value={form.level} onChange={handleChange} disabled={loading}
                 className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} disabled={loading}
                  className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring focus:ring-blue-200">
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50" disabled={loading}>Batal</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Menyimpan...' : (mode === 'create' ? 'Simpan' : 'Update')}
        </button>
      </div>
    </form>
  );
};
