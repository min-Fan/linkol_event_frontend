'use client';

import { useState, useEffect } from 'react';
import { Logo, Linkol, LinkolPrimary, LinkolLight, LinkolDark } from '@assets/svg';
import PagesRoute from '@constants/routes';
import { Link, usePathname } from '@libs/i18n/navigation';
import Profile, { MenuSize } from '@ui/profile';
import UILanguage from '@ui/language';
import UITheme from '@ui/theme';
import CompSidebar from './components/Sidebar';
import CompNav from './components/Nav';

export interface NavigationItem {
  href: string;
  labelKey: string;
  isActive: (pathname: string) => boolean;
  shouldShow: (isLogin: boolean, isConnected: boolean, pathname: string) => boolean;
  isComingSoon?: boolean;
}

// 统一的导航配置
export const navigationItems: NavigationItem[] = [
  {
    href: PagesRoute.HOME,
    labelKey: 'nav_project_client',
    isActive: (pathname) => pathname === PagesRoute.HOME || pathname === '/',
    shouldShow: () => false,
  },
  {
    href: PagesRoute.KOL,
    labelKey: 'nav_kol_client',
    isActive: (pathname) => pathname === PagesRoute.KOL,
    shouldShow: () => false,
  },
  {
    href: PagesRoute.CHAT,
    labelKey: 'nav_chat',
    isActive: (pathname) => pathname.includes(PagesRoute.CHAT),
    shouldShow: () => false,
  },
  {
    href: PagesRoute.BRANDING,
    labelKey: 'branding',
    isActive: (pathname) => pathname.includes(PagesRoute.BRANDING),
    shouldShow: () => false,
  },
  {
    href: PagesRoute.MARKET_EVENTS,
    labelKey: 'nav_market_events',
    isActive: (pathname) => pathname.includes(PagesRoute.MARKET_EVENTS),
    shouldShow: () => false,
  },
  {
    href: PagesRoute.MY_AGENT,
    labelKey: 'nav_my_agent',
    isActive: (pathname) => pathname.includes(PagesRoute.MY_AGENT),
    shouldShow: () => true,
  },
  {
    href: PagesRoute.OPINIONS,
    labelKey: 'nav_predict',
    isActive: (pathname) => pathname.includes(PagesRoute.OPINIONS),
    shouldShow: () => true,
  },
  {
    href: PagesRoute.DASHBOARD,
    labelKey: 'nav_dashboard',
    isActive: (pathname) => pathname.includes(PagesRoute.DASHBOARD),
    // (isLogin, isConnected, pathname) => isLogin && isConnected && !pathname.includes(PagesRoute.KOL),
    shouldShow: () => false,
  },
];

export default function Header(props: { hasLogin?: boolean }) {
  const { hasLogin = true } = props;
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      // ${scrolled ? 'bg-background/80 shadow-sm backdrop-blur-sm' : 'bg-transparent'}
      className={`fixed top-0 z-50 box-border w-full bg-black shadow-sm backdrop-blur-sm transition-colors duration-300`}
    >
      <section className="mx-auto box-border flex h-14 items-center justify-between gap-x-8 px-4 sm:h-16 sm:px-10">
        <div className="flex items-center gap-x-0 sm:gap-x-4">
          {/* <div className="block sm:hidden">
            <CompSidebar navigationItems={navigationItems} />
          </div> */}
          <Link className="flex items-center gap-x-2" href={PagesRoute.HOME}>
            <LinkolDark className="!h-10" />
          </Link>
        </div>
        <div className="hidden w-full flex-1 sm:block">
          <CompNav navigationItems={navigationItems} />
        </div>
        <div className="flex w-auto items-center gap-2">
          
          {hasLogin && (
            <>
              <div className="hidden sm:block">
                <Profile />
              </div>
              <div className="block sm:hidden">
                <Profile size={'icon' as MenuSize} />
              </div>
            </>
          )}
          <UILanguage />
          <UITheme />
        </div>
      </section>
    </header>
  );
}
