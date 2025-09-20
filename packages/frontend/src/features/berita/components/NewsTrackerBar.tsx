import { useEffect, useMemo, useState } from 'react';
import { useBeritaStore } from '@/features/berita/store/beritaStore';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { AlertTriangle, BellRing, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useBeritaRealtime } from '@/features/berita/hooks/useBeritaRealtime';

function clampDuration(minutes: number): number {
  const ms = minutes * 60000;
  const min = 15000;
  const max = 120000;
  return Math.min(Math.max(ms, min), max);
}

export function NewsTrackerBar() {
  const {
    activeNews,
    activeLoading,
    fetchActiveNews,
    lastActiveSync
  } = useBeritaStore((state) => ({
    activeNews: state.activeNews,
    activeLoading: state.activeLoading,
    fetchActiveNews: state.fetchActiveNews,
    lastActiveSync: state.lastActiveSync
  }));

  const [index, setIndex] = useState(0);

  useBeritaRealtime();

  useEffect(() => {
    fetchActiveNews();
  }, [fetchActiveNews]);

  useEffect(() => {
    if (activeNews.length === 0) {
      setIndex(0);
      return;
    }
    if (index >= activeNews.length) {
      setIndex(0);
    }
  }, [activeNews, index]);

  useEffect(() => {
    if (activeNews.length === 0) {
      return;
    }
    const current = activeNews[index];
    const duration = clampDuration(current?.intervalTampilMenit ?? 1);
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % activeNews.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [activeNews, index]);

  const content = useMemo(() => {
    if (activeNews.length === 0) {
      return null;
    }
    return activeNews[index];
  }, [activeNews, index]);

  if (activeLoading && activeNews.length === 0) {
    return (
      <div className="fixed bottom-[48px] left-0 right-0 z-40 border-y border-blue-200 bg-blue-600/90 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm">
          <Radio className="h-4 w-4 animate-pulse" />
          <div className="flex-1">
            <div className="h-3 w-3/4 animate-pulse rounded bg-blue-500/50" />
          </div>
          <div className="flex gap-1">
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-500/50" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-500/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="fixed bottom-[48px] left-0 right-0 z-40 border-y border-blue-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm">
        <div className="flex items-center gap-2 font-semibold uppercase tracking-wide">
          <BellRing className="h-4 w-4" />
          News Tracker
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-3">
            <Badge className="border-0 bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {content.prioritas}
            </Badge>
            <div className="truncate font-semibold">
              {content.judul}
            </div>
            <p className="hidden text-xs text-blue-100 md:block">
              {format(new Date(content.jadwalMulai), 'dd MMM yyyy HH:mm', { locale: idLocale })}
            </p>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-blue-100">
            {content.konten}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/80 hover:bg-white/20"
            onClick={() => setIndex((prev) => (prev - 1 + activeNews.length) % activeNews.length)}
            aria-label="Berita sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/80 hover:bg-white/20"
            onClick={() => setIndex((prev) => (prev + 1) % activeNews.length)}
            aria-label="Berita berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-1 text-[11px] text-blue-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Ditampilkan setiap {content.intervalTampilMenit} menit — Target: {content.targetTampil.replace(/_/g, ' ')}
        </div>
        <div>
          Pembaruan {lastActiveSync ? format(new Date(lastActiveSync), 'HH:mm:ss') : '-'} WIB
        </div>
      </div>
    </div>
  );
}
