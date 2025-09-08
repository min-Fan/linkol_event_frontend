import Header from '@ui/header';
import Footer from '@ui/footer';

export default function MarketEventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div className="mx-auto box-border flex w-full max-w-[1600px] flex-1 justify-center p-4">
        {children}
      </div>
      <Footer />
    </div>
  );
}
