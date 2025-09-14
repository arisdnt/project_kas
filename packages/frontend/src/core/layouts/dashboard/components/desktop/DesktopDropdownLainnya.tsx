import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronRight, Settings, FileText, Wrench } from 'lucide-react';
import { laporanItems, pengaturanItems, singleMenuItems } from '@/core/layouts/dashboard/menuItems';

type Props = { pathname: string };

export function DesktopDropdownLainnya({ pathname }: Props) {
  type GroupItem = {
    name: string;
    href: string;
    description: string;
    submenu?: { name: string; href: string }[];
  };
  type GroupDef = { label: string; items: GroupItem[] };

  const groups: GroupDef[] = [
    {
      label: 'Laporan',
      items: [
        {
          name: 'Laporan Penjualan',
          href: '/dashboard/laporan/penjualan',
          description: 'Ringkasan omzet, item terlaris, dan kanal.',
          submenu: [
            { name: 'Ringkasan', href: '/dashboard/laporan/penjualan?view=summary' },
            { name: 'Detail Item', href: '/dashboard/laporan/penjualan?view=item' },
          ],
        },
        { name: 'Laporan Stok', href: '/dashboard/laporan/stok', description: 'Nilai persediaan dan pergerakan.' },
        { name: 'Arus Kas & Laba Rugi', href: '/dashboard/laporan/keuangan', description: 'Arus kas masuk/keluar dan profit.' },
        { name: 'Laporan Harian', href: '/dashboard/laporan/harian', description: 'Kinerja harian dan rekap.' },
      ],
    },
    {
      label: 'Pengaturan',
      items: [
        {
          name: 'Pengaturan Umum',
          href: '/dashboard/pengaturan',
          description: 'Preferensi dasar, bahasa, dan branding.',
          submenu: [
            { name: 'Preferensi', href: '/dashboard/pengaturan?tab=preferensi' },
            { name: 'Integrasi', href: '/dashboard/pengaturan?tab=integrasi' },
          ],
        },
        { name: 'Pajak & Mata Uang', href: '/dashboard/pengaturan/pajak-dan-mata-uang', description: 'Atur PPN, diskon, format.' },
        { name: 'Toko/Tenant', href: '/dashboard/pengaturan/toko', description: 'Profil toko dan cabang.' },
        { name: 'Manajemen Tenan', href: '/dashboard/pengaturan/tenan', description: 'Kelola multi-tenant/gerai.' },
        { name: 'Pengguna', href: '/dashboard/pengaturan/pengguna', description: 'Kelola akun dan akses.' },
        { name: 'Peran & Izin', href: '/dashboard/pengaturan/peran', description: 'Definisikan peran dan hak.' },
        { name: 'Printer & Perangkat', href: '/dashboard/pengaturan/printer', description: 'Koneksi perangkat POS.' },
      ],
    },
    {
      label: 'Utilitas',
      items: singleMenuItems.map((i) => ({
        name: i.name,
        href: i.href,
        description:
          i.name === 'Promo'
            ? 'Atur promosi dan diskon.'
            : i.name === 'Monitoring'
              ? 'Pantau status sistem.'
              : 'Kelola berkas dan dokumen.',
      })),
    },
  ];

  const isAnyActive = [...laporanItems, ...pengaturanItems, ...singleMenuItems].some((i) => pathname === i.href);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isAnyActive ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Wrench className="h-4 w-4 text-gray-700" />
        <span>Lainnya</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={8} className="min-w[340px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
          {groups.map((group, gi) => (
            <div key={group.label}>
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                {group.label}
              </DropdownMenu.Label>
              <div className="mb-1" />
              {group.items.map((gitem) => {
                const iconFromBase =
                  (group.label === 'Laporan'
                    ? laporanItems.find((i) => i.name === gitem.name)?.icon
                    : group.label === 'Pengaturan'
                      ? pengaturanItems.find((i) => i.name === gitem.name)?.icon
                      : undefined) ?? Settings;
                const Icon = iconFromBase;
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
                    case 'Pengaturan Umum':
                      return 'text-gray-600';
                    case 'Toko/Tenant':
                    case 'Manajemen Tenan':
                      return 'text-blue-600';
                    case 'Pengguna':
                      return 'text-green-600';
                    case 'Peran & Izin':
                      return 'text-purple-600';
                    case 'Printer & Perangkat':
                      return 'text-orange-600';
                    case 'Pajak & Mata Uang':
                      return 'text-indigo-600';
                    case 'Promo':
                      return 'text-red-500';
                    case 'Monitoring':
                      return 'text-cyan-500';
                    case 'Berkas':
                      return 'text-gray-500';
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
                        <DropdownMenu.SubContent sideOffset={6} alignOffset={-4} className="min-w-[220px] bg-white rounded-md p-1 shadow-xl border border-gray-200 z-50">
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
              {gi < groups.length - 1 && <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />}
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

