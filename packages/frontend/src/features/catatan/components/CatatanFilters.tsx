import { ChangeEvent, useMemo } from 'react';
import { Search, RotateCcw, Plus, Bell } from 'lucide-react';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Switch } from '@/core/components/ui/switch';
import { Label } from '@/core/components/ui/label';
import { CatatanFilters as FilterModel } from '@/features/catatan/types/catatan';
import { cn } from '@/core/lib/utils';

type Props = {
  filters: FilterModel;
  onChange: (partial: Partial<FilterModel>) => void;
  onReset: () => void;
  onCreate: () => void;
  loading?: boolean;
};

const visibilityOptions = [
  { value: 'pribadi', label: 'Pribadi • hanya saya' },
  { value: 'toko', label: 'Toko • seluruh toko tenant' },
  { value: 'tenant', label: 'Tenant • semua pengguna tenant' },
  { value: 'publik', label: 'Publik • lintas tenant' }
] as const;

const priorityOptions = [
  { value: 'tinggi', label: 'Tinggi' },
  { value: 'normal', label: 'Normal' },
  { value: 'rendah', label: 'Rendah' }
] as const;

const statusOptions = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'draft', label: 'Draft' },
  { value: 'arsip', label: 'Arsip' }
] as const;

export function CatatanFilters({ filters, onChange, onReset, onCreate, loading }: Props) {
  const tagsValue = useMemo(() => (filters.tags?.length ? filters.tags.join(', ') : ''), [filters.tags]);

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    onChange({ tags: tags.length ? tags : undefined });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari judul atau konten catatan..."
            className="pl-9"
            value={filters.search ?? ''}
            onChange={(event) => onChange({ search: event.target.value || undefined })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onReset} className="text-gray-600">
            <RotateCcw className="mr-2 h-4 w-4" />Reset
          </Button>
          <Button type="button" onClick={onCreate} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />Catatan Baru
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="catatan-visibilitas" className="text-xs uppercase tracking-wide text-gray-500">
            Visibilitas
          </Label>
          <Select
            value={filters.visibilitas ?? 'all'}
            onValueChange={(value) => onChange({ visibilitas: value === 'all' ? undefined : (value as FilterModel['visibilitas']) })}
          >
            <SelectTrigger id="catatan-visibilitas">
              <SelectValue placeholder="Semua visibilitas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua visibilitas</SelectItem>
              {visibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="catatan-prioritas" className="text-xs uppercase tracking-wide text-gray-500">
            Prioritas
          </Label>
          <Select
            value={filters.prioritas ?? 'all'}
            onValueChange={(value) => onChange({ prioritas: value === 'all' ? undefined : (value as FilterModel['prioritas']) })}
          >
            <SelectTrigger id="catatan-prioritas">
              <SelectValue placeholder="Semua prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua prioritas</SelectItem>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="catatan-status" className="text-xs uppercase tracking-wide text-gray-500">
            Status
          </Label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) => onChange({ status: value === 'all' ? undefined : (value as FilterModel['status']) })}
          >
            <SelectTrigger id="catatan-status">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="catatan-kategori" className="text-xs uppercase tracking-wide text-gray-500">
            Kategori
          </Label>
          <Input
            id="catatan-kategori"
            placeholder="Contoh: operasional, onboarding"
            value={filters.kategori ?? ''}
            onChange={(event) => onChange({ kategori: event.target.value || undefined })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="catatan-toko" className="text-xs uppercase tracking-wide text-gray-500">
            ID Toko
          </Label>
          <Input
            id="catatan-toko"
            placeholder="Filter berdasarkan toko (opsional)"
            value={filters.toko_id ?? ''}
            onChange={(event) => onChange({ toko_id: event.target.value || undefined })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="catatan-user" className="text-xs uppercase tracking-wide text-gray-500">
            ID Pengguna
          </Label>
          <Input
            id="catatan-user"
            placeholder="Filter berdasarkan pembuat"
            value={filters.user_id ?? ''}
            onChange={(event) => onChange({ user_id: event.target.value || undefined })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="catatan-tags" className="text-xs uppercase tracking-wide text-gray-500">
            Tags
          </Label>
          <Input
            id="catatan-tags"
            placeholder="pisahkan dengan koma"
            value={tagsValue}
            onChange={handleTagsChange}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-gray-500">Pengingat aktif</Label>
          <div className={cn('flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2', filters.has_reminder ? 'bg-blue-50 border-blue-200' : 'bg-white')}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bell className="h-4 w-4 text-blue-500" />
              Hanya catatan dengan pengingat
            </div>
            <Switch
              checked={Boolean(filters.has_reminder)}
              onCheckedChange={(checked) => onChange({ has_reminder: checked ? true : undefined })}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="catatan-start" className="text-xs uppercase tracking-wide text-gray-500">
            Dari Tanggal
          </Label>
          <Input
            id="catatan-start"
            type="date"
            value={filters.tanggal_mulai ?? ''}
            onChange={(event) => onChange({ tanggal_mulai: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="catatan-end" className="text-xs uppercase tracking-wide text-gray-500">
            Sampai Tanggal
          </Label>
          <Input
            id="catatan-end"
            type="date"
            value={filters.tanggal_selesai ?? ''}
            onChange={(event) => onChange({ tanggal_selesai: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-1 text-right text-xs text-gray-400">
          {loading ? 'Memuat catatan...' : 'Filter aktif akan diterapkan otomatis'}
        </div>
      </div>
    </div>
  );
}
