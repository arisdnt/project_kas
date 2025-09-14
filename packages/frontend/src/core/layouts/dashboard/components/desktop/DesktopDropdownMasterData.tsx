import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { masterDataItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopDropdownMasterData({ pathname }: { pathname: string }) {
  // Local grouping + descriptions and a second-level submenu example
  type GroupItem = {
    name: string;
    href: string;
    description: string;
    submenu?: { name: string; href: string }[];
  };
  type GroupDef = { label: string; items: GroupItem[] };

  const groups: GroupDef[] = [
    {
      label: 'Produk & Katalog',
      items: [
        {
          name: 'Produk',
          href: '/dashboard/produk',
          description: 'Kelola item, harga, varian, dan status aktif.',
          submenu: [
            { name: 'Daftar Produk', href: '/dashboard/produk' },
            { name: 'Import/Export', href: '/dashboard/produk?tab=import' },
            { name: 'Satuan & Varian', href: '/dashboard/produk?tab=varian' },
          ],
        },
        {
          name: 'Kategori',
          href: '/dashboard/kategori',
          description: 'Strukturkan katalog produk ke dalam kategori.',
        },
        { name: 'Brand', href: '/dashboard/brand', description: 'Kelola merek untuk pengelompokan dan laporan.' },
      ],
    },
    {
      label: 'Relasi & Pemasok',
      items: [
        { name: 'Supplier', href: '/dashboard/supplier', description: 'Data pemasok, kontak, dan histori transaksi.' },
        { name: 'Pelanggan', href: '/dashboard/pelanggan', description: 'Profil pelanggan dan segmentasi dasar.' },
      ],
    },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        masterDataItems.some((i) => pathname === i.href)
          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}>
        <Package className="h-4 w-4 text-purple-500" />
        <span>Data</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="min-w-[320px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {groups.map((group, gi) => (
            <div key={group.label}>
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                {group.label}
              </DropdownMenu.Label>
              <div className="mb-1" />
              {group.items.map((gitem) => {
                const iconFromBase = masterDataItems.find((i) => i.name === gitem.name)?.icon;
                const Icon = iconFromBase ?? Package;
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

                if (gitem.submenu && gitem.submenu.length > 0) {
                  return (
                    <DropdownMenu.Sub key={gitem.name}>
                      <DropdownMenu.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
                        <div className="flex items-start gap-2">
                          <Icon className={`mt-0.5 h-4 w-4 ${getIconColor(gitem.name)}`} />
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{gitem.name}</span>
                            <span className="text-xs text-gray-500">{gitem.description}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent
                          sideOffset={6}
                          alignOffset={-4}
                          className="min-w-[200px] bg-white rounded-md p-1 shadow-xl border border-gray-200 z-50"
                        >
                          <DropdownMenu.Item asChild>
                            <Link to={gitem.href} className="px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100">
                              Buka {gitem.name}
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                          {gitem.submenu.map((sub) => (
                            <DropdownMenu.Item key={sub.name} asChild>
                              <Link
                                to={sub.href}
                                className="px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {sub.name}
                              </Link>
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>
                  );
                }

                return (
                  <DropdownMenu.Item key={gitem.name} asChild>
                    <Link
                      to={gitem.href}
                      className="flex items-start gap-2 w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none"
                    >
                      <Icon className={`mt-0.5 h-4 w-4 ${getIconColor(gitem.name)}`} />
                      <div className="flex flex-col">
                        <span className="font-medium">{gitem.name}</span>
                        <span className="text-xs text-gray-500">{gitem.description}</span>
                      </div>
                    </Link>
                  </DropdownMenu.Item>
                );
              })}
              {gi < groups.length - 1 && (
                <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
              )}
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
