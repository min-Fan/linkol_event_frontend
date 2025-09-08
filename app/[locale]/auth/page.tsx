import { Logo, Slogan } from '@assets/svg';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import UITheme from '@ui/theme';
import UILanguage from '@ui/language';
import CompContent from './components/Content';

export default function PageAuth() {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={PagesRoute.HOME}>
            <div className="flex h-9 items-center space-x-2">
              <Logo className="size-8" />
              <h1 className="text-primary text-2xl font-bold capitalize">Linkol</h1>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <CompContent />
          </div>
        </div>
      </div>
      <div className="bg-sidebar relative hidden items-center justify-center lg:flex">
        <div className="relative flex flex-col items-center p-10">
          <Slogan className="absolute top-0 left-1/2 size-48 -translate-x-1/2 -translate-y-3/4" />
          <dl className="space-y-2 text-center">
            <dt className="text-primary text-3xl font-bold capitalize">
              Launch on-chain. Backed by KOLs.
            </dt>
            <dd className="text-muted-foreground text-lg">
              AI, digital identity, and blockchain — seamlessly combined for your next-gen Web3
              journey.
            </dd>
          </dl>
        </div>
      </div>
      <div className="absolute top-6 right-6 flex gap-2">
        <UILanguage />
        <UITheme />
      </div>
    </div>
  );
}
