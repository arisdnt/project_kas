import { Link } from 'react-router-dom';
import { mainMenuItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopMainLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {mainMenuItems
        .filter((item) => ['Dashboard', 'Kasir', 'Restok & Pembelian'].includes(item.name))
        .map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const isKasir = item.name === 'Kasir';
        const isRestok = item.name === 'Restok & Pembelian';
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive && !isKasir
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : isKasir && isActive
                  ? 'bg-blue-100/60 text-blue-800 border border-blue-300 shadow-sm backdrop-blur-[1px]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                item.name === 'Dashboard'
                  ? 'text-blue-500'
                  : isKasir
                    ? 'text-green-600'
                    : isRestok
                      ? 'text-indigo-600'
                      : 'text-gray-500'
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}
