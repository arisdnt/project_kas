import { Fragment } from 'react';
import { FileText, Pencil, Trash2, Globe2, Building2, Users, User, MoreVertical } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/core/components/ui/dropdown-menu';
import { CatatanRecord } from '@/features/catatan/types/catatan';
import { cn } from '@/core/lib/utils';

const visibilityIcon: Record<string, React.ReactNode> = {
  pribadi: <User className="h-3.5 w-3.5" />,
  toko: <Building2 className="h-3.5 w-3.5" />,
  tenant: <Users className="h-3.5 w-3.5" />,
  publik: <Globe2 className="h-3.5 w-3.5" />
};

const visibilityTone: Record<string, string> = {
  pribadi: 'bg-gray-100 text-gray-600',
  toko: 'bg-amber-100 text-amber-700',
  tenant: 'bg-blue-100 text-blue-700',
  publik: 'bg-emerald-100 text-emerald-700'
};

type Props = {
  items: CatatanRecord[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
  onEdit: (record: CatatanRecord) => void;
  onDelete: (record: CatatanRecord) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function CatatanList({
  items,
  loading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange
}: Props) {
  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="h-4 w-4 text-blue-500" />
          Catatan ({items.length})
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrev} disabled={loading || page <= 1}>
            Sebelumnya
          </Button>
          <span className="text-xs text-gray-500">
            Halaman {totalPages === 0 ? 0 : page} dari {totalPages}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNext} disabled={loading || page >= totalPages || totalPages === 0}>
            Selanjutnya
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="flex flex-col gap-2 px-4 py-5 text-sm text-gray-500">
              <span className="animate-pulse rounded-lg bg-gray-100 px-4 py-3" />
              <span className="animate-pulse rounded-lg bg-gray-100 px-4 py-3" />
              <span className="animate-pulse rounded-lg bg-gray-100 px-4 py-3" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Belum ada catatan yang sesuai filter.
            </div>
          )}

          {!loading && items.map((item) => {
            const isActive = item.id === selectedId;
            const icon = visibilityIcon[item.visibilitas];
            const tone = visibilityTone[item.visibilitas];
            const tags = item.tags ?? [];
            const reminder = item.reminder_pada ? new Date(item.reminder_pada).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null;
            return (
              <Fragment key={item.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(item.id);
                    }
                  }}
                  className={cn(
                    'flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-blue-50/60 focus:bg-blue-50/60 focus:outline-none',
                    isActive ? 'bg-blue-50/80 border-l-4 border-blue-500' : 'bg-white'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.judul}</p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.konten}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => onEdit(item)} className="gap-2">
                          <Pencil className="h-4 w-4 text-blue-500" />
                          Edit Catatan
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDelete(item)} className="gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    <Badge className={cn('flex items-center gap-1 text-[11px]', tone)}>
                      {icon}
                      <span className="capitalize">{item.visibilitas}</span>
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      {item.prioritas === 'tinggi' ? 'Prioritas Tinggi' : item.prioritas === 'rendah' ? 'Prioritas Rendah' : 'Prioritas Normal'}
                    </Badge>
                    <span className="text-gray-400">•</span>
                    <span>{new Date(item.diperbarui_pada).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    <span className="text-gray-400">•</span>
                    <span className="line-clamp-1">oleh {item.pembuat.nama || item.pembuat.username}</span>
                    {reminder && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-amber-600">Pengingat {reminder}</span>
                      </>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
