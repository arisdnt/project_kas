import { Link } from 'react-router-dom';
import {
  mainMenuItems,
  masterDataItems,
  stokInventarisItems,
  transaksiItems,
  laporanItems,
  pengaturanItems,
  singleMenuItems,
} from '@/core/layouts/dashboard/menuItems';
import { Calculator, FileText, Maximize, Package, Settings, TrendingUp, Warehouse } from 'lucide-react';
import { MobileSectionList } from '@/core/layouts/dashboard/components/mobile/MobileSectionList';
import { MobileUserInfo } from '@/core/layouts/dashboard/components/mobile/MobileUserInfo';

type UserLike = {
  fullName?: string;
  username?: string;
  role?: string;
  [key: string]: any;
};

type Props = {
  pathname: string;
  isOpen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCalculator: () => void;
  onClose: () => void;
  user: UserLike | null;
  onLogout: () => void;
};

export function NavMobile({
  pathname,
  isOpen,
  isFullscreen,
  onToggleFullscreen,
  onOpenCalculator,
  onClose,
  user,
  onLogout,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-200 py-4">
      <div className="space-y-2">
        <button
          onClick={onToggleFullscreen}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <Maximize className="h-5 w-5" />
          <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}</span>
        </button>
        <button
          onClick={onOpenCalculator}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <Calculator className="h-5 w-5" />
          <span>Kalkulator</span>
        </button>

        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <MobileSectionList title="Master Data" titleIcon={<Package className="h-4 w-4" />} items={masterDataItems} pathname={pathname} onClose={onClose} />
        <MobileSectionList title="Stok/Inventaris" titleIcon={<Warehouse className="h-4 w-4" />} items={stokInventarisItems} pathname={pathname} onClose={onClose} />
        <MobileSectionList title="Transaksi" titleIcon={<TrendingUp className="h-4 w-4" />} items={transaksiItems} pathname={pathname} onClose={onClose} />
        <MobileSectionList title="Laporan" titleIcon={<FileText className="h-4 w-4" />} items={laporanItems} pathname={pathname} onClose={onClose} />
        <MobileSectionList title="Pengaturan" titleIcon={<Settings className="h-4 w-4" />} items={pengaturanItems} pathname={pathname} onClose={onClose} />

        {singleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <MobileUserInfo user={user} onLogout={onLogout} onClose={onClose} />
      </div>
    </div>
  );
}

