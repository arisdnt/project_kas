import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowRight, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/core/components/ui/dropdown-menu';
import { Badge } from '@/core/components/ui/badge';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Button } from '@/core/components/ui/button';
import { useCatatanStore } from '@/features/catatan/store/catatanStore';
import { cn } from '@/core/lib/utils';

export function CatatanQuickAction() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const quickItems = useCatatanStore((state) => state.quickItems);
  const quickLoading = useCatatanStore((state) => state.quickLoading);
  const fetchQuickItems = useCatatanStore((state) => state.fetchQuickItems);
  const fetchStats = useCatatanStore((state) => state.fetchStats);
  const stats = useCatatanStore((state) => state.stats);
  const initialized = useCatatanStore((state) => state.initialized);
  const initialize = useCatatanStore((state) => state.initialize);

  useEffect(() => {
    if (!initialized) {
      initialize().catch(() => {});
    }
  }, [initialized, initialize]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      fetchQuickItems().catch(() => {});
      fetchStats().catch(() => {});
    }
  };

  const reminderCount = stats?.reminder_mendatang ?? 0;

  const handleNavigate = (id?: string) => {
    if (id) {
      navigate(`/dashboard/catatan?highlight=${id}`);
    } else {
      navigate('/dashboard/catatan');
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative hidden md:flex items-center justify-center p-2 rounded-lg transition-colors',
            'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
          )}
          title="Catatan"
        >
          <BookOpen className="h-5 w-5" />
          {reminderCount > 0 && (
            <span className="absolute -top-1 -right-0.5 inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-semibold h-4 min-w-[16px] px-1">
              {reminderCount > 99 ? '99+' : reminderCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Catatan Terbaru</p>
            <p className="text-xs text-gray-500">Akses cepat catatan penting untuk tim</p>
          </div>
          <Badge variant={reminderCount > 0 ? 'default' : 'outline'} className="gap-1 text-[11px]">
            <Clock className="h-3 w-3" />
            {reminderCount > 0 ? `${reminderCount} pengingat` : 'Tidak ada pengingat'}
          </Badge>
        </div>

        <ScrollArea className="max-h-80">
          <div className="py-2">
            {quickLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Memuat catatan...</span>
              </div>
            )}

            {!quickLoading && quickItems.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Belum ada catatan. Mulai dokumentasikan SOP penting Anda di sini.
              </div>
            )}

            {!quickLoading && quickItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-900"
                onSelect={(event) => {
                  event.preventDefault();
                  handleNavigate(item.id);
                }}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.judul}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(item.diperbarui_pada).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.konten}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                      {item.visibilitas}
                    </Badge>
                    <span>•</span>
                    <span>{item.pembuat.nama || item.pembuat.username}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-100 px-4 py-3">
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleNavigate()}
          >
            <span>Buka halaman catatan</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
