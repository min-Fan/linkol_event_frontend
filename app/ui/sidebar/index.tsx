'use client';

import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import {
  FileText,
  ClipboardList,
  ChevronsRight,
  MessageSquareText,
  SquareActivity,
} from 'lucide-react';

import { Logo, LinkolLight, LinkolDark } from '@assets/svg';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import useSidebar from '@hooks/useSidebar';
import UIProfile from '@ui/profile';
import CompSidebarItem from './components/SidebarItem';

export default function UISidebar() {
  const t = useTranslations('common');
  const { isToggleSidebar } = useSidebar();

  return (
    <div
      className={clsx(
        'h-full overflow-hidden transition-all duration-300',
        isToggleSidebar ? 'w-56' : 'w-0'
      )}
    >
      <div className="box-border flex h-full w-56 flex-col space-y-4 py-8 pl-4">
        <Link href={PagesRoute.HOME}>
          <div className="flex h-9 items-center space-x-2">
            {/* <Logo className="size-8" />
            <h1 className="text-primary text-2xl font-bold capitalize">Linkol</h1> */}
            <LinkolLight className="!block !h-10 dark:!hidden" />
            <LinkolDark className="!hidden !h-10 dark:!block" />
          </div>
        </Link>
        <div className="h-full flex-1">
          <ul className="text-muted-foreground flex flex-col space-y-1 capitalize">
            <li>
              <CompSidebarItem
                href={PagesRoute.DASHBOARD}
                icon={<FileText className="size-4" />}
                label={t('my_project')}
              />
            </li>
            <li>
              <CompSidebarItem
                href={PagesRoute.MY_ORDERS}
                icon={<ClipboardList className="size-4" />}
                label={t('my_orders')}
              />
            </li>
            <li>
              <CompSidebarItem
                href={PagesRoute.MY_MESSAGES}
                icon={<MessageSquareText className="size-4" />}
                label={t('my_messages')}
              />
            </li>
            {/* <li>
              <CompSidebarItem
                href={PagesRoute.MY_CAMPAIGNS}
                icon={<SquareActivity className="size-4" />}
                label={t('my_campaigns')}
              />
            </li> */}
            <li>
              <CompSidebarItem
                href={PagesRoute.HOME}
                icon={<ChevronsRight className="size-4" />}
                label={t('btn_quick_order')}
              />
            </li>
          </ul>
        </div>
        <div className="w-full">
          <UIProfile />
        </div>
      </div>
    </div>
  );
}
