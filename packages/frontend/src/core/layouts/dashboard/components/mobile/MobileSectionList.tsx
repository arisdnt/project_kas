import { Link } from 'react-router-dom';
import { MenuItem } from '@/core/layouts/dashboard/menuItems';

type Props = {
  title: string;
  titleIcon: React.ReactNode;
  items: MenuItem[];
  pathname: string;
  onClose: () => void;
};

export function MobileSectionList({ title, titleIcon, items, pathname, onClose }: Props) {
  return (
    <div className="border-t border-gray-100 pt-2 mt-2">
      <div className="flex items-center space-x-3 px-4 py-2 text-gray-500 text-sm font-medium">
        {titleIcon}
        <span>{title}</span>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

