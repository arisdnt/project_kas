import { ChangeEvent, useMemo } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import id from 'date-fns/locale/id';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/lib/utils';
import { ConversationSummary } from '@/features/perpesanan/types/perpesanan';

type Props = {
  conversations: ConversationSummary[];
  loading: boolean;
  activePartnerId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (partnerId: string) => void;
  onCompose: () => void;
};

export function ConversationList({
  conversations,
  loading,
  activePartnerId,
  search,
  onSearchChange,
  onSelect,
  onCompose
}: Props) {
  const filteredConversations = useMemo(() => {
    if (!search) {
      return conversations;
    }
    const keyword = search.toLowerCase();
    return conversations.filter((conversation) => {
      const partnerName = conversation.partner.nama || conversation.partner.username || '';
      const message = conversation.lastMessage.pesan || '';
      return partnerName.toLowerCase().includes(keyword) || message.toLowerCase().includes(keyword);
    });
  }, [conversations, search]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="px-4 py-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Percakapan</h2>
            <p className="text-xs text-gray-500">Kelola pesan internal antar pengguna.</p>
          </div>
          <Button size="sm" onClick={onCompose} className="gap-1.5">
            <MessageCircle className="h-4 w-4" />
            Pesan Baru
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama atau isi pesan..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="px-4 py-6 text-sm text-gray-500">Memuat percakapan...</div>
          )}

          {!loading && filteredConversations.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">
              {search ? 'Tidak ada percakapan yang cocok.' : 'Belum ada percakapan.'}
            </div>
          )}

          {!loading && filteredConversations.map((conversation) => {
            const partnerId = conversation.partner.id;
            const isActive = partnerId === activePartnerId;
            const lastTimestamp = conversation.lastMessage.diperbarui_pada || conversation.lastMessage.dibuat_pada;
            const timeLabel = lastTimestamp
              ? formatDistanceToNow(new Date(lastTimestamp), { addSuffix: true, locale: id })
              : '';

            return (
              <button
                key={partnerId}
                type="button"
                onClick={() => onSelect(partnerId)}
                className={cn(
                  'w-full px-4 py-3 text-left transition-colors',
                  'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                  isActive ? 'bg-blue-50/70 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold uppercase',
                    conversation.isUnread && 'ring-2 ring-blue-300'
                  )}>
                    {(conversation.partner.nama || conversation.partner.username || '?').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conversation.partner.nama || conversation.partner.username}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeLabel}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {conversation.lastMessage.pesan}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div className="mt-2">
                        <Badge className="bg-blue-600 text-white text-[10px] px-2 py-0.5">
                          {conversation.unreadCount} belum dibaca
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
