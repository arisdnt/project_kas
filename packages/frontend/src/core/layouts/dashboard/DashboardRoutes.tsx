import { Routes, Route } from 'react-router-dom';
import { PlaceholderPage } from '@/core/components/PlaceholderPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { KasirPage } from '@/features/kasir/pages/KasirPage';
import { ProdukPage } from '@/features/produk/pages/ProdukPage';
import { KategoriPage } from '@/features/kategori/pages/KategoriPage';
import { BrandPage } from '@/features/brand/pages/BrandPage';
import { SupplierPage } from '@/features/supplier/pages/SupplierPage';
import { InventarisPage } from '@/features/inventaris/pages/InventarisPage';
import { StokOpnamePage } from '@/features/stok-opname/pages/StokOpnamePage';
import { MutasiStokPage } from '@/features/mutasi-stok/pages/MutasiStokPage';
import { PenjualanPage } from '@/features/penjualan/pages/PenjualanPage';
import { ReturPenjualanPage } from '@/features/retur-penjualan/pages/ReturPenjualanPage';
import { ReturPembelianPage } from '@/features/retur-pembelian/pages/ReturPembelianPage';
import { PembelianPage } from '@/features/pembelian/pages/PembelianPage';
import { PelangganPage } from '@/features/pelanggan/pages/PelangganPage';
import { PromoPage } from '@/features/promo/pages/PromoPage';
import { FileManagerPage } from '@/features/storage/pages/FileManagerPage';
import { LaporanPenjualanPage } from '@/features/laporan/penjualan/pages/LaporanPenjualanPage';
import { LaporanStokPage } from '@/features/laporan/stok/pages/LaporanStokPage';
import { PengaturanPage } from '@/features/pengaturan/pages/PengaturanPage';
import { PengaturanTokoPage } from '@/features/pengaturan/toko/PengaturanTokoPage';
import { TenanPage } from '@/features/tenan/pages/TenanPage';
import { PengaturanPenggunaPage } from '@/features/pengaturan/pengguna/PengaturanPenggunaPage';
import { StatusSistemPage } from '@/features/monitoring/pages/StatusSistemPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

export function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/kasir" element={<KasirPage />} />
      <Route path="/produk" element={<ProdukPage />} />
      <Route path="/kategori" element={<KategoriPage />} />
      <Route path="/brand" element={<BrandPage />} />
      <Route path="/supplier" element={<SupplierPage />} />
      <Route path="/inventaris" element={<InventarisPage />} />
      <Route path="/stok-opname" element={<StokOpnamePage />} />
      <Route path="/mutasi-stok" element={<MutasiStokPage />} />
      <Route path="/penjualan" element={<PenjualanPage />} />
      <Route path="/retur-penjualan" element={<ReturPenjualanPage />} />
      <Route path="/retur-pembelian" element={<ReturPembelianPage />} />
      <Route path="/pembelian" element={<PembelianPage />} />
      <Route path="/pelanggan" element={<PelangganPage />} />
      <Route path="/promo" element={<PromoPage />} />
      <Route path="/berkas" element={<FileManagerPage />} />
      <Route path="/laporan/penjualan" element={<LaporanPenjualanPage />} />
      <Route path="/laporan/stok" element={<LaporanStokPage />} />
      <Route
        path="/laporan/harian"
        element={<PlaceholderPage title="Laporan Harian" description="Ringkasan aktivitas harian, transaksi, dan performa toko." />}
      />
      <Route path="/pengaturan" element={<PengaturanPage />} />
      <Route path="/pengaturan/toko" element={<PengaturanTokoPage />} />
      <Route path="/pengaturan/tenan" element={<TenanPage />} />
      <Route path="/pengaturan/pengguna" element={<PengaturanPenggunaPage />} />
      <Route
        path="/pengaturan/peran"
        element={<PlaceholderPage title="Peran & Izin" description="RBAC: role dan permissions untuk kontrol akses." />}
      />
      <Route
        path="/pengaturan/printer"
        element={<PlaceholderPage title="Printer & Perangkat" description="Konfigurasi printer termal dan perangkat pendukung." />}
      />
      <Route
        path="/pengaturan/pajak-dan-mata-uang"
        element={<PlaceholderPage title="Pajak & Mata Uang" description="Pengaturan tarif pajak, mata uang, dan format." />}
      />
      <Route path="/monitoring/status-sistem" element={<StatusSistemPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

