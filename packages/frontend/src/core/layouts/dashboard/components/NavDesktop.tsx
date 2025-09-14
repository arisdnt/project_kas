import { DesktopMainLinks } from '@/core/layouts/dashboard/components/desktop/DesktopMainLinks';
import * as Menubar from '@radix-ui/react-menubar';
import { DesktopMenubarOperasional } from '@/core/layouts/dashboard/components/desktop/DesktopMenubarOperasional';
import { DesktopMenubarData } from '@/core/layouts/dashboard/components/desktop/DesktopMenubarData';
import { DesktopMenubarLainnya } from '@/core/layouts/dashboard/components/desktop/DesktopMenubarLainnya';

type Props = {
  pathname: string;
};

export function NavDesktop({ pathname }: Props) {
  return (
    <div className="hidden lg:flex lg:items-center">
      {/* Dashboard tetap link biasa di kiri */}
      <DesktopMainLinks pathname={pathname} />
      {/* Menubar untuk multi-level yang robust */}
      <Menubar.Root className="flex items-center space-x-1 ml-1">
        <DesktopMenubarOperasional pathname={pathname} />
        <DesktopMenubarData pathname={pathname} />
        <DesktopMenubarLainnya pathname={pathname} />
      </Menubar.Root>
    </div>
  );
}
