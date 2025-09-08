import { LinkolDark, LinkolLight } from '@assets/svg';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import React from 'react';

export default function Footer() {
  return (
    <footer className="dark:bg-background relative z-[20] w-full bg-[#F9F9F9] backdrop-blur-sm">
      <section className="mx-auto flex max-w-[960px] flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row lg:max-w-[1600px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <LinkolLight className="!block !h-8 dark:!hidden" />
            <LinkolDark className="!hidden !h-8 dark:!block" />
          </div>
          <p className="text-muted-foreground max-w-xs text-base">
            Welcome to Linkol Join our dynamic network where professionals and businesses
            collaborate and thrive!
          </p>
        </div>
        <div className="flex max-w-full gap-4 sm:min-w-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">About</h2>
            <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
              {/* <li>
                <Link href={PagesRoute.PROJECT} className="hover:text-foreground hover:underline">
                  Looking for KOLs
                </Link>
              </li>
              <li>
                <Link href={PagesRoute.KOL} className="hover:text-foreground hover:underline">
                  Looking for Campaigns
                </Link>
              </li>
              <li>
                <Link href={PagesRoute.BRANDING} className="hover:text-foreground hover:underline">
                  Brand Value
                </Link>
              </li> */}
              <li>
                <Link
                  href={PagesRoute.MARKET_EVENTS}
                  className="hover:text-foreground hover:underline"
                >
                  Market Events
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </footer>
  );
}
