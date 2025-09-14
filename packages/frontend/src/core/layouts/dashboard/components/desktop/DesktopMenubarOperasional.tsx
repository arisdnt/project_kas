import { Link } from 'react-router-dom';
import * as Menubar from '@radix-ui/react-menubar';
import { ChevronDown, ChevronRight, Layers, TrendingUp, Warehouse } from 'lucide-react';
import { stokInventarisItems, transaksiItems } from '@/core/layouts/dashboard/menuItems';

type Props = { pathname: string };

export function DesktopMenubarOperasional({ pathname }: Props) {
  const isAnyActive = [...transaksiItems, ...stokInventarisItems].some((i) => pathname === i.href);

  const transaksiList = [
    { name: 'Penjualan', href: '/dashboard/penjualan', desc: 'POS/Kasir dan daftar transaksi.' },
    { name: 'Pembelian', href: '/dashboard/pembelian', desc: 'Pencatatan pembelian dari pemasok.' },
    { name: 'Retur Penjualan', href: '/dashboard/retur-penjualan', desc: 'Pengembalian barang penjualan.' },
    { name: 'Retur Pembelian', href: '/dashboard/retur-pembelian', desc: 'Pengembalian ke pemasok.' },
  ];

  const inventarisList = [
    { name: 'Stok Opname', href: '/dashboard/stok-opname', desc: 'Audit persediaan & penyesuaian.' },
    { name: 'Mutasi Stok', href: '/dashboard/mutasi-stok', desc: 'Pindahkan/koreksi stok.' },
    { name: 'Inventaris', href: '/dashboard/inventaris', desc: 'Daftar aset & statusnya.' },
  ];

  const colorFor = (name: string) => {
    switch (name) {
      case 'Penjualan':
        return 'text-green-600';
      case 'Pembelian':
        return 'text-blue-600';
      case 'Retur Penjualan':
        return 'text-red-600';
      case 'Retur Pembelian':
        return 'text-orange-600';
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
    <Menubar.Menu>
      <Menubar.Trigger
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none ${
          isAnyActive ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Layers className="h-4 w-4 text-emerald-600" />
        <span>Operasional</span>
        <ChevronDown className="h-3 w-3" />
      </Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content align="start" sideOffset={8} className="min-w-[320px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
          {/* Submenu: Transaksi */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Transaksi</span>
                  <span className="text-xs text-gray-500">Penjualan, pembelian, retur.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[240px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {transaksiList.map((item) => (
                  <Menubar.Item key={item.name} asChild>
                    <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
                      <TrendingUp className={`mt-0.5 h-4 w-4 ${colorFor(item.name)}`} />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.desc}</span>
                      </div>
                    </Link>
                  </Menubar.Item>
                ))}
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator className="my-2 h-px bg-gray-200" />

          {/* Submenu: Inventaris */}
          <Menubar.Sub>
            <Menubar.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <Warehouse className="mt-0.5 h-4 w-4 text-amber-600" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Inventaris</span>
                  <span className="text-xs text-gray-500">Opname, mutasi, dan aset.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent side="right" align="start" sideOffset={4} className="min-w-[240px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {inventarisList.map((item) => (
                  <Menubar.Item key={item.name} asChild>
                    <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
                      <Warehouse className={`mt-0.5 h-4 w-4 ${colorFor(item.name)}`} />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.desc}</span>
                      </div>
                    </Link>
                  </Menubar.Item>
                ))}
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  );
}
