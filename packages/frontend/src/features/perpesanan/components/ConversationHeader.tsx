import { RefreshCcw, CheckSquare } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/lib/utils';

interface Props {
  partnerName?: string;
  partnerUsername?: string;
  unreadCount?: number;
  onMarkAsRead: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function ConversationHeader({
  partnerName,
  partnerUsername,
  unreadCount = 0,
  onMarkAsRead,
  onRefresh,
  loading = false
}: Props) {
  const displayName = partnerName || partnerUsername || 'Pilih percakapan';
  const initials = (partnerName || partnerUsername || '?').slice(0, 2);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold uppercase">
          {initials}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{displayName}</h3>
          <p className="text-xs text-gray-500">
            {partnerUsername ? `@${partnerUsername}` : 'Sistem perpesanan internal tenant'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-blue-600 text-white text-[11px] px-2 py-0.5">{unreadCount} pesan baru</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('gap-2', unreadCount === 0 && 'hidden md:flex')}
          onClick={onMarkAsRead}
          disabled={unreadCount === 0}
        >
          <CheckSquare className="h-4 w-4" />
          Tandai dibaca
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-2" onClick={onRefresh} disabled={loading}>
          <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Segarkan
        </Button>
      </div>
    </div>
  );
}
