import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { laporanItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopDropdownLaporan({ pathname }: { pathname: string }) {
  type GroupItem = {
    name: string;
    href: string;
    description: string;
    submenu?: { name: string; href: string }[];
  };
  type GroupDef = { label: string; items: GroupItem[] };

  const groups: GroupDef[] = [
    {
      label: 'Penjualan',
      items: [
        {
          name: 'Laporan Penjualan',
          href: '/dashboard/laporan/penjualan',
          description: 'Ringkasan omzet, item terlaris, dan performa kanal.',
          submenu: [
            { name: 'Ringkasan', href: '/dashboard/laporan/penjualan?view=summary' },
            { name: 'Detail Item', href: '/dashboard/laporan/penjualan?view=item' },
          ],
        },
      ],
    },
    {
      label: 'Persediaan',
      items: [
        { name: 'Laporan Stok', href: '/dashboard/laporan/stok', description: 'Nilai persediaan dan pergerakan stok.' },
      ],
    },
    {
      label: 'Keuangan',
      items: [
        { name: 'Arus Kas & Laba Rugi', href: '/dashboard/laporan/keuangan', description: 'Arus kas masuk/keluar dan profit.' },
      ],
    },
    {
      label: 'Periodik',
      items: [
        { name: 'Laporan Harian', href: '/dashboard/laporan/harian', description: 'Kinerja harian dan rekap penutupan.' },
      ],
    },
  ];

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
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="min-w-[320px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50"
        >
          {groups.map((group, gi) => (
            <div key={group.label}>
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                {group.label}
              </DropdownMenu.Label>
              <div className="mb-1" />
              {group.items.map((gitem) => {
                const iconFromBase = laporanItems.find((i) => i.name === gitem.name)?.icon;
                const Icon = iconFromBase ?? FileText;
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

                if (gitem.submenu) {
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
                        <DropdownMenu.SubContent sideOffset={6} alignOffset={-4} className="min-w-[200px] bg-white rounded-md p-1 shadow-xl border border-gray-200 z-50">
                          <DropdownMenu.Item asChild>
                            <Link to={gitem.href} className="px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100">
                              Buka {gitem.name}
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                          {gitem.submenu.map((sub) => (
                            <DropdownMenu.Item key={sub.name} asChild>
                              <Link to={sub.href} className="px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100">
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
