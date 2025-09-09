'use client';

import { useTranslations } from 'next-intl';
import { ChevronsUpDown, Link2, LogOut, Unlink2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@shadcn-ui/dropdown-menu';
import { Button } from '@shadcn-ui/button';

import { usePathname } from '@libs/i18n/navigation';
import useUserInfo from '@hooks/useUserInfo';
import UIDialogBindEmail from '@ui/dialog/BindEmail';
import UIDialogUnbindEmail from '@ui/dialog/UnbindEmail';
import CompUserAvatar from './UserAvatar';
import CompUserInfo from './UserInfo';
import CompLanguage from './Language';
import CompTheme from './Theme';
import { useAppSelector } from '@store/hooks';
import defaultAvatar from '@assets/image/avatar.png';
import { useEffect } from 'react';

export enum MenuSize {
  DEFAULT = 'default',
  ICON = 'icon',
}

export default function LogOutMenu(props: { size?: MenuSize }) {
  const { size = MenuSize.DEFAULT } = props;
  const t = useTranslations('common');
  const { username, email, logout } = useUserInfo();
  const twInfo = useAppSelector((state) => state.userReducer?.twitter_full_profile);
  const pathname = usePathname();

  useEffect(() => {
    console.log('size', size);
  }, [size]);

  // if (twInfo && (pathname.includes('kol') || pathname.includes('market_events'))) {
  return (
    <DropdownMenu>
      {size === MenuSize.DEFAULT && (
        <DropdownMenuTrigger asChild>
          <Button className="hover:bg-secondary/80 w-full px-2" variant="secondary">
            <div className="flex w-full items-center space-x-2 text-left">
              <img
                src={twInfo.profile_image_url}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAvatar.src;
                }}
              />
              <dl className="overflow-hidden">
                <dt className="truncate font-bold normal-case">{`${twInfo.name}`}</dt>
                <dd className="text-muted-foreground text-xs normal-case">@{twInfo.screen_name}</dd>
              </dl>
              <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
            </div>
            <span className="sr-only">Toggle profile</span>
          </Button>
        </DropdownMenuTrigger>
      )}
      {size === MenuSize.ICON && (
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <CompUserAvatar className="size-6" username={twInfo.name} />
            <span className="sr-only">Toggle profile</span>
          </Button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent className="border-border w-40" align="end">
        {/* <DropdownMenuItem className="capitalize">
            <Link className="w-full" href={PagesRoute.MY_TASK} prefetch={true}>
              {t('my_task')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
        <DropdownMenuGroup>
          <CompLanguage />
          <CompTheme />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {twInfo.email?.includes('@') ? (
          <UIDialogUnbindEmail email={twInfo.email} kol={true}>
            <DropdownMenuItem
              className="cursor-pointer capitalize"
              onSelect={(evt) => evt.preventDefault()}
            >
              {t('btn_unbind_email')}
              <DropdownMenuShortcut>
                <Unlink2 className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </UIDialogUnbindEmail>
        ) : (
          <UIDialogBindEmail kol={true}>
            <DropdownMenuItem
              className="cursor-pointer capitalize"
              onSelect={(evt) => evt.preventDefault()}
            >
              {t('btn_bind_email')}
              <DropdownMenuShortcut>
                <Link2 className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </UIDialogBindEmail>
        )}
        <DropdownMenuItem className="cursor-pointer capitalize" onClick={logout}>
          {t('btn_log_out')}
          <DropdownMenuShortcut>
            <LogOut className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  // }

  // return (
  //   <DropdownMenu>
  //     {size === MenuSize.DEFAULT && (
  //       <DropdownMenuTrigger asChild>
  //         <Button className="w-full px-2" variant="secondary">
  //           <div className="flex w-full items-center space-x-2 text-left">
  //             <CompUserAvatar className="size-6" username={username} />
  //             <CompUserInfo username={username} email={email} />
  //             <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
  //           </div>
  //           <span className="sr-only">Toggle profile</span>
  //         </Button>
  //       </DropdownMenuTrigger>
  //     )}
  //     {size === MenuSize.ICON && (
  //       <DropdownMenuTrigger asChild>
  //         <Button variant="ghost" size="icon">
  //           <CompUserAvatar className="size-6" username={username} />
  //           <span className="sr-only">Toggle profile</span>
  //         </Button>
  //       </DropdownMenuTrigger>
  //     )}
  //     <DropdownMenuContent className="border-border w-40" align="end">
  //       {email.includes('@') ? (
  //         <UIDialogUnbindEmail email={email}>
  //           <DropdownMenuItem
  //             className="cursor-pointer capitalize"
  //             onSelect={(evt) => evt.preventDefault()}
  //           >
  //             {t('btn_unbind_email')}
  //             <DropdownMenuShortcut>
  //               <Unlink2 className="size-4" />
  //             </DropdownMenuShortcut>
  //           </DropdownMenuItem>
  //         </UIDialogUnbindEmail>
  //       ) : (
  //         <UIDialogBindEmail>
  //           <DropdownMenuItem
  //             className="cursor-pointer capitalize"
  //             onSelect={(evt) => evt.preventDefault()}
  //           >
  //             {t('btn_bind_email')}
  //             <DropdownMenuShortcut>
  //               <Link2 className="size-4" />
  //             </DropdownMenuShortcut>
  //           </DropdownMenuItem>
  //         </UIDialogBindEmail>
  //       )}
  //       <DropdownMenuItem className="cursor-pointer capitalize" onClick={logout}>
  //         {t('btn_log_out')}
  //         <DropdownMenuShortcut>
  //           <LogOut className="size-4" />
  //         </DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // );
}
