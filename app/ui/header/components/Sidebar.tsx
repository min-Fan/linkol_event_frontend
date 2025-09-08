'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';

import { Button } from '@shadcn/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@shadcn/components/ui/sheet';
import { Link, usePathname } from '@libs/i18n/navigation';
import useUserInfo from '@hooks/useUserInfo';
import { cn } from '@shadcn/lib/utils';
import { NavigationItem } from '../index';

interface SidebarProps {
  navigationItems: NavigationItem[];
}

export default function Sidebar(props: SidebarProps) {
  const { navigationItems } = props;
  const t = useTranslations('common');
  const pathname = usePathname();
  const { isLogin } = useUserInfo();
  const { isConnected } = useAccount();

  // 过滤出应该显示的导航项
  const filteredItems = navigationItems.filter((item) =>
    item.shouldShow(isLogin, isConnected, pathname)
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="!size-6" variant="outline" size="icon">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-2/3">
        <div className="p-4 pt-10">
          <div className="flex flex-col gap-2">
            {filteredItems.map((item) => {
              const isActive = item.isActive(pathname);
              const isComingSoon = item.isComingSoon;

              return (
                <div
                  key={item.href}
                  className="flex w-full items-center rounded-lg text-sm font-medium"
                >
                  {isComingSoon ? (
                    <div
                      className={cn(
                        'relative w-full cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium opacity-60 transition-colors',
                        'flex items-center justify-between'
                      )}
                    >
                      <span className="text-sm text-gray-400">{t(item.labelKey)}</span>
                      <span className="bg-primary/80 rounded-full px-1 py-0.5 text-xs !text-[10px] leading-none text-white">
                        COMING SOON
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'hover:bg-accent hover:text-accent-foreground w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive && 'bg-primary/5 text-primary'
                      )}
                    >
                      {t(item.labelKey)}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
