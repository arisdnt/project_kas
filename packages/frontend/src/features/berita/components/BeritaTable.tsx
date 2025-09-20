import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/core/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/core/components/ui/table';
import { BeritaItem, BeritaStatus } from '@/features/berita/types/berita';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Play, Pause, Trash2 } from 'lucide-react';

interface Props {
  items: BeritaItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onView: (item: BeritaItem) => void;
  onEdit: (item: BeritaItem) => void;
  onToggleStatus: (item: BeritaItem, status: BeritaStatus) => void;
  onDelete: (item: BeritaItem) => void;
  canManage: boolean;
}

const statusColor: Record<BeritaStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  aktif: 'bg-emerald-100 text-emerald-700',
  nonaktif: 'bg-amber-100 text-amber-700',
  kedaluwarsa: 'bg-rose-100 text-rose-700'
};

const tipeColor: Record<BeritaItem['tipeBerita'], string> = {
  informasi: 'bg-blue-100 text-blue-700',
  pengumuman: 'bg-purple-100 text-purple-700',
  peringatan: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const prioritasColor: Record<BeritaItem['prioritas'], string> = {
  rendah: 'bg-slate-100 text-slate-600',
  normal: 'bg-sky-100 text-sky-700',
  tinggi: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
};

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }
  try {
    return format(new Date(value), 'dd MMM yyyy HH:mm', { locale: idLocale });
  } catch (error) {
    return '-';
  }
}

export function BeritaTable({
  items,
  loading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  canManage
}: Props) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="w-[220px]">Judul & Konten</TableHead>
            <TableHead className="w-[150px]">Tipe</TableHead>
            <TableHead className="w-[160px]">Target</TableHead>
            <TableHead className="w-[120px]">Prioritas</TableHead>
            <TableHead className="w-[140px]">Jadwal</TableHead>
            <TableHead className="w-[110px]">Interval</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[120px]">Pembuat</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-sm text-slate-500">
                Belum ada berita yang memenuhi filter.
              </TableCell>
            </TableRow>
          ) : null}

          {loading ? (
            Array.from({ length: limit }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className="animate-pulse bg-white">
                <TableCell colSpan={9} className="py-7">
                  <div className="h-3 rounded bg-slate-200" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="transition hover:bg-slate-50/60">
                <TableCell>
                  <div className="space-y-1">
                    <p className="line-clamp-1 font-semibold text-slate-800">{item.judul}</p>
                    <p className="line-clamp-2 text-xs text-slate-500">{item.konten}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${tipeColor[item.tipeBerita]} border-0 px-2 py-0.5 text-xs capitalize`}>
                    {item.tipeBerita}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge className="border-0 bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">
                      {item.targetTampil.replace(/_/g, ' ')}
                    </Badge>
                    {item.targetTokoIds && item.targetTokoIds.length > 0 ? (
                      <p className="text-[11px] text-slate-500">{item.targetTokoIds.length} toko dituju</p>
                    ) : null}
                    {item.targetTenantIds && item.targetTenantIds.length > 0 ? (
                      <p className="text-[11px] text-slate-500">{item.targetTenantIds.length} tenant</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${prioritasColor[item.prioritas]} border-0 px-2 py-0.5 text-xs capitalize`}>
                    {item.prioritas}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-600">
                    <p>{formatDate(item.jadwalMulai)}</p>
                    <p className="text-[11px] text-slate-400">s/d {formatDate(item.jadwalSelesai)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-medium text-slate-700">
                    {item.intervalTampilMenit} menit
                  </p>
                  {item.maksimalTampil ? (
                    <p className="text-[11px] text-slate-400">Maks {item.maksimalTampil} kali</p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColor[item.status]} border-0 px-2 py-0.5 text-xs capitalize`}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-600">
                    <p className="font-medium text-slate-700">{item.namaUser}</p>
                    {item.namaToko ? (
                      <p className="text-[11px] text-slate-500">{item.namaToko}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40" align="end">
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => canManage && onEdit(item)} disabled={!canManage}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => canManage && onToggleStatus(item, item.status === 'aktif' ? 'nonaktif' : 'aktif')}
                        disabled={!canManage}
                      >
                        {item.status === 'aktif' ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" /> Nonaktifkan
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> Aktifkan
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => canManage && onDelete(item)}
                        disabled={!canManage}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {total === 0 ? 0 : start}-{end} dari {total} berita
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
            <span>{page}</span>
            <span className="text-slate-400">/</span>
            <span>{totalPages}</span>
          </div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
