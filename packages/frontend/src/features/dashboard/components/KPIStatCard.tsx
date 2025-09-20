import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';

type Trend = 'up' | 'down' | 'flat';

interface KPIStatCardProps {
  title: string;
  value: string;
  helper?: string;
  delta?: {
    value: string;
    trend: Trend;
  };
  icon?: ReactNode;
}

const trendStyles: Record<Trend, {
  label: string;
  badgeClass: string;
  labelClass: string;
  Icon: typeof TrendingUp;
}> = {
  up: {
    label: 'lebih tinggi',
    badgeClass: 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/20',
    labelClass: 'text-emerald-600',
    Icon: TrendingUp,
  },
  down: {
    label: 'lebih rendah',
    badgeClass: 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-500/20',
    labelClass: 'text-rose-600',
    Icon: TrendingDown,
  },
  flat: {
    label: 'stabil',
    badgeClass: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-400/20',
    labelClass: 'text-slate-600',
    Icon: Minus,
  },
};

export function KPIStatCard({ title, value, helper, delta, icon }: KPIStatCardProps) {
  const trend = delta ? trendStyles[delta.trend] : null;

  return (
    <Card className="relative h-full overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-sky-500/70 to-indigo-500/70" />
      <CardContent className="relative z-[1] flex h-full flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">{value}</p>
            {helper && (
              <p className="text-sm text-muted-foreground">{helper}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner shadow-primary/10">
              {icon}
            </div>
          )}
        </div>

        {delta && trend && (
          <div className="mt-auto flex items-center justify-between text-sm">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${trend.badgeClass}`}>
              <trend.Icon className="h-3.5 w-3.5" />
              {delta.value}
            </span>
            <span className={`text-xs font-medium ${trend.labelClass}`}>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
