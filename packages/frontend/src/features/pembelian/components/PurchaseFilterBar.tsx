import { useMemo } from 'react';
import { PurchaseFilters, PurchasePaymentStatus, PurchaseStatus } from '../types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/core/components/ui/select';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { Calendar, Download, RefreshCw, Search } from 'lucide-react';

export type SupplierOption = {
  id: string;
  name: string;
};

type Props = {
  filters: PurchaseFilters;
  suppliers: SupplierOption[];
  onChange: (patch: Partial<PurchaseFilters>) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
};

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  draft: 'Draft',
  pending: 'Menunggu',
  received: 'Diterima',
  cancelled: 'Dibatalkan',
};

const PAYMENT_LABELS: Record<PurchasePaymentStatus, string> = {
  belum_bayar: 'Belum Bayar',
  sebagian_bayar: 'Sebagian',
  lunas: 'Lunas',
};

export function PurchaseFilterBar({ filters, suppliers, onChange, onExport, onRefresh, loading }: Props) {
  const showCustom = filters.range === 'custom';
  const dateLabel = useMemo(() => {
    if (filters.range === 'custom' && filters.from && filters.to) return `${filters.from} s/d ${filters.to}`;
    if (filters.range === 'today') return 'Hari ini';
    if (filters.range === '7d') return '7 Hari';
    if (filters.range === '30d') return '30 Hari';
    return 'Pilih rentang';
  }, [filters]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Rentang Waktu</label>
          <div className="flex items-center gap-2">
            <Select value={filters.range} onValueChange={(v) => onChange({ range: v as PurchaseFilters['range'] })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pilih rentang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari ini</SelectItem>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="30d">30 Hari</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {dateLabel}
            </div>
          </div>
          {showCustom && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.from || ''}
                onChange={(e) => onChange({ from: e.target.value })}
              />
              <span className="text-xs text-gray-500">s/d</span>
              <Input
                type="date"
                value={filters.to || ''}
                onChange={(e) => onChange({ to: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Supplier</label>
          <Select
            value={filters.supplierId || 'ALL'}
            onValueChange={(v) => onChange({ supplierId: v === 'ALL' ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Status Pembelian</label>
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(v) => onChange({ status: v === 'ALL' ? undefined : (v as PurchaseStatus) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Status Pembayaran</label>
          <Select
            value={filters.paymentStatus || 'ALL'}
            onValueChange={(v) => onChange({ paymentStatus: v === 'ALL' ? undefined : (v as PurchasePaymentStatus) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <label className="text-xs font-medium text-gray-700">Pencarian</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Nomor transaksi / Supplier / Catatan"
              value={filters.query || ''}
              onChange={(e) => onChange({ query: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
