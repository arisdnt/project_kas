import { Link } from 'react-router-dom';
import * as Menubar from '@radix-ui/react-menubar';
import { ChevronDown, ChevronRight, Package, Users } from 'lucide-react';
import { masterDataItems } from '@/core/layouts/dashboard/menuItems';

type Props = { pathname: string };

export function DesktopMenubarData({ pathname }: Props) {
  const isAnyActive = masterDataItems.some((i) => pathname === i.href);

  const katalogItems = [
    { name: 'Produk', href: '/dashboard/produk', desc: 'Kelola item, harga, varian.' },
    { name: 'Kategori', href: '/dashboard/kategori', desc: 'Struktur katalog produk.' },
    { name: 'Brand', href: '/dashboard/brand', desc: 'Kelola merek & pelaporan.' },
  ];
  const relasiItems = [
    { name: 'Supplier', href: '/dashboard/supplier', desc: 'Data pemasok & kontak.' },
    { name: 'Pelanggan', href: '/dashboard/pelanggan', desc: 'Profil pelanggan & segmentasi.' },
  ];

  return (
    <Menubar.Menu>
      <Menubar.Trigger
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none ${
          isAnyActive ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Package className="h-4 w-4 text-purple-500" />
        <span>Data</span>
        <ChevronDown className="h-3 w-3" />
      </Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content align="start" sideOffset={8} className="min-w-[320px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
          {/* Submenu: Produk & Katalog */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <Package className="mt-0.5 h-4 w-4 text-purple-500" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Produk & Katalog</span>
                  <span className="text-xs text-gray-500">Produk, kategori, dan brand.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[220px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {katalogItems.map((item) => {
                  const Icon = masterDataItems.find((i) => i.name === item.name)?.icon ?? Package;
                  const color = item.name === 'Produk' ? 'text-purple-500' : item.name === 'Kategori' ? 'text-orange-500' : 'text-pink-500';
                  return (
                    <Menubar.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
                        <Icon className={`mt-0.5 h-4 w-4 ${color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </div>
                      </Link>
                    </Menubar.Item>
                  );
                })}
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator className="my-2 h-px bg-gray-200" />

          {/* Submenu: Relasi & Pemasok */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-teal-500" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Relasi & Pemasok</span>
                  <span className="text-xs text-gray-500">Supplier dan pelanggan.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[220px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {relasiItems.map((item) => {
                  const Icon = masterDataItems.find((i) => i.name === item.name)?.icon ?? Users;
                  const color = item.name === 'Supplier' ? 'text-indigo-500' : 'text-teal-500';
                  return (
                    <Menubar.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
                        <Icon className={`mt-0.5 h-4 w-4 ${color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.desc}</span>
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
