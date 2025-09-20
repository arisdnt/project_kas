import { Fragment, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import {
  Activity,
  Database,
  Wifi,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  ArrowUpRight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SystemStatus, MonitoringData } from '../types/monitoring'

type MonitoringKey = keyof MonitoringData
const SECTIONS: Array<{
  id: string
  label: string
  description: string
  systems: MonitoringKey[]
}> = [
  {
    id: 'application',
    label: 'Layanan Aplikasi',
    description: 'Komponen yang berinteraksi langsung dengan pengguna dan klien front-end.',
    systems: ['api', 'websocket']
  },
  {
    id: 'infrastructure',
    label: 'Infrastruktur',
    description: 'Layanan pendukung, penyimpanan data, dan sumber daya server aplikasi.',
    systems: ['database', 'server']
  }
]

const SYSTEM_ICONS: Record<MonitoringKey, LucideIcon> = {
  api: Activity,
  database: Database,
  websocket: Wifi,
  server: Server
}

const STATUS_ORDER: Array<SystemStatus['status']> = ['online', 'warning', 'error', 'offline']

const STATUS_CONFIG: Record<SystemStatus['status'], { label: string; badge: string; icon: LucideIcon; iconClass: string }> = {
  online: {
    label: 'Online',
    badge: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
    iconClass: 'text-emerald-500'
  },
  warning: {
    label: 'Warning',
    badge: 'border border-amber-200 bg-amber-50 text-amber-700',
    icon: AlertTriangle,
    iconClass: 'text-amber-500'
  },
  error: {
    label: 'Error',
    badge: 'border border-rose-200 bg-rose-50 text-rose-700',
    icon: XCircle,
    iconClass: 'text-rose-500'
  },
  offline: {
    label: 'Offline',
    badge: 'border border-slate-200 bg-slate-50 text-slate-600',
    icon: MinusCircle,
    iconClass: 'text-slate-500'
  }
}

const MINUTE_IN_MS = 60_000

const formatTimestamp = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(date)

const varyMetric = (value: number | undefined, delta: number, min: number, max: number, fractionDigits = 1) => {
  if (value === undefined) return value
  const next = value + (Math.random() * delta * 2 - delta)
  const clamped = Math.min(max, Math.max(min, next))
  return Number(clamped.toFixed(fractionDigits))
}

const evaluateStatus = (status: SystemStatus): SystemStatus['status'] => {
  if (status.status === 'offline') return 'offline'

  const { metrik } = status

  if (metrik?.uptime !== undefined && metrik.uptime < 95) {
    return 'error'
  }

  if (
    (metrik?.responseTime !== undefined && metrik.responseTime > 400) ||
    (metrik?.cpuUsage !== undefined && metrik.cpuUsage > 85) ||
    (metrik?.memoryUsage !== undefined && metrik.memoryUsage > 780)
  ) {
    return 'warning'
  }

  return 'online'
}

const computeNextSnapshot = (status: SystemStatus): SystemStatus => {
  const metrik = status.metrik
    ? {
        responseTime: varyMetric(status.metrik.responseTime, 12, 30, 780, 0),
        uptime: varyMetric(status.metrik.uptime, 0.08, 93, 100, 2),
        memoryUsage: varyMetric(status.metrik.memoryUsage, 14, 128, 896, 0),
        cpuUsage: varyMetric(status.metrik.cpuUsage, 6, 5, 96, 0)
      }
    : undefined

  const updated: SystemStatus = {
    ...status,
    status: evaluateStatus({ ...status, metrik } as SystemStatus),
    metrik,
    timestamp: new Date()
  }

  return updated
}

const buildSnapshot = (data: MonitoringData): MonitoringData => ({
  api: computeNextSnapshot(data.api),
  database: computeNextSnapshot(data.database),
  websocket: computeNextSnapshot(data.websocket),
  server: computeNextSnapshot(data.server)
})

export function StatusSistemPage() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    api: {
      id: 'api-1',
      nama: 'API Server',
      status: 'online',
      deskripsi: 'REST API endpoints untuk aplikasi mobile dan web.',
      timestamp: new Date(),
      metrik: {
        responseTime: 45,
        uptime: 99.9
      }
    },
    database: {
      id: 'db-1',
      nama: 'Database MySQL',
      status: 'online',
      deskripsi: 'Cluster utama penyimpanan transaksi dan master data.',
      timestamp: new Date(),
      metrik: {
        uptime: 99.95
      }
    },
    websocket: {
      id: 'ws-1',
      nama: 'WebSocket Broker',
      status: 'online',
      deskripsi: 'Sinkronisasi data real-time antar perangkat kasir.',
      timestamp: new Date(),
      metrik: {
        uptime: 99.8
      }
    },
    server: {
      id: 'server-1',
      nama: 'Application Server',
      status: 'online',
      deskripsi: 'Node.js worker untuk proses backend dan antrian.',
      timestamp: new Date(),
      metrik: {
        memoryUsage: 256,
        cpuUsage: 15,
        uptime: 99.7
      }
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoringData(prev => buildSnapshot(prev))
    }, MINUTE_IN_MS / 5)

    return () => clearInterval(interval)
  }, [])

  const refreshStatus = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      setMonitoringData(prev => buildSnapshot(prev))
    } catch (error) {
      console.error('Failed to refresh status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusSummary = useMemo(() => {
    return Object.values(monitoringData).reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1
        return acc
      },
      { online: 0, warning: 0, error: 0, offline: 0 } as Record<SystemStatus['status'], number>
    )
  }, [monitoringData])

  const renderMetrics = (status: SystemStatus) => {
    const metrics: Array<{ label: string; value: string }> = []

    if (status.metrik?.responseTime !== undefined) {
      metrics.push({ label: 'Response', value: `${status.metrik.responseTime} ms` })
    }

    if (status.metrik?.uptime !== undefined) {
      metrics.push({ label: 'Uptime', value: `${status.metrik.uptime}%` })
    }

    if (status.metrik?.cpuUsage !== undefined) {
      metrics.push({ label: 'CPU', value: `${status.metrik.cpuUsage}%` })
    }

    if (status.metrik?.memoryUsage !== undefined) {
      metrics.push({ label: 'Memory', value: `${status.metrik.memoryUsage} MB` })
    }

    if (!metrics.length) {
      return <span className="text-xs text-muted-foreground">Tidak ada metrik</span>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {metrics.map(metric => (
          <span
            key={`${status.id}-${metric.label}`}
            className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            <span className="text-foreground">{metric.label}</span>{' '}
            {metric.value}
          </span>
        ))}
      </div>
    )
  }

  const renderTable = () => {
    return (
      <Card className="border-border">
        <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Snapshot Status Sistem</CardTitle>
            <CardDescription>
              Data diperbarui otomatis setiap 12 detik dan dapat disinkronkan manual.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            {STATUS_ORDER.map(statusKey => {
              const summaryCount = statusSummary[statusKey]
              const iconClass = STATUS_CONFIG[statusKey].iconClass
              const StatusIcon = STATUS_CONFIG[statusKey].icon

              return (
                <div
                  key={statusKey}
                  className="flex items-center gap-2 rounded-full border border-dashed border-border/80 bg-muted/30 px-3 py-1"
                >
                  <StatusIcon className={`h-3.5 w-3.5 ${iconClass}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {STATUS_CONFIG[statusKey].label}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{summaryCount}</span>
                </div>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <ScrollArea className="w-full">
            <div className="px-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[220px]">Komponen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metrik Utama</TableHead>
                    <TableHead>Terakhir Diperbarui</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SECTIONS.map(section => {
                    const items = section.systems
                      .map(systemKey => ({ key: systemKey, data: monitoringData[systemKey] }))

                    if (!items.length) {
                      return null
                    }

                    return (
                      <Fragment key={section.id}>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableCell colSpan={6} className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {section.label}
                            <span className="ml-2 text-[11px] font-normal normal-case text-muted-foreground/80">
                              {section.description}
                            </span>
                          </TableCell>
                        </TableRow>
                        {items.map(({ key, data }) => {
                          const Icon = SYSTEM_ICONS[key]
                          const StatusIcon = STATUS_CONFIG[data.status].icon
                          const statusBadgeClass = STATUS_CONFIG[data.status].badge
                          const statusIconClass = STATUS_CONFIG[data.status].iconClass

                          return (
                            <TableRow key={data.id} className="bg-background">
                              <TableCell>
                                <div className="flex items-start gap-3">
                                  <div className="rounded-md bg-muted p-2">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{data.nama}</p>
                                    <p className="text-xs text-muted-foreground">{data.deskripsi}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`h-4 w-4 ${statusIconClass}`} />
                                  <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass}`}>
                                    {STATUS_CONFIG[data.status].label}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>{renderMetrics(data)}</TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-foreground">{formatTimestamp(data.timestamp)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {Math.round((Date.now() - data.timestamp.getTime()) / 1000)} detik lalu
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs text-muted-foreground">
                                  {data.status === 'online' && 'Semua proses berjalan normal.'}
                                  {data.status === 'warning' && 'Perlu perhatian: nilai metrik di luar ambang aman.'}
                                  {data.status === 'error' && 'Gangguan terdeteksi, cek log dan layanan terkait.'}
                                  {data.status === 'offline' && 'Layanan tidak merespons, lakukan failover.'}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" className="border-border">
                                    Detail
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-primary">
                                    Diagnosa
                                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Status Sistem</h1>
          <p className="text-sm text-muted-foreground">
            Monitor status layanan API, database, server aplikasi, dan saluran real-time dalam satu tampilan tabel modern.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1">
            <span className="text-xs text-muted-foreground">Pembaruan otomatis</span>
            <span className="text-xs font-semibold text-foreground">12 detik</span>
          </div>
          <Button onClick={refreshStatus} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sinkronkan
          </Button>
        </div>
      </div>

      {renderTable()}
    </div>
  )
}
