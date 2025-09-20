import { ReactNode } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Badge } from '@/core/components/ui/badge';
import { PerpesananMessage } from '@/features/perpesanan/types/perpesanan';

type Props = {
  message: PerpesananMessage;
  isOwn: boolean;
  partnerInitials: string;
};

function getStatusIcon(status: string): ReactNode {
  const normalized = status === 'dikirim' ? 'terkirim' : status;
  if (normalized === 'dibaca' || normalized === 'dibalas') {
    return <CheckCheck className="h-3.5 w-3.5 text-blue-100/90" strokeWidth={2} />;
  }
  if (normalized === 'terkirim') {
    return <Check className="h-3.5 w-3.5 text-blue-100/70" strokeWidth={2} />;
  }
  if (normalized === 'dihapus') {
    return <AlertTriangle className="h-3.5 w-3.5 text-amber-200" strokeWidth={2} />;
  }
  return null;
}

function formatTime(timestamp?: string | null): string {
  if (!timestamp) {
    return '';
  }
  try {
    return format(new Date(timestamp), 'HH:mm');
  } catch {
    return '';
  }
}

export function MessageBubble({ message, isOwn, partnerInitials }: Props) {
  const timeLabel = formatTime(message.dibuat_pada);
  const priorityBadge = message.prioritas !== 'normal' && (
    <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">{message.prioritas}</Badge>
  );
  const statusIcon = isOwn ? getStatusIcon(message.status) : null;

  return (
    <div className={cn('flex w-full gap-2 mb-4', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && (
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold uppercase">
          {partnerInitials}
        </div>
      )}
      <div className={cn('max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm', isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-50 text-gray-900 rounded-bl-none border border-gray-200')}>
        <div className="flex items-center gap-2 mb-1.5">
          {priorityBadge}
          <span className="text-[11px] opacity-70">{timeLabel}</span>
          {isOwn && statusIcon}
        </div>
        <p className="text-sm whitespace-pre-line leading-relaxed">
          {message.pesan}
        </p>
      </div>
      {isOwn && (
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase">
          Anda
        </div>
      )}
    </div>
  );
}
