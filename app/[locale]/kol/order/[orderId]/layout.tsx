import { OrderPreviewProvider } from 'app/context/OrderPreviewContext';
import React from 'react';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <OrderPreviewProvider>{children}</OrderPreviewProvider>;
}
