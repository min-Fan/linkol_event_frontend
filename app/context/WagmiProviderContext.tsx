'use client';

import {
  getDefaultConfig,
  lightTheme,
  Locale,
  midnightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from '../constants/chains';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
const config = getDefaultConfig({
  appName: 'AgentChain app',
  projectId: '575083f997538bbe36e101019959af2e',
  chains: SUPPORTED_CHAINS as any,
  ssr: false,
});

const queryClient = new QueryClient();

export default function WagmiProviderContext({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const locale = useLocale();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          locale={locale as Locale}
          initialChain={DEFAULT_CHAIN}
          showRecentTransactions={true}
          theme={theme === 'dark' ? midnightTheme() : lightTheme()}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
