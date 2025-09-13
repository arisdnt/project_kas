import { Brand } from '@/core/layouts/dashboard/components/Brand';
import { NavDesktop } from '@/core/layouts/dashboard/components/NavDesktop';
import { NavTablet } from '@/core/layouts/dashboard/components/NavTablet';
import { ActionIcons } from '@/core/layouts/dashboard/components/ActionIcons';
import { ProfileDropdown } from '@/core/layouts/dashboard/components/ProfileDropdown';
import { MobileMenuButton } from '@/core/layouts/dashboard/components/MobileMenuButton';

type UserLike = {
  fullName?: string;
  username?: string;
  role?: string;
  [key: string]: any;
};

type Props = {
  pathname: string;
  user: UserLike | null;
  onLogout: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCalculator: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
};

export function DashboardHeader({
  pathname,
  user,
  onLogout,
  isFullscreen,
  onToggleFullscreen,
  onOpenCalculator,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: Props) {
  return (
    <div className="w-full px-2 sm:px-4 lg:px-6">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-6">
          <Brand />
          <NavDesktop pathname={pathname} />
        </div>
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
          <ActionIcons isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} onOpenCalculator={onOpenCalculator} />
          <ProfileDropdown user={user} onLogout={onLogout} />
          <MobileMenuButton open={isMobileMenuOpen} onToggle={onToggleMobileMenu} />
        </div>
      </div>
      <NavTablet pathname={pathname} />
    </div>
  );
}

