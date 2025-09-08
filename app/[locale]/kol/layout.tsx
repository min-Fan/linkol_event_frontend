import { ReactNode } from 'react';

import Header from '@ui/header';
import Footer from '@ui/footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
