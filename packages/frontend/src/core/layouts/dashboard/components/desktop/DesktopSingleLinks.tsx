import { Link } from 'react-router-dom';
import { singleMenuItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopSingleLinks({ pathname }: { pathname: string }) {
  const getIconColor = (name: string) => {
    switch (name) {
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

  return (
    <>
      {singleMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className={`h-4 w-4 ${getIconColor(item.name)}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

