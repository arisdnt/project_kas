import { DesktopMainLinks } from '@/core/layouts/dashboard/components/desktop/DesktopMainLinks';
import { DesktopDropdownMasterData } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownMasterData';
import { DesktopDropdownOperasional } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownOperasional';
import { DesktopDropdownLainnya } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownLainnya';

type Props = {
  pathname: string;
};

export function NavDesktop({ pathname }: Props) {
  return (
    <div className="hidden lg:flex lg:items-center">
      <div className="flex items-center space-x-1">
        {/* Maksimal 4 menu: Dashboard, Operasional, Data, Lainnya */}
        <DesktopMainLinks pathname={pathname} />
        <DesktopDropdownOperasional pathname={pathname} />
        <DesktopDropdownMasterData pathname={pathname} />
        <DesktopDropdownLainnya pathname={pathname} />
      </div>
    </div>
  );
}
