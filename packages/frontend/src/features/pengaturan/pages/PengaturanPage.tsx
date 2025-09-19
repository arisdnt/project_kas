import { useMemo, useState, type ComponentType } from 'react'
import { Copy, Edit2, Eye, Filter, Search, Settings } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/core/components/ui/card'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { useToast } from '@/core/hooks/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { cn } from '@/core/lib/utils'
import { getSettingsData, type SettingData } from '../data/settingsData'

type SettingAction = NonNullable<SettingData['action']>

const CATEGORY_LABELS: Record<string, { label: string; badgeClass: string }> = {
  toko: { label: 'Info Toko', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  keuangan: { label: 'Keuangan', badgeClass: 'bg-amber-50 text-amber-700 border border-amber-100' },
  pajak: { label: 'Pajak', badgeClass: 'bg-rose-50 text-rose-700 border border-rose-100' },
  waktu: { label: 'Zona Waktu', badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  printer: { label: 'Perangkat', badgeClass: 'bg-violet-50 text-violet-700 border border-violet-100' },
  api: { label: 'Integrasi API', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100' },
  jwt: { label: 'Keamanan', badgeClass: 'bg-orange-50 text-orange-700 border border-orange-100' },
  fileTypes: { label: 'Tipe Berkas', badgeClass: 'bg-cyan-50 text-cyan-700 border border-cyan-100' }
}

const ACTION_MAPPINGS: Record<SettingAction, { label: string; icon: ComponentType<{ className?: string }> }> = {
  copy: { label: 'Salin nilai', icon: Copy },
  edit: { label: 'Kelola pengaturan', icon: Edit2 },
  view: { label: 'Lihat detail', icon: Eye }
}

function formatValue(value: SettingData['value']): string {
  if (typeof value === 'boolean') {
    return value ? 'Aktif' : 'Tidak Aktif'
  }
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID')
  }
  return String(value)
}

function resolveCategoryBadge(category: string) {
  const fallback = { label: category, badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200' }
  return CATEGORY_LABELS[category] || fallback
}

function matchSearch(setting: SettingData, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return [
    setting.title,
    setting.description,
    formatValue(setting.value),
    resolveCategoryBadge(setting.category).label
  ]
    .filter(Boolean)
    .some((part) => part.toLowerCase().includes(normalized))
}

export function PengaturanPage() {
  const { toast } = useToast()
  const allSettings = useMemo(() => getSettingsData(), [])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | string>('all')

  const categories = useMemo(() => {
    const unique = new Set(allSettings.map((item) => item.category))
    return Array.from(unique)
  }, [allSettings])

  const filteredSettings = useMemo(() => {
    return allSettings.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category
      const matchesSearch = matchSearch(item, search)
      return matchesCategory && matchesSearch
    })
  }, [allSettings, category, search])

  const handleAction = (setting: SettingData) => {
    const action = setting.action

    if (!action) {
      toast({ title: setting.title, description: 'Tidak ada tindakan yang tersedia untuk pengaturan ini.' })
      return
    }

    switch (action) {
      case 'copy': {
        const value = formatValue(setting.value)
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          navigator.clipboard
            .writeText(value)
            .then(() => {
              toast({ title: 'Tersalin ke clipboard', description: `${setting.title} berhasil disalin.` })
            })
            .catch(() => {
              toast({ title: 'Gagal menyalin', description: 'Silakan salin manual dari tabel.', variant: 'destructive' })
            })
        } else {
          toast({ title: 'Gagal menyalin', description: 'Silakan salin manual dari tabel.', variant: 'destructive' })
        }
        break
      }
      case 'edit': {
        toast({
          title: 'Siap dikelola',
          description: 'Perlu integrasi ke form khusus. Hubungi admin untuk perubahan saat ini.'
        })
        break
      }
      case 'view': {
        toast({ title: setting.title, description: 'Detail pengaturan dapat dilihat di modul terkait.' })
        break
      }
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-medium text-blue-700">
              <Settings className="h-4 w-4" />
              Panel Pengaturan
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Pengaturan Sistem</h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Kelola preferensi inti sistem dalam tampilan tabel ringkas. Gunakan pencarian atau filter kategori untuk menemukan konfigurasi dengan cepat.
            </p>
          </div>
          <Badge variant="secondary" className="self-start rounded-full border border-slate-200 bg-white text-slate-700">
            {filteredSettings.length} dari {allSettings.length} pengaturan tampil
          </Badge>
        </header>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-white/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">Daftar Pengaturan</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Tinjau nilai konfigurasi terbaru dan ambil tindakan yang diperlukan.
                </CardDescription>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama atau deskripsi..."
                    className="pl-10"
                  />
                </div>
                <Select value={category} onValueChange={(value) => setCategory(value)}>
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Semua kategori
                      </div>
                    </SelectItem>
                    {categories.map((value) => {
                      const badge = resolveCategoryBadge(value)
                      return (
                        <SelectItem key={value} value={value}>
                          {badge.label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-slate-200">
                  <TableHead className="w-[32%] text-slate-600">Pengaturan</TableHead>
                  <TableHead className="w-[18%] text-slate-600">Kategori</TableHead>
                  <TableHead className="text-slate-600">Nilai Saat Ini</TableHead>
                  <TableHead className="w-[140px] text-right text-slate-600">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                      Tidak ditemukan pengaturan yang cocok dengan pencarian atau filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSettings.map((setting) => {
                    const categoryBadge = resolveCategoryBadge(setting.category)
                    const actionMeta = setting.action ? ACTION_MAPPINGS[setting.action] : undefined

                    return (
                      <TableRow key={`${setting.category}-${setting.title}`} className="border-slate-200">
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                              {setting.icon}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-900 tracking-tight">
                                {setting.title}
                              </p>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {setting.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('rounded-full px-3 py-1 text-xs font-medium', categoryBadge.badgeClass)}>
                            {categoryBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xl overflow-hidden text-ellipsis whitespace-normal text-sm font-mono text-slate-800">
                            {formatValue(setting.value)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {actionMeta ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-200 text-slate-700 hover:bg-slate-100"
                              onClick={() => handleAction(setting)}
                              disabled
                            >
                              <actionMeta.icon className="mr-2 h-4 w-4" />
                              {actionMeta.label}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-500">Tidak ada aksi</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PengaturanPage
