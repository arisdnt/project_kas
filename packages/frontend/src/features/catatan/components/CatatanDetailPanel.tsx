import { CatatanRecord } from '@/features/catatan/types/catatan';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import { Building2, Clock, FileText, Globe2, Tag, User, Users, Archive } from 'lucide-react';
import { cn } from '@/core/lib/utils';

type Props = {
  record?: CatatanRecord;
  loading?: boolean;
  onEdit: (record: CatatanRecord) => void;
  onDelete: (record: CatatanRecord) => void;
};

const statusTone: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  arsip: 'bg-amber-100 text-amber-700',
  dihapus: 'bg-red-100 text-red-700'
};

const priorityTone: Record<string, string> = {
  tinggi: 'bg-rose-100 text-rose-700',
  normal: 'bg-sky-100 text-sky-700',
  rendah: 'bg-slate-100 text-slate-600'
};

const visibilityInfo: Record<string, { icon: React.ReactNode; label: string; tone: string; description: string }> = {
  pribadi: { icon: <User className="h-4 w-4" />, label: 'Pribadi', tone: 'bg-gray-100 text-gray-600', description: 'Hanya pembuat yang dapat melihat' },
  toko: { icon: <Building2 className="h-4 w-4" />, label: 'Toko', tone: 'bg-amber-100 text-amber-700', description: 'Terlihat oleh semua pengguna toko' },
  tenant: { icon: <Users className="h-4 w-4" />, label: 'Tenant', tone: 'bg-blue-100 text-blue-700', description: 'Terlihat oleh seluruh pengguna tenant' },
  publik: { icon: <Globe2 className="h-4 w-4" />, label: 'Publik', tone: 'bg-emerald-100 text-emerald-700', description: 'Terlihat lintas tenant' }
};

export function CatatanDetailPanel({ record, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <Card className="h-full animate-pulse border-gray-100 shadow-sm">
        <CardHeader>
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          <div className="mt-4 h-3 w-1/2 rounded bg-gray-100" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
          <div className="h-24 w-full rounded bg-gray-100" />
        </CardContent>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card className="flex h-full flex-col items-center justify-center border-dashed border-gray-200 bg-gradient-to-br from-white to-gray-50 text-center shadow-none">
        <CardContent className="space-y-3 py-12 text-sm text-gray-500">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="text-base font-semibold text-gray-700">Pilih catatan untuk melihat detail</p>
          <p>Catatan yang dipilih akan tampil di sini dengan informasi lengkap.</p>
        </CardContent>
      </Card>
    );
  }

  const visibility = visibilityInfo[record.visibilitas];
  const reminder = record.reminder_pada ? new Date(record.reminder_pada).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null;

  return (
    <Card className="flex h-full flex-col border-gray-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">{record.judul}</CardTitle>
            <p className="mt-1 text-xs text-gray-500">
              Dibuat oleh <span className="font-medium text-gray-700">{record.pembuat.nama || record.pembuat.username}</span>
              {' • '}
              {new Date(record.dibuat_pada).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="text-xs text-gray-400">
              Terakhir diperbarui {new Date(record.diperbarui_pada).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(record)}>
              Hapus
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge className={cn('flex items-center gap-1 capitalize', priorityTone[record.prioritas])}>
            Prioritas {record.prioritas}
          </Badge>
          <Badge className={cn('flex items-center gap-1 capitalize', statusTone[record.status])}>
            {record.status === 'arsip' ? <Archive className="h-3.5 w-3.5" /> : null}
            Status {record.status}
          </Badge>
          {visibility && (
            <Badge className={cn('flex items-center gap-1', visibility.tone)}>
              {visibility.icon}
              {visibility.label}
            </Badge>
          )}
          {record.toko && (
            <Badge variant="outline" className="border-indigo-200 text-indigo-700">
              Toko {record.toko.nama}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 py-6">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Isi Catatan</h3>
          <p className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            {record.konten}
          </p>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Informasi Pembuat</h4>
            <div className="rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800">{record.pembuat.nama || record.pembuat.username}</p>
              <p className="text-xs text-gray-400">ID: {record.pembuat.id}</p>
              {record.toko && (
                <p className="mt-1 flex items-center gap-2 text-xs text-blue-600">
                  <Building2 className="h-3.5 w-3.5" />
                  {record.toko.nama} • {record.toko.kode}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Visibilitas & Pengingat</h4>
            <div className="rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-600">
              {visibility && (
                <div className="flex items-start gap-2">
                  <Badge className={cn('flex items-center gap-1', visibility.tone)}>
                    {visibility.icon}
                    {visibility.label}
                  </Badge>
                  <p className="text-xs text-gray-500">{visibility.description}</p>
                </div>
              )}
              {reminder ? (
                <p className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                  <Clock className="h-3.5 w-3.5" />Pengingat {reminder}
                </p>
              ) : (
                <p className="mt-3 text-xs text-gray-400">Tidak ada pengingat terjadwal</p>
              )}
            </div>
          </div>
        </section>

        {record.tags && record.tags.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {record.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-600">
                  <Tag className="h-3 w-3 text-gray-400" />
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
