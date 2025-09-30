'use client';
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TonProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl={
        process.env.NODE_ENV === 'development'
          ? 'https://test.linkol.fun/tonconnect-manifest.json'
          : 'https://app.linkol.fun/tonconnect-manifest.json'
      }
    >
      {children}
    </TonConnectUIProvider>
  );
}
