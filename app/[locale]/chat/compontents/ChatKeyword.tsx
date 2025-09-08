import React from 'react';
import ChatKeyKols from './keyword/ChatKeyKols';
import ChatKeyKolAnalysis from './keyword/ChatKeyKolAnalysis';
import ChatKeyKolsComparison from './keyword/ChatKeyKolsComparison';
export default function ChatKeyword() {
  return (
    <div className="shadow-background dark:shadow-card overflow-x-auto">
      <div className="mb-2.5 flex min-w-max gap-2.5 text-sm text-[#999]">
        <ChatKeyKols />
        <ChatKeyKolAnalysis />
        <ChatKeyKolsComparison />
      </div>
    </div>
  );
}
