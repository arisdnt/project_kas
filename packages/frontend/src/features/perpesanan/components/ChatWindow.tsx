import { useEffect, useMemo, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from '@/features/perpesanan/components/MessageBubble';
import { PerpesananMessage } from '@/features/perpesanan/types/perpesanan';

interface Props {
  messages: PerpesananMessage[];
  currentUserId?: string;
  partnerName?: string;
  loading?: boolean;
}

export function ChatWindow({ messages, currentUserId, partnerName, loading = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const partnerInitials = useMemo(() => (partnerName || '?').slice(0, 2), [partnerName]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  return (
    <div className="flex-1 bg-slate-50/60">
      <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6">
        {loading && (
          <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-gray-500">
            Memuat percakapan...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-gray-500">
            <MessageSquare className="h-10 w-10" />
            <div className="text-sm">Belum ada pesan pada percakapan ini.</div>
            <div className="text-xs">Mulai obrolan dengan mengetik pesan di bawah.</div>
          </div>
        )}

        {!loading && messages.map((message) => {
          const isOwn = currentUserId != null && message.pengirim_id === currentUserId;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              partnerInitials={partnerInitials}
            />
          );
        })}
      </div>
    </div>
  );
}
