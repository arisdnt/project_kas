import { Card, CardContent } from '@/core/components/ui/card'
import { Aggregates } from '../types'
import { Wallet, ShoppingBag, Gauge, Percent } from 'lucide-react'

type Props = {
  data: Aggregates
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-gray-600">{label}</div>
            <div className="text-lg font-semibold text-gray-900">{value}</div>
            {sub && <div className="text-xs text-gray-500">{sub}</div>}
          </div>
          <div className="p-2 rounded-md bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SummaryCards({ data }: Props) {
  const { omzet, transaksi, rataRata, diskon } = data
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat icon={Wallet} label="Omzet" value={`Rp${omzet.toLocaleString('id-ID')}`} />
      <Stat icon={ShoppingBag} label="Transaksi" value={`${transaksi}`} />
      <Stat icon={Gauge} label="Rata-Rata" value={`Rp${Math.round(rataRata).toLocaleString('id-ID')}`} />
      <Stat icon={Percent} label="Diskon" value={`Rp${diskon.toLocaleString('id-ID')}`} />
    </div>
  )
}

