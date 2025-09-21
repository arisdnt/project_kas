import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router-dom';
import { LogOut, Users, User } from 'lucide-react';

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
      <DropdownMenu.Trigger className="hidden sm:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title={`${user?.fullName || user?.username || 'User'} - ${user?.role || 'User'}`}>
        <User className="h-5 w-5" />
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
