import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ProdukPage } from '../../features/produk/pages/ProdukPage';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { PelangganPage } from '@/features/pelanggan/pages/PelangganPage'
import { KasirPage } from '@/features/kasir/pages/KasirPage'
import { PromoPage } from '@/features/promo/pages/PromoPage'
import { PengaturanPage } from '@/features/pengaturan/pages/PengaturanPage'
import { PengaturanPenggunaPage } from '@/features/pengaturan/pengguna/PengaturanPenggunaPage'
import { PengaturanTokoPage } from '@/features/pengaturan/toko/PengaturanTokoPage'
import { useCalculator } from '../hooks/use-calculator'
import { CalculatorModal } from '../components/ui/calculator-modal'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  Package, 
  Home, 
  ShoppingCart, 
  Warehouse, 
  TrendingUp, 
  Users, 
  FileText, 
  LogOut,
  Menu,
  X,
  ChevronDown,
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
  Receipt,
  Calculator,
  FolderOpen,
  Maximize
} from 'lucide-react';
import { StatusBar } from '@/core/components/StatusBar';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { FileManagerPage } from '@/features/storage/pages/FileManagerPage'
import { LaporanPenjualanPage } from '@/features/laporan/penjualan/pages/LaporanPenjualanPage'
import { LaporanStokPage } from '@/features/laporan/stok/pages/LaporanStokPage'
import { PembelianPage } from '@/features/pembelian/pages/PembelianPage'
import { PenjualanPage } from '@/features/penjualan/pages/PenjualanPage'
import { ReturPenjualanPage } from '@/features/retur-penjualan/pages/ReturPenjualanPage'
import { ReturPembelianPage } from '@/features/retur-pembelian/pages/ReturPembelianPage'
import { InventarisPage } from '@/features/inventaris/pages/InventarisPage'
import { StokOpnamePage } from '@/features/stok-opname/pages/StokOpnamePage'
import { MutasiStokPage } from '@/features/mutasi-stok/pages/MutasiStokPage'
import { StatusSistemPage } from '@/features/monitoring/pages/StatusSistemPage'
import { KategoriPage } from '@/features/kategori/pages/KategoriPage'
import { BrandPage } from '@/features/brand/pages/BrandPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SupplierPage } from '@/features/supplier/pages/SupplierPage'

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isCalculatorOpen, openCalculator, closeCalculator, handleCalculatorResult } = useCalculator();

  const handleLogout = () => {
    logout();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Menu utama yang tidak memiliki dropdown
  const mainMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Kasir', href: '/dashboard/kasir', icon: ShoppingCart },
  ];

  // Kelompok menu berdasarkan blueprint
  const masterDataItems = [
    { name: 'Produk', href: '/dashboard/produk', icon: Package },
    { name: 'Kategori', href: '/dashboard/kategori', icon: Tags },
    { name: 'Brand', href: '/dashboard/brand', icon: Layers },
    { name: 'Supplier', href: '/dashboard/supplier', icon: Factory },
    { name: 'Pelanggan', href: '/dashboard/pelanggan', icon: Users },
  ];

  const stokInventarisItems = [
    { name: 'Inventaris', href: '/dashboard/inventaris', icon: Warehouse },
    { name: 'Stok Opname', href: '/dashboard/stok-opname', icon: ClipboardCheck },
    { name: 'Mutasi Stok', href: '/dashboard/mutasi-stok', icon: Shuffle },
  ];

  const transaksiItems = [
    { name: 'Penjualan', href: '/dashboard/penjualan', icon: TrendingUp },
    { name: 'Pembelian', href: '/dashboard/pembelian', icon: ShoppingBag },
    { name: 'Retur Penjualan', href: '/dashboard/retur-penjualan', icon: Receipt },
    { name: 'Retur Pembelian', href: '/dashboard/retur-pembelian', icon: ShoppingBag },
  ];

  const laporanItems = [
    { name: 'Laporan Penjualan', href: '/dashboard/laporan/penjualan', icon: BarChart3 },
    { name: 'Laporan Stok', href: '/dashboard/laporan/stok', icon: PieChart },
    { name: 'Laporan Harian', href: '/dashboard/laporan/harian', icon: Calendar },
  ];

  const pengaturanItems = [
    { name: 'Pengaturan Umum', href: '/dashboard/pengaturan', icon: Settings },
    { name: 'Toko/Tenant', href: '/dashboard/pengaturan/toko', icon: Factory },
    { name: 'Pengguna', href: '/dashboard/pengaturan/pengguna', icon: Users },
    { name: 'Peran & Izin', href: '/dashboard/pengaturan/peran', icon: Users },
    { name: 'Printer & Perangkat', href: '/dashboard/pengaturan/printer', icon: Settings },
    { name: 'Pajak & Mata Uang', href: '/dashboard/pengaturan/pajak-dan-mata-uang', icon: Settings },
  ];

  // Menu tunggal
  const singleMenuItems = [
    { name: 'Promo', href: '/dashboard/promo', icon: BadgePercent },
    { name: 'Monitoring', href: '/dashboard/monitoring/status-sistem', icon: Activity },
    { name: 'Berkas', href: '/dashboard/berkas', icon: FolderOpen },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Logo and Brand + Navigation Menu */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">KasirPro</h1>
                  <p className="text-xs text-gray-500 font-medium hidden sm:block">Point of Sale System</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="hidden lg:flex lg:items-center">
                <div className="flex items-center space-x-1">
                  {/* Main Menu Items */}
                  {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${item.name === 'Dashboard' ? 'text-blue-500' : 'text-green-500'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* Master Data Dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      masterDataItems.some(item => location.pathname === item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                      <Package className="h-4 w-4 text-purple-500" />
                      <span>Master Data</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                         {masterDataItems.map((item) => {
                          const Icon = item.icon;
                          const getIconColor = (name: string) => {
                            switch(name) {
                              case 'Produk': return 'text-purple-500';
                              case 'Kategori': return 'text-orange-500';
                              case 'Brand': return 'text-pink-500';
                              case 'Supplier': return 'text-indigo-500';
                              case 'Pelanggan': return 'text-teal-500';
                              default: return 'text-gray-500';
                            }
                          };
                          return (
                            <DropdownMenu.Item key={item.name} asChild>
                              <Link
                                to={item.href}
                                className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                              >
                                <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  {/* Stok/Inventaris Dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      stokInventarisItems.some(item => location.pathname === item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                      <Warehouse className="h-4 w-4 text-amber-500" />
                      <span>Stok/Inventaris</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                        {stokInventarisItems.map((item) => {
                          const Icon = item.icon;
                          const getIconColor = (name: string) => {
                            switch(name) {
                              case 'Inventaris': return 'text-amber-600';
                              case 'Stok Opname': return 'text-yellow-600';
                              case 'Mutasi Stok': return 'text-orange-600';
                              default: return 'text-gray-500';
                            }
                          };
                          return (
                            <DropdownMenu.Item key={item.name} asChild>
                              <Link
                                to={item.href}
                                className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                              >
                                <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  {/* Transaksi Dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      transaksiItems.some(item => location.pathname === item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>Transaksi</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                        {transaksiItems.map((item) => {
                          const Icon = item.icon;
                          const getIconColor = (name: string) => {
                            switch(name) {
                              case 'Penjualan': return 'text-green-600';
                              case 'Pembelian': return 'text-blue-600';
                              case 'Retur Penjualan': return 'text-red-600';
                              case 'Retur Pembelian': return 'text-orange-600';
                              default: return 'text-gray-500';
                            }
                          };
                          return (
                            <DropdownMenu.Item key={item.name} asChild>
                              <Link
                                to={item.href}
                                className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                              >
                                <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  {/* Laporan Dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname.startsWith('/dashboard/laporan')
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span>Laporan</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                        {laporanItems.map((item) => {
                          const Icon = item.icon;
                          const getIconColor = (name: string) => {
                            switch(name) {
                              case 'Laporan Penjualan': return 'text-indigo-600';
                              case 'Laporan Stok': return 'text-purple-600';
                              case 'Laporan Harian': return 'text-blue-600';
                              default: return 'text-gray-500';
                            }
                          };
                          return (
                            <DropdownMenu.Item key={item.name} asChild>
                              <Link
                                to={item.href}
                                className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                              >
                                <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  {/* Pengaturan Dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pengaturanItems.some(item => location.pathname === item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span>Pengaturan</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                        {pengaturanItems.map((item) => {
                          const Icon = item.icon;
                          const getIconColor = (name: string) => {
                            switch(name) {
                              case 'Pengaturan Umum': return 'text-gray-600';
                              case 'Toko/Tenant': return 'text-blue-600';
                              case 'Pengguna': return 'text-green-600';
                              case 'Peran & Izin': return 'text-purple-600';
                              case 'Printer & Perangkat': return 'text-orange-600';
                              case 'Pajak & Mata Uang': return 'text-indigo-600';
                              default: return 'text-gray-500';
                            }
                          };
                          return (
                            <DropdownMenu.Item key={item.name} asChild>
                              <Link
                                to={item.href}
                                className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                              >
                                <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  {/* Single Menu Items */}
                  {singleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    const getIconColor = (name: string) => {
                      switch(name) {
                        case 'Promo': return 'text-red-500';
                        case 'Monitoring': return 'text-cyan-500';
                        default: return 'text-gray-500';
                      }
                    };
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Section: Profile and Actions */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Fullscreen Icon */}
              <button 
                onClick={toggleFullscreen}
                className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title={isFullscreen ? "Keluar dari Layar Penuh" : "Layar Penuh"}
              >
                <Maximize className="h-5 w-5" />
              </button>
              
              {/* Calculator Icon */}
              <button 
                onClick={openCalculator}
                className="hidden md:flex p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                title="Kalkulator"
              >
                <Calculator className="h-5 w-5" />
              </button>
              
              {/* Notification Icon */}
              <button className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25h-15V12l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="hidden sm:flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-left hidden md:block">
                      <p className="font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[120px]">{user?.role || 'User'}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="min-w-[224px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
                    </div>
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                      >
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Profil Saya</span>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/dashboard/pengaturan"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826 2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Pengaturan</span>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                    <DropdownMenu.Item 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span>Keluar</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 sm:p-2.5 rounded-lg text-blue-600 hover:text-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-blue-600" />
                ) : (
                  <Menu className="h-6 w-6 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden border-t border-gray-200 py-2">
            <div className="flex-1 flex items-center justify-center space-x-1 overflow-x-auto">
              {/* Main Menu Items for Tablet */}
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Master Data Dropdown for Tablet */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  masterDataItems.some(item => location.pathname === item.href)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  <Package className="h-4 w-4" />
                  <span>Master Data</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                    {masterDataItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Stok/Inventaris Dropdown for Tablet */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  stokInventarisItems.some(item => location.pathname === item.href)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  <Warehouse className="h-4 w-4" />
                  <span>Stok</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                    {stokInventarisItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Transaksi Dropdown for Tablet */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  transaksiItems.some(item => location.pathname === item.href)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  <span>Transaksi</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                    {transaksiItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              
              {/* Laporan Dropdown for Tablet */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  location.pathname.startsWith('/dashboard/laporan')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  <FileText className="h-4 w-4" />
                  <span>Laporan</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                    {laporanItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Pengaturan Dropdown for Tablet */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  pengaturanItems.some(item => location.pathname === item.href)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
                    {pengaturanItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item key={item.name} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Single Menu Items for Tablet */}
              {singleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {/* Fullscreen for Mobile */}
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Maximize className="h-5 w-5" />
                  <span>{isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}</span>
                </button>
                {/* Calculator for Mobile */}
                <button
                  onClick={openCalculator}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Calculator className="h-5 w-5" />
                  <span>Kalkulator</span>
                </button>
                {/* Main Menu Items for Mobile */}
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Master Data Menu */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-500 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    <span>Master Data</span>
                  </div>
                  {masterDataItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Stok/Inventaris Menu */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-500 text-sm font-medium">
                    <Warehouse className="h-4 w-4" />
                    <span>Stok/Inventaris</span>
                  </div>
                  {stokInventarisItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Transaksi Menu */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-500 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Transaksi</span>
                  </div>
                  {transaksiItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Mobile Laporan Menu */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-500 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    <span>Laporan</span>
                  </div>
                  {laporanItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Pengaturan Menu */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-500 text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    <span>Pengaturan</span>
                  </div>
                  {pengaturanItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Single Menu Items for Mobile */}
                {singleMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile User Info */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="px-3 py-3 bg-gray-50 rounded-lg mx-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold text-white">
                          {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
                      </div>
                    </div>
                    
                    {/* Mobile Profile Actions */}
                    <div className="space-y-1">
                      <Link
                        to="/dashboard/profile"
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        <span>Profil Saya</span>
                      </Link>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Pengaturan</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="flex-1 min-h-0 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 pb-12">
        <div className="h-full w-full max-w-none flex flex-col">
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
            <Route path="/laporan/harian" element={
              <PlaceholderPage 
                title="Laporan Harian" 
                description="Ringkasan aktivitas harian, transaksi, dan performa toko."
              />
            } />
            <Route path="/pengaturan" element={<PengaturanPage />} />
            <Route path="/pengaturan/toko" element={<PengaturanTokoPage />} />
            <Route path="/pengaturan/pengguna" element={<PengaturanPenggunaPage />} />
            <Route path="/pengaturan/peran" element={
              <PlaceholderPage 
                title="Peran & Izin" 
                description="RBAC: role dan permissions untuk kontrol akses."
              />
            } />
            <Route path="/pengaturan/printer" element={
              <PlaceholderPage 
                title="Printer & Perangkat" 
                description="Konfigurasi printer termal dan perangkat pendukung."
              />
            } />
            <Route path="/pengaturan/pajak-dan-mata-uang" element={
              <PlaceholderPage 
                title="Pajak & Mata Uang" 
                description="Pengaturan tarif pajak, mata uang, dan format."
              />
            } />
            <Route path="/monitoring/status-sistem" element={<StatusSistemPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </main>
      <footer>
        <StatusBar />
      </footer>
      
      {/* Calculator Modal */}
      <CalculatorModal 
        open={isCalculatorOpen} 
        onOpenChange={closeCalculator}
        onResult={handleCalculatorResult}
      />
    </div>
  );
}
