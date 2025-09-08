import { LadingPageLogo, Linkol, Logo } from '@assets/svg';
import PagesRoute from '@constants/routes';
import useUserInfo from '@hooks/useUserInfo';
import { Link } from '@libs/i18n/navigation';
import { Button } from '@shadcn/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import UITheme from '@ui/theme';
import LogOutMenu from '@ui/profile/components/LogOutMenu';
import LogInMenu from '@ui/profile/components/LogInMenu';
import UILanguage from '@ui/language';
export default function LadingHeader() {
  const { isPending, isConnected, isLogin, connect, login } = useUserInfo();
  const t = useTranslations('common');
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast.error(t('login_failed'));
    }
  };
  const handleConnect = () => {
    connect();
  };
  return (
    <div className="border-border bg-background/80 box-border flex h-16 w-full flex-row items-center justify-between border-b px-4 py-2 backdrop-blur-sm sm:px-10 sm:py-3">
      <div className="flex items-center gap-x-11">
        <div className="flex items-center gap-x-4">
          <Logo className="size-4" />
          <Linkol className="h-4 w-14" />
        </div>
        {/* <div className="hidden md:block">
          <div className="text-md flex items-center gap-x-9 font-medium">
            <Link href={PagesRoute.HOME}>
              <Button variant="ghost">{t('nav_project_client')}</Button>
            </Link>
            <Link href={PagesRoute.KOL}>
              <Button variant="ghost">{t('nav_kol_client')}</Button>
            </Link>
          </div>
        </div> */}
      </div>
      <div className="flex items-center gap-x-2">
        <UILanguage />
        <UITheme />
      </div>
    </div>
  );
}
