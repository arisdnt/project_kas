import { DesktopMainLinks } from '@/core/layouts/dashboard/components/desktop/DesktopMainLinks';
import { DesktopDropdownMasterData } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownMasterData';
import { DesktopDropdownStok } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownStok';
import { DesktopDropdownTransaksi } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownTransaksi';
import { DesktopDropdownLaporan } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownLaporan';
import { DesktopDropdownPengaturan } from '@/core/layouts/dashboard/components/desktop/DesktopDropdownPengaturan';
import { DesktopSingleLinks } from '@/core/layouts/dashboard/components/desktop/DesktopSingleLinks';

type Props = {
  pathname: string;
};

export function NavDesktop({ pathname }: Props) {
  return (
    <div className="hidden lg:flex lg:items-center">
      <div className="flex items-center space-x-1">
        <DesktopMainLinks pathname={pathname} />
        <DesktopDropdownMasterData pathname={pathname} />
        <DesktopDropdownStok pathname={pathname} />
        <DesktopDropdownTransaksi pathname={pathname} />
        <DesktopDropdownLaporan pathname={pathname} />
        <DesktopDropdownPengaturan pathname={pathname} />
        <DesktopSingleLinks pathname={pathname} />
      </div>
    </div>
  );
}

