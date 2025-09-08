'use client';

import Header from '@ui/header';
import TableView from './components/BrandValueRanking';
import LinkolCampaigns from './components/LinkolCampaigns';
import { MarketEvents } from './components/MarketEvents';
import Sentiment from './components/Sentiment';
import Footer from '@ui/footer';

export default function BrandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div className="mx-auto box-border flex h-full w-full max-w-7xl flex-1 flex-col space-y-5 p-4 sm:px-10 sm:py-8">
        <LinkolCampaigns />
        <MarketEvents />
        <Sentiment />
        <TableView />
      </div>
      <Footer />
    </div>
  );
}
