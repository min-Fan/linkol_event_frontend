'use client';
import Header from '@ui/header';
import Footer from '@ui/footer';
import { usePathname } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { cn } from '@shadcn/lib/utils';

export default function MarketEventsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomeScreen = pathname === PagesRoute.HOME;
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div
        className={cn(
          'mx-auto -mt-56 box-border flex w-full max-w-[1600px] flex-1 justify-center p-4',
          !isHomeScreen && 'mt-auto pt-14 sm:pt-16'
        )}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
