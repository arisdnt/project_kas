import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { SaleRecord } from '../types'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import * as Tabs from '@radix-ui/react-tabs'
import { useMemo, useState } from 'react'

type RangeKey = 'omzet' | 'transaksi'

function toSeries(data: SaleRecord[]) {
  const map = new Map<string, { label: string; omzet: number; transaksi: number }>()
  for (const s of data) {
    const key = s.date
    const current = map.get(key) || { label: key.slice(5), omzet: 0, transaksi: 0 }
    current.omzet += s.total
    current.transaksi += 1
    map.set(key, current)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, v]) => v)
}

export function SalesChart({ data }: { data: SaleRecord[] }) {
  const [tab, setTab] = useState<RangeKey>('omzet')
  const series = useMemo(() => toSeries(data), [data])

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Grafik Penjualan</CardTitle>
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as RangeKey)}>
            <Tabs.List className="inline-flex gap-1 rounded-md bg-gray-100 p-1">
              <Tabs.Trigger value="omzet" className={`px-2.5 py-1.5 text-xs font-medium rounded ${tab === 'omzet' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                Omzet
              </Tabs.Trigger>
              <Tabs.Trigger value="transaksi" className={`px-2.5 py-1.5 text-xs font-medium rounded ${tab === 'transaksi' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                Transaksi
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {tab === 'omzet' ? (
              <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}jt`} />
                <Tooltip formatter={(v: any) => `Rp${Number(v).toLocaleString('id-ID')}`} labelFormatter={(l) => `Tanggal ${l}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="omzet" name="Omzet" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="transaksi" name="Transaksi" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

