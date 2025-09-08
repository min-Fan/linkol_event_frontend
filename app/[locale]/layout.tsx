import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

import { Toaster } from '@shadcn/components/ui/sonner';

import { CACHE_KEY } from '@constants/app';
import { routing } from '@libs/i18n/routing';
import { ENDPOINT_URL, IGetInfoByTokenResponseData } from '@libs/request';
import { AppProvider } from '@store/AppProvider';
import { ThemeProvider } from '@ui/theme/Provider';
import BprogressProvider from '@ui/bprogress/Provider';
import ReduxProvider from 'app/context/ReduxProvider';
import WagmiProviderContext from 'app/context/WagmiProviderContext';
import GlobalInitializer from 'app/components/GlobalInitializer';
import '@rainbow-me/rainbowkit/styles.css';
import 'app/assets/font/index.css';
import './globals.css';
import Script from 'next/script';

type Params = Promise<{ locale: string }>;

const getUserInfo = async (): Promise<IGetInfoByTokenResponseData | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(CACHE_KEY.TOKEN);

  if (!token) {
    return null;
  }

  try {
    const { value } = token;

    const resp = await fetch(process.env.NEXT_PUBLIC_API_URL + ENDPOINT_URL.GET_INFO_BY_TOKEN, {
      headers: {
        Authorization: `Bearer ${value}`,
      },
    });

    const res = await resp.json();

    if (res.code !== 200) {
      throw res.message;
    }

    return res.data;
  } catch (error) {
    return null;
  }
};

export default async function LocaleLayout(props: { children: ReactNode; params: Params }) {
  const { children, params } = props;
  const { locale } = await params;

  const userInfo = await getUserInfo();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script id="structured-data" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Linkol AI',
            url: 'https://www.linkol.fun',
            logo: 'https://www.linkol.fun/favicon.ico',
          })}
        </Script>
      </head>
      <body>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppProvider userInfo={userInfo}>
              <NextIntlClientProvider>
                <WagmiProviderContext>
                  <BprogressProvider>
                    <GlobalInitializer />
                    <main className="dark:bg-background flex min-h-screen w-full flex-col bg-[#F9F9F9]">
                      {children}
                    </main>
                    <Toaster position="bottom-right" />
                  </BprogressProvider>
                </WagmiProviderContext>
              </NextIntlClientProvider>
            </AppProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const isZh = locale;
  return {
    title: isZh == 'zh' ? 'LinKol AI' : 'LinKol AI',
    description: isZh == 'zh' ? 'LinKol AI' : 'LinKol AI',
    icons: {
      icon: 'https://www.linkol.fun/favicon.ico',
    },
    openGraph: {
      title: 'LinKol AI',
      description: 'https://www.linkol.fun',
      url: `https://www.linkol.fun/${isZh ? 'zh' : 'en'}`,
      images: [
        {
          url: 'https://www.linkol.fun/favicon.ico',
          width: 1200,
          height: 630,
          alt: 'LinKol AI',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'LinKol AI',
      description: 'https://x.com/linkol_ai',
      images: ['https://www.linkol.fun/favicon.ico'],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: isZh == 'zh' ? 'https://www.linkol.fun/zh' : 'https://www.linkol.fun/en',
      languages: {
        zh: 'https://www.linkol.fun/zh',
        en: 'https://www.linkol.fun/en',
      },
    },
  };
}
