import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { BeritaStats } from '@/features/berita/types/berita';
import { Newspaper, AlarmClock, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

interface Props {
  stats?: BeritaStats;
  loading: boolean;
  onRefresh: () => void;
}

const cards = [
  {
    key: 'totalBerita' as const,
    title: 'Total Berita',
    description: 'Semua berita yang pernah dibuat',
    icon: Newspaper,
    accent: 'text-blue-600'
  },
  {
    key: 'totalAktif' as const,
    title: 'Berita Aktif',
    description: 'Sedang tayang di tracker',
    icon: CheckCircle2,
    accent: 'text-emerald-600'
  },
  {
    key: 'totalDraft' as const,
    title: 'Draft',
    description: 'Menunggu review / publikasi',
    icon: Layers,
    accent: 'text-slate-600'
  },
  {
    key: 'totalKedaluwarsa' as const,
    title: 'Kedaluwarsa',
    description: 'Tidak lagi ditayangkan',
    icon: AlarmClock,
    accent: 'text-amber-600'
  },
  {
    key: 'beritaUrgent' as const,
    title: 'Urgent',
    description: 'Perlu perhatian segera',
    icon: AlertTriangle,
    accent: 'text-red-600'
  }
];

export function BeritaStatsCards({ stats, loading, onRefresh }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, title, description, icon: Icon, accent }) => (
        <Card key={key} className="relative overflow-hidden border border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
              <Icon className={`h-5 w-5 ${accent}`} />
            </div>
            <CardDescription className="text-xs text-slate-500">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold tracking-tight text-slate-900">
                {loading ? (
                  <span className="inline-flex h-8 w-16 animate-pulse rounded bg-slate-200" />
                ) : (
                  stats?.[key] ?? 0
                )}
              </p>
              {key === 'totalBerita' && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={onRefresh} disabled={loading}>
                  <ReloadIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            {key === 'beritaUrgent' && stats ? (
              <p className="mt-1 text-xs text-red-500">
                {stats.beritaHariIni} berita baru hari ini
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
