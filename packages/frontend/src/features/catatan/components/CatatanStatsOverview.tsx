import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { CatatanStats } from '@/features/catatan/types/catatan';
import { cn } from '@/core/lib/utils';

const visibilityLabels: Record<string, { label: string; tone: string; description: string }> = {
  pribadi: { label: 'Pribadi', tone: 'bg-gray-100 text-gray-600', description: 'Hanya Anda yang dapat melihat' },
  toko: { label: 'Toko', tone: 'bg-amber-100 text-amber-700', description: 'Seluruh toko di tenant' },
  tenant: { label: 'Tenant', tone: 'bg-blue-100 text-blue-700', description: 'Semua pengguna tenant' },
  publik: { label: 'Publik', tone: 'bg-emerald-100 text-emerald-700', description: 'Lintas tenant' }
};

const priorityLabels: Record<string, { label: string; tone: string }> = {
  rendah: { label: 'Rendah', tone: 'bg-slate-100 text-slate-600' },
  normal: { label: 'Normal', tone: 'bg-sky-100 text-sky-700' },
  tinggi: { label: 'Tinggi', tone: 'bg-rose-100 text-rose-700' }
};

type Props = {
  stats?: CatatanStats;
  loading?: boolean;
};

export function CatatanStatsOverview({ stats, loading }: Props) {
  const total = loading ? '...' : stats?.total_catatan ?? 0;
  const active = loading ? '...' : stats?.catatan_aktif ?? 0;
  const reminders = loading ? '...' : stats?.reminder_mendatang ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-blue-700">Total Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-blue-900">{total}</p>
          <p className="mt-2 text-xs text-blue-700/80">Seluruh catatan yang dapat Anda akses.</p>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-emerald-600">Catatan Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-emerald-800">{active}</p>
          <p className="mt-2 text-xs text-emerald-700/80">Catatan yang siap diakses dan belum diarsip.</p>
        </CardContent>
      </Card>

      <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-amber-600">Pengingat Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-amber-800">{reminders}</p>
          <p className="mt-2 text-xs text-amber-700/80">Pengingat aktif dalam 30 hari terakhir.</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Distribusi Visibilitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['pribadi', 'toko', 'tenant', 'publik'] as const).map((key) => {
              const config = visibilityLabels[key];
              const value = loading ? '...' : stats?.catatan_per_visibilitas?.[key] ?? 0;
              return (
                <div key={key} className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{config.label}</p>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                  <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', config.tone)}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Prioritas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {(['tinggi', 'normal', 'rendah'] as const).map((level) => {
              const config = priorityLabels[level];
              const value = loading ? '...' : stats?.catatan_per_prioritas?.[level] ?? 0;
              return (
                <div key={level} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge className={cn('capitalize', config.tone)}>{config.label}</Badge>
                    <span className="text-xs text-gray-500">
                      {level === 'tinggi' ? 'Butuh perhatian segera' : level === 'normal' ? 'Aktivitas umum' : 'Catatan ringan'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
