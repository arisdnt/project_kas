import {
  Package,
  Home,
  ShoppingCart,
  Warehouse,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Tags,
  Layers,
  Factory,
  ShoppingBag,
  ClipboardCheck,
  Shuffle,
  Settings,
  BadgePercent,
  Activity,
  FolderOpen,
  Receipt,
} from 'lucide-react';

export type MenuItem = {
  name: string;
  href: string;
  // Icon component from lucide-react
  icon: React.ComponentType<{ className?: string }>;
};

export const mainMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Kasir', href: '/dashboard/kasir', icon: ShoppingCart },
];

export const masterDataItems: MenuItem[] = [
  { name: 'Produk', href: '/dashboard/produk', icon: Package },
  { name: 'Kategori', href: '/dashboard/kategori', icon: Tags },
  { name: 'Brand', href: '/dashboard/brand', icon: Layers },
  { name: 'Supplier', href: '/dashboard/supplier', icon: Factory },
  { name: 'Pelanggan', href: '/dashboard/pelanggan', icon: Users },
];

export const stokInventarisItems: MenuItem[] = [
  { name: 'Inventaris', href: '/dashboard/inventaris', icon: Warehouse },
  { name: 'Stok Opname', href: '/dashboard/stok-opname', icon: ClipboardCheck },
  { name: 'Mutasi Stok', href: '/dashboard/mutasi-stok', icon: Shuffle },
];

export const transaksiItems: MenuItem[] = [
  { name: 'Penjualan', href: '/dashboard/penjualan', icon: TrendingUp },
  { name: 'Pembelian', href: '/dashboard/pembelian', icon: ShoppingBag },
  { name: 'Retur Penjualan', href: '/dashboard/retur-penjualan', icon: Receipt },
  { name: 'Retur Pembelian', href: '/dashboard/retur-pembelian', icon: ShoppingBag },
];

export const laporanItems: MenuItem[] = [
  { name: 'Laporan Penjualan', href: '/dashboard/laporan/penjualan', icon: BarChart3 },
  { name: 'Laporan Stok', href: '/dashboard/laporan/stok', icon: PieChart },
  { name: 'Laporan Harian', href: '/dashboard/laporan/harian', icon: Calendar },
];

export const pengaturanItems: MenuItem[] = [
  { name: 'Pengaturan Umum', href: '/dashboard/pengaturan', icon: Settings },
  { name: 'Toko/Tenant', href: '/dashboard/pengaturan/toko', icon: Factory },
  { name: 'Manajemen Tenan', href: '/dashboard/pengaturan/tenan', icon: Factory },
  { name: 'Pengguna', href: '/dashboard/pengaturan/pengguna', icon: Users },
  { name: 'Peran & Izin', href: '/dashboard/pengaturan/peran', icon: Users },
  { name: 'Printer & Perangkat', href: '/dashboard/pengaturan/printer', icon: Settings },
  { name: 'Pajak & Mata Uang', href: '/dashboard/pengaturan/pajak-dan-mata-uang', icon: Settings },
];

export const singleMenuItems: MenuItem[] = [
  { name: 'Promo', href: '/dashboard/promo', icon: BadgePercent },
  { name: 'Monitoring', href: '/dashboard/monitoring/status-sistem', icon: Activity },
  { name: 'Berkas', href: '/dashboard/berkas', icon: FolderOpen },
];

