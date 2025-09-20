import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackagePlus,
  Barcode,
  ShieldAlert,
  RefreshCw,
  Trash2,
  Sparkles,
  ClipboardList,
  ArrowRight,
  Lightbulb,
  Layers,
  Building2,
  Store,
  User,
  Printer,
  Save,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { useAuthStore } from '@/core/store/authStore';
import { useDataRefresh } from '@/core/hooks/useDataRefresh';
import { RestokSearchForm } from '@/features/restok/components/RestokSearchForm';
import { RestokTable } from '@/features/restok/components/RestokTable';
import { RestokSummary } from '@/features/restok/components/RestokSummary';
import { useRestokStore, useRestokTotals } from '@/features/restok/store/restokStore';
import { useProdukStore } from '@/features/produk/store/produkStore';

export function RestokPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userLevel = user?.level;
  const isAllowed = userLevel === 3 || userLevel === 4;

  const loadFirst = useProdukStore((s) => s.loadFirst);
  const produkLoading = useProdukStore((s) => s.loading);
  const produkCount = useProdukStore((s) => s.items.length);

  const items = useRestokStore((s) => s.items);
  const clear = useRestokStore((s) => s.clear);
  const { itemCount, subtotal } = useRestokTotals();
  const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal);
  const hasItems = itemCount > 0;

  useEffect(() => {
    if (!isAllowed) return;
    if (produkCount === 0 && !produkLoading) {
      loadFirst().catch(() => {});
    }
  }, [isAllowed, produkCount, produkLoading, loadFirst]);

  const handleRefresh = useCallback(async () => {
    await loadFirst();
  }, [loadFirst]);

  useDataRefresh(isAllowed ? handleRefresh : undefined);

  const handlePrintCart = useCallback(() => {
    if (items.length === 0) {
      alert('Keranjang kosong, tidak ada yang bisa dicetak.');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Keranjang Restok - ${user?.tenant?.nama || 'Tenant'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Keranjang Restok Pembelian</h2>
            <p><strong>Tenant:</strong> ${user?.tenant?.nama || 'Tidak diketahui'}</p>
            <p><strong>Toko:</strong> ${user?.toko?.nama || 'Tidak diketahui'}</p>
            <p><strong>User:</strong> ${user?.nama || user?.username || 'Tidak diketahui'}</p>
          </div>

          <div class="info">
            <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
            <p><strong>Waktu:</strong> ${new Date().toLocaleTimeString('id-ID')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Produk</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Harga Beli</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.nama}</td>
                  <td>${item.sku || '-'}</td>
                  <td>${item.qty}</td>
                  <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.hargaBeli)}</td>
                  <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.hargaBeli * item.qty)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Total Item: ${itemCount}</p>
            <p>Total Pembelian: ${formattedSubtotal}</p>
          </div>

          <div class="footer">
            <p>Dicetak pada ${new Date().toLocaleString('id-ID')}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }, [items, itemCount, formattedSubtotal, user]);

  const handleSaveTransaction = useCallback(async () => {
    if (items.length === 0) {
      alert('Keranjang kosong, tidak ada yang bisa disimpan.');
      return;
    }

    try {
      // TODO: Implement actual API call to save transaction
      // This is a placeholder for the actual implementation
      console.log('Saving transaction...', {
        items,
        total: subtotal,
        timestamp: new Date().toISOString(),
        user: user?.id,
        tenant: user?.tenant?.id,
        toko: user?.toko?.id,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Transaksi berhasil disimpan!');
      clear(); // Clear cart after successful save
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Gagal menyimpan transaksi. Silakan coba lagi.');
    }
  }, [items, subtotal, user, clear]);


  if (!isAllowed) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-3rem)] items-center justify-center bg-white">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="space-y-4">
            <Badge className="w-fit bg-blue-100 text-blue-700 border-blue-200">Akses Dibatasi</Badge>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <ShieldAlert className="h-7 w-7 text-blue-600" />
              Restok Barang Tidak Tersedia
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Menu restok hanya bisa digunakan oleh Admin Toko (Level 3) dan Kasir (Level 4). Silakan hubungi administrator untuk memperbarui hak akses Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Peran yang diperbolehkan:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border border-blue-200">Level 3 · Admin Toko</Badge>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border border-emerald-200">Level 4 · Kasir</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                Kembali ke Dashboard
              </Button>
              <Button onClick={() => navigate('/dashboard/profilsaya')} className="flex-1">
                Lihat Profil Saya
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">

      <div className="space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="gap-3 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Barcode className="h-5 w-5 text-blue-600" />
                  Input & Pemindaian Produk
                </CardTitle>
                <span className="text-slate-400">|||</span>
                <CardDescription className="text-sm text-slate-600">
                  Ketik nama, SKU, atau gunakan pemindai barcode. Tekan Enter untuk menambahkan ke daftar restok.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <RestokSearchForm />
                  <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Tenant
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">{user?.tenant?.nama || 'Tidak diketahui'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <Store className="h-3 w-3" />
                        Toko
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">{user?.toko?.nama || 'Tidak diketahui'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        User
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">{user?.nama || user?.username || 'Tidak diketahui'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Ringkasan Restok</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-700">Total Item:</span>
                      <span className="text-lg font-semibold text-blue-900">{itemCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-700">Total Pembelian:</span>
                      <span className="text-lg font-semibold text-blue-900">{formattedSubtotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col gap-3 pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Daftar Restok Aktif</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  {hasItems ? `Total ${itemCount} item · ${formattedSubtotal}` : 'Belum ada produk. Mulai dengan pencarian di atas.'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="gap-2 text-red-700 border-red-200 hover:bg-red-50"
                  disabled={!hasItems}
                >
                  <Trash2 className="h-4 w-4" />
                  Bersihkan keranjang
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintCart}
                  className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                  disabled={!hasItems}
                >
                  <Printer className="h-4 w-4" />
                  Print keranjang
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveTransaction}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled={!hasItems}
                >
                  <Save className="h-4 w-4" />
                  Simpan transaksi
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <RestokTable items={items} />
            </CardContent>
          </Card>

      </div>
    </div>
  );
}
