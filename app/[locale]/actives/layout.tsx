'use client';
import Header from '@ui/header';
import Footer from '@ui/footer';
import { cn } from '@shadcn/lib/utils';

export default function MarketEventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div className={cn('mx-auto box-border flex-1 w-full max-w-[1100px] p-0 px-2 pt-14 sm:pt-16 sm:px-0')}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
