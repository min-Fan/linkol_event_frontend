'use client';
import Header from '@ui/header';
import Footer from '@ui/footer';
import { cn } from '@shadcn/lib/utils';

export default function MarketEventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div
        className={cn(
          'mx-auto box-border w-full max-w-[1100px] flex-1 p-0 px-2 pt-14 sm:px-0 sm:pt-24'
        )}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
