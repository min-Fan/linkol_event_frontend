import { Logo, Linkol } from '@assets/svg';
import UIProfile from '@ui/profile';
import Faucet from './Faucet';
import Nav from './Nav';
import { MenuSize } from '@ui/profile/components/LogOutMenu';
import { useRouter } from '@libs/i18n/navigation';
export default function Header() {
  const router = useRouter();
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 box-border w-full border-b backdrop-blur-sm">
      <section className="mx-auto box-border flex h-12 max-w-[1600px] items-center justify-between gap-x-8 px-10 sm:h-16">
        <div
          className="flex items-center gap-x-2 sm:gap-x-4"
          onClick={() => {
            router.push('/');
          }}
        >
          <Logo className="size-4" />
          <Linkol className="h-4 w-14" />
        </div>
        <Nav />
        <div className="w-auto">
          <div className="hidden sm:block">
            <UIProfile size={MenuSize.DEFAULT} />
          </div>
          <div className="block sm:hidden">
            <UIProfile size={MenuSize.ICON} />
          </div>
        </div>
      </section>
    </header>
  );
}
