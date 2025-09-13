import { Link } from 'react-router-dom';
import { mainMenuItems } from '@/core/layouts/dashboard/menuItems';

export function DesktopMainLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {mainMenuItems.map((item) => {
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
            <Icon className={`h-4 w-4 ${item.name === 'Dashboard' ? 'text-blue-500' : 'text-green-500'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

