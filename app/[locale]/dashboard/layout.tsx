import { ReactNode } from 'react';

import UISidebar from '@ui/sidebar';
import PaginationProvider from '@ui/pagination/Provider';
import CompCheckLoginStatus from './components/CheckLoginStatus';

export default async function LocaleLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <PaginationProvider>
      <section className="bg-sidebar flex h-dvh w-full">
        <CompCheckLoginStatus>
          <aside>
            <UISidebar />
          </aside>
          <article className="box-border h-full w-full min-w-0 flex-1 p-4">{children}</article>
        </CompCheckLoginStatus>
      </section>
    </PaginationProvider>
  );
}
