import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/core/components/ui/card';
import { PurchaseFilterBar, SupplierOption } from '@/features/pembelian/components/PurchaseFilterBar';
import { PurchaseTable } from '@/features/pembelian/components/PurchaseTable';
import { exportPurchaseCSV } from '@/features/pembelian/utils/exporters';
import { PurchaseFilters, PurchaseTransaction } from '@/features/pembelian/types';
import { PembelianService } from '@/features/pembelian/services/pembelianService';
import { useSupplierStore } from '@/features/supplier/store/supplierStore';

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function PembelianPage() {
  const [filters, setFilters] = useState<PurchaseFilters>({ range: '7d' });
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const getActiveSuppliers = useSupplierStore((state) => state.getActiveSuppliers);

  const normalizedFilters = useMemo(() => {
    const today = new Date();
    if (filters.range !== 'custom') {
      let from: string | undefined;
      if (filters.range === 'today') {
        from = formatDateKey(today);
      }
      if (filters.range === '7d') {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        from = formatDateKey(start);
      }
      if (filters.range === '30d') {
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        from = formatDateKey(start);
      }
      return {
        ...filters,
        from,
        to: formatDateKey(today),
      };
    }
    return filters;
  }, [filters]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const activeSuppliers = await getActiveSuppliers();
      setSuppliers(activeSuppliers.map((supplier) => ({ id: supplier.id, name: supplier.nama })));
    } catch (err) {
      console.error('Failed to load supplier list', err);
    }
  }, [getActiveSuppliers]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PembelianService.searchTransaksi({
        page: 1,
        limit: 100,
        search: normalizedFilters.query,
        supplier_id: normalizedFilters.supplierId,
        status: normalizedFilters.status,
        status_pembayaran: normalizedFilters.paymentStatus,
        tanggal_dari: normalizedFilters.from,
        tanggal_sampai: normalizedFilters.to,
      });

      setTransactions(response.data);
      setTotalTransactions(response.pagination?.total ?? response.data.length);
    } catch (err) {
      console.error('Failed to load purchase transactions', err);
      setError('Gagal memuat data transaksi pembelian dari server.');
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setLoading(false);
    }
  }, [normalizedFilters.from, normalizedFilters.paymentStatus, normalizedFilters.query, normalizedFilters.status, normalizedFilters.supplierId, normalizedFilters.to]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExport = useCallback(() => {
    if (transactions.length === 0) return;
    exportPurchaseCSV(transactions);
  }, [transactions]);

  const handleRefresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transaksi Pembelian</h2>
          <p className="text-sm text-gray-600">Daftar transaksi pembelian berdasarkan filter yang dipilih</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <PurchaseFilterBar
            filters={normalizedFilters}
            suppliers={suppliers}
            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            onExport={transactions.length > 0 ? handleExport : undefined}
            onRefresh={handleRefresh}
            loading={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {loading
                ? 'Memuat transaksi pembelian...'
                : `Menampilkan ${transactions.length} dari ${totalTransactions} transaksi`}
            </span>
          </div>

          <PurchaseTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
