import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Package, Warehouse, TrendingUp, FileText, Settings, Wrench } from 'lucide-react';
import {
  mainMenuItems,
  masterDataItems,
  stokInventarisItems,
  transaksiItems,
  laporanItems,
  pengaturanItems,
  singleMenuItems,
} from '@/core/layouts/dashboard/menuItems';

type Props = {
  pathname: string;
};

export function NavTablet({ pathname }: Props) {
  return (
    <div className="hidden md:flex lg:hidden border-t border-gray-200 py-2">
      <div className="flex-1 flex items-center justify-center space-x-1 overflow-x-auto">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
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

        {/* Master Data */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            masterDataItems.some((i) => pathname === i.href)
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

        {/* Stok/Inventaris */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            stokInventarisItems.some((i) => pathname === i.href)
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

        {/* Transaksi */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            transaksiItems.some((i) => pathname === i.href)
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

        {/* Laporan */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            pathname.startsWith('/dashboard/laporan')
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

        {/* Pengaturan */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            pengaturanItems.some((i) => pathname === i.href)
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

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            singleMenuItems.some((i) => pathname === i.href)
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Wrench className="h-4 w-4" />
            <span>Utilitas</span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="min-w-[192px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
              {singleMenuItems.map((item) => {
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
      </div>
    </div>
  );
}
