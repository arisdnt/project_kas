import { Routes, Route } from 'react-router-dom';
import { PlaceholderPage } from '@/core/components/PlaceholderPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { KasirPageNew } from '@/features/kasir/pages/KasirPageNew';
import { ProdukPage } from '@/features/produk/pages/ProdukPage';
import { KategoriPage } from '@/features/kategori/pages/KategoriPage';
import { BrandPage } from '@/features/brand/pages/BrandPage';
import { SupplierPage } from '@/features/supplier/pages/SupplierPage';
import { InventarisPage } from '@/features/inventaris/pages/InventarisPage';
import { StokOpnamePageNew } from '@/features/stok-opname/pages/StokOpnamePageNew';
import { MutasiStokPage } from '@/features/mutasi-stok/pages/MutasiStokPage';
import { PenjualanPage } from '@/features/penjualan/pages/PenjualanPage';
import { ReturPenjualanPage } from '@/features/retur-penjualan/pages/ReturPenjualanPage';
import { ReturPembelianPage } from '@/features/retur-pembelian/pages/ReturPembelianPage';
import { PembelianPageNew } from '@/features/pembelian/pages/PembelianPageNew';
import { RestokPage } from '@/features/restok/pages/RestokPage';
import { PelangganPage } from '@/features/pelanggan/pages/PelangganPage';
import { PromoPage } from '@/features/promo/pages/PromoPage';
import { FileManagerPage } from '@/features/storage/pages/FileManagerPage';
import { LaporanPenjualanPage } from '@/features/laporan-penjualan/pages/LaporanPenjualanPage';
import { LaporanStokPage } from '@/features/laporan-stok/pages/LaporanStokPage';
import { KeuanganPage } from '@/features/laporan-keuangan/pages/KeuanganPage';
import { LaporanHarianPage } from '@/features/laporan-harian/pages/LaporanHarianPage';
import { PengaturanPage } from '@/features/pengaturan/pages/PengaturanPage';
import PeranPage from '@/features/peran/pages/PeranPage';
import { TokoPage } from '@/features/toko/pages/TokoPage';
import { TenanPage } from '@/features/tenan/pages/TenanPage';
import PenggunaPage from '@/features/pengguna/pages/PenggunaPage';
import { StatusSistemPage } from '@/features/monitoring/pages/StatusSistemPage';
import { ProfilSayaPage } from '@/features/profilsaya';
import { PengaturanSaya } from '@/features/pengaturansaya';
import { PajakMatauangPage } from '@/features/pengaturan/pajak-mata-uang/pages/PajakMatauangPage';
import { PerpesananPage } from '@/features/perpesanan/pages/PerpesananPage';
import { CatatanPage } from '@/features/catatan/pages/CatatanPage';
import { BeritaPage } from '@/features/berita/pages/BeritaPage';

export function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/kasir" element={<KasirPageNew />} />
      <Route path="/produk" element={<ProdukPage />} />
      <Route path="/kategori" element={<KategoriPage />} />
      <Route path="/brand" element={<BrandPage />} />
      <Route path="/supplier" element={<SupplierPage />} />
      <Route path="/inventaris" element={<InventarisPage />} />
      <Route path="/stok-opname" element={<StokOpnamePageNew />} />
      <Route path="/mutasi-stok" element={<MutasiStokPage />} />
      <Route path="/penjualan" element={<PenjualanPage />} />
      <Route path="/retur-penjualan" element={<ReturPenjualanPage />} />
      <Route path="/retur-pembelian" element={<ReturPembelianPage />} />
      <Route path="/pembelian" element={<PembelianPageNew />} />
      <Route path="/pembelian/restok" element={<RestokPage />} />
      <Route path="/pelanggan" element={<PelangganPage />} />
      <Route path="/promo" element={<PromoPage />} />
      <Route path="/berita" element={<BeritaPage />} />
      <Route path="/berkas" element={<FileManagerPage />} />
      <Route path="/perpesanan" element={<PerpesananPage />} />
      <Route path="/catatan" element={<CatatanPage />} />
      <Route path="/laporan/penjualan" element={<LaporanPenjualanPage />} />
      <Route path="/laporan/stok" element={<LaporanStokPage />} />
      <Route path="/laporan/keuangan" element={<KeuanganPage />} />
      <Route path="/laporan/harian" element={<LaporanHarianPage />} />
      <Route path="/pengaturan" element={<PengaturanPage />} />
      <Route path="/pengaturan/toko" element={<TokoPage />} />
      <Route path="/pengaturan/tenan" element={<TenanPage />} />
      <Route path="/pengaturan/pengguna" element={<PenggunaPage />} />
      <Route path="/pengaturan/peran" element={<PeranPage />} />
      <Route
        path="/pengaturan/printer"
        element={<PlaceholderPage title="Printer & Perangkat" description="Konfigurasi printer termal dan perangkat pendukung." />}
      />
      <Route
        path="/pengaturan/pajak-dan-mata-uang"
        element={<PajakMatauangPage />}
      />
      <Route path="/monitoring/status-sistem" element={<StatusSistemPage />} />
      <Route path="/profilsaya" element={<ProfilSayaPage />} />
      <Route path="/detailuser" element={<ProfilSayaPage />} />
      <Route path="/pengaturansaya" element={<PengaturanSaya />} />
    </Routes>
  );
}
