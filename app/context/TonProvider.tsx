'use client';
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TonProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl={
        process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
        'https://app.linkol.fun/tonconnect-manifest.json'
      }
    >
      {children}
    </TonConnectUIProvider>
  );
}
