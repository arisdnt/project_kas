import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronRight, Layers, TrendingUp, Warehouse } from 'lucide-react';
import { transaksiItems, stokInventarisItems } from '@/core/layouts/dashboard/menuItems';

type Props = { pathname: string };

export function DesktopDropdownOperasional({ pathname }: Props) {
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

  const iconFor = (group: 'Transaksi' | 'Inventaris', name?: string) => {
    if (group === 'Transaksi') return TrendingUp;
    return Warehouse;
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isAnyActive ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Layers className="h-4 w-4 text-emerald-600" />
        <span>Operasional</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={8} className="min-w-[320px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
          {/* Submenu: Transaksi */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Transaksi</span>
                  <span className="text-xs text-gray-500">Penjualan, pembelian, retur.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent sideOffset={6} alignOffset={-4} className="min-w-[240px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {transaksiList.map((item) => {
                  const Icon = iconFor('Transaksi');
                  return (
                    <DropdownMenu.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
                        <Icon className={`mt-0.5 h-4 w-4 ${colorFor(item.name)}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </div>
                      </Link>
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />

          {/* Submenu: Inventaris */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="group flex items-start justify-between w-full px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 outline-none">
              <div className="flex items-start gap-2">
                <Warehouse className="mt-0.5 h-4 w-4 text-amber-600" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">Inventaris</span>
                  <span className="text-xs text-gray-500">Opname, mutasi, dan aset.</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:text-gray-600" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent sideOffset={6} alignOffset={-4} className="min-w-[240px] bg-white rounded-md p-2 shadow-xl border border-gray-200 z-50">
                {inventarisList.map((item) => {
                  const Icon = iconFor('Inventaris');
                  return (
                    <DropdownMenu.Item key={item.name} asChild>
                      <Link to={item.href} className="flex items-start gap-2 px-2 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">
                        <Icon className={`mt-0.5 h-4 w-4 ${colorFor(item.name)}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </div>
                      </Link>
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
