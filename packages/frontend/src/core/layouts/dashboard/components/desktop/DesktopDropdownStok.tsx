import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Warehouse } from 'lucide-react';
import { stokInventarisItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopDropdownStok({ pathname }: { pathname: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        stokInventarisItems.some((i) => pathname === i.href)
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
              switch (name) {
                case 'Inventaris':
                  return 'text-amber-600';
                case 'Stok Opname':
                  return 'text-yellow-600';
                case 'Mutasi Stok':
                  return 'text-orange-600';
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

