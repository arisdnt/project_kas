import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

type UserLike = {
  fullName?: string;
  username?: string;
  role?: string;
  [key: string]: any;
};

type Props = {
  user: UserLike | null;
  onLogout: () => void;
  onClose: () => void;
};

export function MobileUserInfo({ user, onLogout, onClose }: Props) {
  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <div className="px-3 py-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Link to="/dashboard/detailuser" onClick={onClose} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors">
            <Users className="h-4 w-4" />
            <span>Profil Saya</span>
          </Link>
          <Link to="/dashboard/pengaturansaya" onClick={onClose} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Pengaturan</span>
          </Link>
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a4 4 0 004 4h3" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
