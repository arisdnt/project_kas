import { Link } from 'react-router-dom';
import * as Menubar from '@radix-ui/react-menubar';
import { ChevronDown, ChevronRight, FileText, Settings, Wrench } from 'lucide-react';
import { laporanItems, pengaturanItems, singleMenuItems } from '@/core/layouts/dashboard/menuItems';

type Props = { pathname: string };

export function DesktopMenubarLainnya({ pathname }: Props) {
  const isAnyActive = [...laporanItems, ...pengaturanItems, ...singleMenuItems].some((i) => pathname === i.href);

  return (
    <Menubar.Menu>
      <Menubar.Trigger
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none ${
          isAnyActive ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Wrench className="h-4 w-4 text-gray-700" />
        <span>Lainnya</span>
        <ChevronDown className="h-3 w-3" />
      </Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content align="start" sideOffset={8} className="min-w-[340px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
          {/* Submenu: Laporan */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Laporan</span>
                  <span className="text-xs text-gray-500">Penjualan, stok, dan keuangan.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[240px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {laporanItems.map((item) => {
                  const Icon = item.icon ?? FileText;
                  const color =
                    item.name === 'Laporan Penjualan'
                      ? 'text-indigo-600'
                      : item.name === 'Laporan Stok'
                        ? 'text-purple-600'
                        : item.name === 'Arus Kas & Laba Rugi'
                          ? 'text-green-600'
                          : 'text-blue-600';
                  const desc =
                    item.name === 'Laporan Penjualan'
                      ? 'Ringkasan omzet & item.'
                      : item.name === 'Laporan Stok'
                        ? 'Nilai persediaan & pergerakan.'
                        : item.name === 'Arus Kas & Laba Rugi'
                          ? 'Arus kas dan profit.'
                          : 'Kinerja harian.';
                  return (
                    <Menubar.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
                        <Icon className={`mt-0.5 h-4 w-4 ${color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{desc}</span>
                        </div>
                      </Link>
                    </Menubar.Item>
                  );
                })}
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator className="my-2 h-px bg-gray-200" />

          {/* Submenu: Pengaturan */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <Settings className="mt-0.5 h-4 w-4 text-gray-700" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Pengaturan</span>
                  <span className="text-xs text-gray-500">Umum, akses, perangkat.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[260px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {pengaturanItems.map((item) => {
                  const Icon = item.icon ?? Settings;
                  const color =
                    item.name === 'Pengaturan Umum'
                      ? 'text-gray-600'
                      : item.name === 'Toko/Tenant' || item.name === 'Manajemen Tenan'
                        ? 'text-blue-600'
                        : item.name === 'Pengguna'
                          ? 'text-green-600'
                          : item.name === 'Peran & Izin'
                            ? 'text-purple-600'
                            : item.name === 'Printer & Perangkat'
                              ? 'text-orange-600'
                              : 'text-indigo-600';
                  const desc =
                    item.name === 'Pengaturan Umum'
                      ? 'Preferensi dan branding.'
                      : item.name === 'Toko/Tenant'
                        ? 'Profil toko & cabang.'
                        : item.name === 'Manajemen Tenan'
                          ? 'Kelola multi-tenant.'
                          : item.name === 'Pengguna'
                            ? 'Akun & akses.'
                            : item.name === 'Peran & Izin'
                              ? 'Definisikan hak akses.'
                              : item.name === 'Printer & Perangkat'
                                ? 'Koneksi perangkat.'
                                : 'Atur pajak & currency.';
                  return (
                    <Menubar.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
                        <Icon className={`mt-0.5 h-4 w-4 ${color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{desc}</span>
                        </div>
                      </Link>
                    </Menubar.Item>
                  );
                })}
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator className="my-2 h-px bg-gray-200" />

          {/* Submenu: Utilitas */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <Wrench className="mt-0.5 h-4 w-4 text-gray-700" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Utilitas</span>
                  <span className="text-xs text-gray-500">Promo, monitoring, berkas.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[220px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {singleMenuItems.map((item) => {
                  const desc = item.name === 'Promo' ? 'Atur promosi & diskon.' : item.name === 'Monitoring' ? 'Pantau status sistem.' : 'Kelola berkas.';
                  const color = item.name === 'Promo' ? 'text-red-500' : item.name === 'Monitoring' ? 'text-cyan-500' : 'text-gray-500';
                  const Icon = item.icon ?? Wrench;
                  return (
                    <Menubar.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
                        <Icon className={`mt-0.5 h-4 w-4 ${color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{desc}</span>
                        </div>
                      </Link>
                    </Menubar.Item>
                  );
                })}
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  );
}
