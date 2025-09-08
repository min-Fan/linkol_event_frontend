import { Image } from 'lucide-react';
import React from 'react';

export default function TipsMsg() {
  const messages = [
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
    'Binance just submitted a $2,000 order! ',
  ];

  return (
    <div className="relative w-full overflow-hidden py-2">
      <div className="absolute top-0 left-0 z-10 h-full w-10 bg-gradient-to-r from-white to-transparent"></div>
      <div className="absolute top-0 right-0 z-10 h-full w-10 bg-gradient-to-l from-white to-transparent"></div>
      <div className="animate-scroll flex items-center gap-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          {messages.map((msg, index) => (
            <div key={index} className="flex items-center gap-1">
              <Image className="text-muted-foreground size-4" />
              <span className="inline-block text-gray-700">{msg}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {messages.map((msg, index) => (
            <span key={`copy-${index}`} className="inline-block text-gray-700">
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
