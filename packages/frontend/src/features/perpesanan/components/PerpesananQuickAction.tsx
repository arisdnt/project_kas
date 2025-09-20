import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import id from 'date-fns/locale/id';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/core/components/ui/dropdown-menu';
import { Badge } from '@/core/components/ui/badge';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/lib/utils';
import { usePerpesananStore } from '@/features/perpesanan/store/perpesananStore';

export function PerpesananQuickAction() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const conversations = usePerpesananStore((state) => state.conversations);
  const conversationsLoading = usePerpesananStore((state) => state.conversationsLoading);
  const unreadCount = usePerpesananStore((state) => state.unreadCount);
  const initialized = usePerpesananStore((state) => state.conversationsInitialized);
  const fetchInitialData = usePerpesananStore((state) => state.fetchInitialData);
  const refreshConversations = usePerpesananStore((state) => state.refreshConversations);
  const refreshUnread = usePerpesananStore((state) => state.refreshUnread);

  useEffect(() => {
    if (!initialized) {
      fetchInitialData().catch(() => {});
    }
  }, [initialized, fetchInitialData]);

  const topConversations = useMemo(() => {
    return conversations.slice(0, 6);
  }, [conversations]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      refreshUnread().catch(() => {});
      refreshConversations().catch(() => {});
    }
  };

  const handleNavigate = (partnerId?: string) => {
    if (partnerId) {
      navigate(`/dashboard/perpesanan?partner=${partnerId}`);
    } else {
      navigate('/dashboard/perpesanan');
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
          title="Perpesanan"
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-0.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold h-4 min-w-[16px] px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Perpesanan</p>
            <p className="text-xs text-gray-500">Lihat percakapan terbaru Anda</p>
          </div>
          <Badge variant={unreadCount > 0 ? 'default' : 'outline'}>
            {unreadCount > 0 ? `${unreadCount} baru` : 'Tidak ada baru'}
          </Badge>
        </div>

        <ScrollArea className="max-h-80">
          <div className="py-2">
            {conversationsLoading && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500 gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Memuat percakapan...</span>
              </div>
            )}

            {!conversationsLoading && topConversations.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                Belum ada percakapan. Mulai kirim pesan ke tim Anda.
              </div>
            )}

            {!conversationsLoading && topConversations.map((item) => (
              <DropdownMenuItem
                key={item.partner.id}
                className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-900"
                onSelect={(event) => {
                  event.preventDefault();
                  handleNavigate(item.partner.id);
                }}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold uppercase">
                    {(item.partner.nama || item.partner.username || '?').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.partner.nama || item.partner.username}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.lastMessage.diperbarui_pada || item.lastMessage.dibuat_pada), {
                          addSuffix: true,
                          locale: id
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {item.lastMessage.pesan}
                    </p>
                    {item.unreadCount > 0 && (
                      <div className="mt-1">
                        <Badge className="text-[10px] px-1.5 py-0.5 bg-blue-600 text-white">
                          {item.unreadCount} belum dibaca
                        </Badge>
                      </div>
                    )}
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
            <span>Buka halaman perpesanan</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
