'use client';

import { ReactNode, useMemo } from 'react';
import clsx from 'clsx';

import { Link, usePathname } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';

export default function SidebarItem(props: { href: string; icon: ReactNode; label: string }) {
  const { href, icon, label } = props;
  const pathname = usePathname();
  const isActive = useMemo(() => {
    let isActive = false;

    if (
      (pathname === href || pathname.startsWith(PagesRoute.PROJECT)) &&
      href === PagesRoute.DASHBOARD
    ) {
      isActive = true;
    } else if (pathname.startsWith(PagesRoute.MY_ORDERS) && href === PagesRoute.MY_ORDERS) {
      isActive = true;
    } else if (pathname.startsWith(PagesRoute.MY_MESSAGES) && href === PagesRoute.MY_MESSAGES) {
      isActive = true;
    }

    return isActive;
  }, [pathname, href]);

  return (
    <Link
      className={clsx(
        'hover:bg-accent text-foreground flex items-center space-x-2 rounded-md p-2 transition-colors',
        isActive && 'bg-accent text-foreground'
      )}
      href={href}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
