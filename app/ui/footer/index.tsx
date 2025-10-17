import { LinkolDark, LinkolLight, TwitterX } from '@assets/svg';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import React from 'react';

export default function Footer() {
  return (
    <footer className="dark:bg-background relative z-[20] w-full bg-[#F9F9F9] backdrop-blur-sm">
      <section className="mx-auto flex max-w-[960px] flex-col items-start justify-between gap-4 px-2 py-10 sm:flex-row lg:max-w-[1100px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <LinkolLight className="!block !h-8 dark:!hidden" />
            <LinkolDark className="!hidden !h-8 dark:!block" />
          </div>
        </div>
        <div className="flex max-w-full gap-4">
          {/* <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">About</h2>
            <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
              <li>
                <Link href={PagesRoute.HOME} className="hover:text-foreground hover:underline">
                  Market Events
                </Link>
              </li>
              <li>
                <Link href={PagesRoute.MY_AGENT} className="hover:text-foreground hover:underline">
                  My Agent
                </Link>
              </li>
            </ul>
          </div> */}
          <TwitterX
            className="text-muted-foreground size-4 dark:text-white"
            onClick={() => window.open('https://x.com/linkolfun', '_blank')}
          />
        </div>
      </section>
    </footer>
  );
}
