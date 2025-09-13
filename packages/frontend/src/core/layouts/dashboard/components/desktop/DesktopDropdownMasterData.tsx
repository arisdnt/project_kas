import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Package } from 'lucide-react';
import { masterDataItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopDropdownMasterData({ pathname }: { pathname: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        masterDataItems.some((i) => pathname === i.href)
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
              switch (name) {
                case 'Produk':
                  return 'text-purple-500';
                case 'Kategori':
                  return 'text-orange-500';
                case 'Brand':
                  return 'text-pink-500';
                case 'Supplier':
                  return 'text-indigo-500';
                case 'Pelanggan':
                  return 'text-teal-500';
                default:
                  return 'text-gray-500';
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
  );
}

