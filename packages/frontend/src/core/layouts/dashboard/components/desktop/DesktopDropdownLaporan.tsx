import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, FileText } from 'lucide-react';
import { laporanItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopDropdownLaporan({ pathname }: { pathname: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        pathname.startsWith('/dashboard/laporan')
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
              switch (name) {
                case 'Laporan Penjualan':
                  return 'text-indigo-600';
                case 'Laporan Stok':
                  return 'text-purple-600';
                case 'Laporan Harian':
                  return 'text-blue-600';
                case 'Arus Kas & Laba Rugi':
                  return 'text-green-600';
                default:
                  return 'text-gray-500';
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
  );
}
