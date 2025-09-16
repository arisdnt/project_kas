import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router-dom';
import { LogOut, Users } from 'lucide-react';

type UserLike = {
  fullName?: string;
  username?: string;
  role?: string;
  [key: string]: any;
};

type Props = {
  user: UserLike | null;
  onLogout: () => void;
};

export function ProfileDropdown({ user, onLogout }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="hidden sm:flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-left hidden md:block">
            <p className="font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">{user?.fullName || user?.username}</p>
            <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[120px]">{user?.role || 'User'}</p>
          </div>
          <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="min-w-[224px] bg-white rounded-md p-1 shadow-lg border border-gray-200 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
          </div>
          <DropdownMenu.Item asChild>
            <Link
              to="/dashboard/profilsaya"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none focus:bg-gray-100 data-[highlighted]:bg-gray-100"
            >
              <Users className="h-4 w-4 text-blue-600" />
              <span>Profil Saya</span>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              to="/dashboard/pengaturansaya"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none focus:bg-gray-100 data-[highlighted]:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pengaturan</span>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
          >
            <LogOut className="h-4 w-4 text-red-600" />
            <span>Keluar</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
