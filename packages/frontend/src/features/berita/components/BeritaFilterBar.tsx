import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { BeritaFilters } from '@/features/berita/store/beritaStore';
import { CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  filters: BeritaFilters;
  onFilterChange: <K extends keyof BeritaFilters>(key: K, value: BeritaFilters[K]) => void;
  onReset: () => void;
}

const tipeOptions = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'informasi', label: 'Informasi' },
  { value: 'pengumuman', label: 'Pengumuman' },
  { value: 'peringatan', label: 'Peringatan' },
  { value: 'urgent', label: 'Urgent' }
] as const;

const targetOptions = [
  { value: 'all', label: 'Semua Target' },
  { value: 'toko_tertentu', label: 'Toko Tertentu' },
  { value: 'semua_toko_tenant', label: 'Semua Toko Tenant' },
  { value: 'semua_tenant', label: 'Semua Tenant' }
] as const;

const prioritasOptions = [
  { value: 'all', label: 'Semua Prioritas' },
  { value: 'rendah', label: 'Rendah' },
  { value: 'normal', label: 'Normal' },
  { value: 'tinggi', label: 'Tinggi' },
  { value: 'urgent', label: 'Urgent' }
] as const;

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'kedaluwarsa', label: 'Kedaluwarsa' }
] as const;

const sortOptions = [
  { value: 'dibuat_pada:desc', label: 'Terbaru' },
  { value: 'dibuat_pada:asc', label: 'Terlama' },
  { value: 'jadwal_mulai:asc', label: 'Jadwal Terdekat' },
  { value: 'jadwal_mulai:desc', label: 'Jadwal Terjauh' },
  { value: 'prioritas:desc', label: 'Prioritas Tinggi' },
  { value: 'prioritas:asc', label: 'Prioritas Rendah' },
  { value: 'judul:asc', label: 'Judul A-Z' },
  { value: 'judul:desc', label: 'Judul Z-A' }
] as const;

export function BeritaFilterBar({ filters, onFilterChange, onReset }: Props) {
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.q ||
      filters.tipeBerita ||
      filters.targetTampil ||
      filters.prioritas ||
      filters.status ||
      filters.jadwalMulaiDari ||
      filters.jadwalMulaiSampai ||
      filters.sortBy !== 'dibuat_pada' ||
      filters.sortOrder !== 'desc'
    );
  }, [filters]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Filter Berita</h3>
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Cari judul atau konten..."
              value={filters.q}
              onChange={(event) => onFilterChange('q', event.target.value)}
              className="w-full pr-10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">⌘K</span>
          </div>
          <div className="flex gap-2">
            <Select
              value={filters.tipeBerita ?? 'all'}
              onValueChange={(value) => onFilterChange('tipeBerita', value === 'all' ? undefined : (value as any))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                {tipeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : (value as any))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.prioritas ?? 'all'}
              onValueChange={(value) => onFilterChange('prioritas', value === 'all' ? undefined : (value as any))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                {prioritasOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={filters.targetTampil ?? 'all'}
            onValueChange={(value) => onFilterChange('targetTampil', value === 'all' ? undefined : (value as any))}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Target Tampil" />
            </SelectTrigger>
            <SelectContent>
              {targetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarIcon className="h-4 w-4" />
            <span>Jadwal Mulai</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.jadwalMulaiDari ? filters.jadwalMulaiDari.slice(0, 10) : ''}
              onChange={(event) => {
                const value = event.target.value ? new Date(event.target.value).toISOString() : undefined;
                onFilterChange('jadwalMulaiDari', value);
              }}
              className="w-[160px]"
            />
            <span className="text-slate-400">s/d</span>
            <Input
              type="date"
              value={filters.jadwalMulaiSampai ? filters.jadwalMulaiSampai.slice(0, 10) : ''}
              onChange={(event) => {
                const value = event.target.value ? new Date(event.target.value).toISOString() : undefined;
                onFilterChange('jadwalMulaiSampai', value);
              }}
              className="w-[160px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split(':');
              onFilterChange('sortBy', sortBy as any);
              onFilterChange('sortOrder', (sortOrder as 'asc' | 'desc') ?? 'desc');
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onReset} disabled={!hasActiveFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
