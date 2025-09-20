import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Badge } from '@/core/components/ui/badge';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { BeritaItem } from '@/features/berita/types/berita';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/core/components/ui/button';
import { ExternalLink, Link, Paperclip } from 'lucide-react';

interface Props {
  open: boolean;
  data?: BeritaItem | null;
  onClose: () => void;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }
  try {
    return format(new Date(value), 'dd MMM yyyy HH:mm', { locale: idLocale });
  } catch (error) {
    return '-';
  }
}

export function BeritaDetailDialog({ open, data, onClose }: Props) {
  if (!data) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">Detail Berita</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{data.judul}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge className="border-0 bg-slate-100 px-2 py-0.5 capitalize text-slate-700">{data.tipeBerita}</Badge>
                <Badge className="border-0 bg-slate-100 px-2 py-0.5 text-slate-600">
                  Interval {data.intervalTampilMenit} menit
                </Badge>
                <Badge className="border-0 bg-slate-100 px-2 py-0.5 text-slate-600 capitalize">{data.status}</Badge>
                <Badge className="border-0 bg-slate-100 px-2 py-0.5 text-slate-600 capitalize">Prioritas {data.prioritas}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Dibuat oleh <span className="font-semibold text-slate-700">{data.namaUser}</span>
                {data.namaToko ? ` • ${data.namaToko}` : ''}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Konten</h4>
              <p className="mt-2 whitespace-pre-line rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-700">
                {data.konten}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Penayangan</h4>
                <p className="mt-2">Mulai: <span className="font-medium text-slate-800">{formatDate(data.jadwalMulai)}</span></p>
                <p>Selesai: <span className="font-medium text-slate-800">{formatDate(data.jadwalSelesai)}</span></p>
                {data.maksimalTampil ? (
                  <p className="mt-1 text-xs text-slate-500">Batas tampil {data.maksimalTampil} kali per user</p>
                ) : null}
              </div>
              <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target</h4>
                <p className="font-medium capitalize text-slate-800">{data.targetTampil.replace(/_/g, ' ')}</p>
                {data.targetTokoIds && data.targetTokoIds.length > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">{data.targetTokoIds.length} toko disasar</p>
                ) : null}
                {data.targetTenantIds && data.targetTenantIds.length > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">{data.targetTenantIds.length} tenant disasar</p>
                ) : null}
              </div>
            </div>

            {(data.gambarUrl || data.lampiranUrl) ? (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lampiran</h4>
                {data.gambarUrl ? (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <img src={data.gambarUrl} alt="Preview" className="h-10 w-16 rounded object-cover" />
                      <div>
                        <p className="font-medium text-slate-700">Banner / gambar</p>
                        <p className="text-xs text-slate-400">{data.gambarUrl}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={data.gambarUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Buka
                      </a>
                    </Button>
                  </div>
                ) : null}
                {data.lampiranUrl ? (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-700">Lampiran tambahan</p>
                        <p className="text-xs text-slate-400">{data.lampiranUrl}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={data.lampiranUrl} target="_blank" rel="noreferrer">
                        <Link className="mr-2 h-4 w-4" /> Unduh
                      </a>
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
