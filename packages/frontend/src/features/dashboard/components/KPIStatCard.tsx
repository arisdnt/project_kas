import { Card, CardContent } from '@/core/components/ui/card';

interface KPIStatCardProps {
  title: string;
  value: string;
  helper?: string;
  delta?: {
    value: string;
    trend: 'up' | 'down' | 'flat';
  };
  icon?: React.ReactNode;
}

export function KPIStatCard({ title, value, helper, delta, icon }: KPIStatCardProps) {
  // Warna biru dan kuning muda untuk delta
  const deltaColor = delta?.trend === 'up'
    ? 'text-blue-600'
    : delta?.trend === 'down'
      ? 'text-amber-600'
      : 'text-gray-500';

  const deltaBg = delta?.trend === 'up'
    ? 'bg-blue-50/80'
    : delta?.trend === 'down'
      ? 'bg-amber-50/80'
      : 'bg-gray-50/80';

  // Warna biru dan kuning muda untuk background card
  const cardBg = 'bg-gradient-to-br from-blue-50 to-amber-50 backdrop-blur-sm';
  const borderColor = 'border border-blue-100/60 shadow-sm';

  return (
    <Card className={`h-full ${cardBg} ${borderColor}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            {helper && (
              <p className="mt-1 text-xs text-gray-500">{helper}</p>
            )}
          </div>
          {icon && (
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-100 to-amber-100 text-blue-600 shadow-sm">
              {icon}
            </div>
          )}
        </div>
        {delta && (
          <div className={`mt-3 inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full ${deltaBg} ${deltaColor} backdrop-blur-sm`}>
            <span className="font-semibold">{delta.value}</span>
            <span className="text-xs">{delta.trend === 'up' ? 'lebih tinggi' : delta.trend === 'down' ? 'lebih rendah' : 'stabil'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
