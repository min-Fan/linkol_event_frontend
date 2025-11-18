'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { Verified } from '@assets/svg';
import { Gift } from 'lucide-react';

interface OpinionCardData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  question: string;
  reply: {
    author: {
      name: string;
      handle: string;
      avatar: string;
      verified: boolean;
    };
    date: string;
    content: string;
  };
  poll: {
    yes: number;
    no: number;
  };
  volume: string;
}

// 模拟数据
const mockOpinions: OpinionCardData[] = [
  {
    id: '1',
    author: {
      name: 'Crypto Analyst',
      handle: '@crypto_analyst',
      avatar: '',
      verified: true,
    },
    question:
      "I'd like to ask — does this count as market manipulation? If I'm shorting right now, who's responsible if this causes a liquidation?",
    reply: {
      author: {
        name: 'CZ',
        handle: '@crypto_analyst',
        avatar: '',
        verified: true,
      },
      date: 'Jun 22',
      content: 'Full disclosure. I just bought some Aster today, using my own money, on @Binance.',
    },
    poll: {
      yes: 65,
      no: 35,
    },
    volume: '$34m',
  },
  {
    id: '2',
    author: {
      name: 'Crypto Analyst',
      handle: '@crypto_analyst',
      avatar: '',
      verified: true,
    },
    question:
      "I'd like to ask — does this count as market manipulation? If I'm shorting right now, who's responsible if this causes a liquidation?",
    reply: {
      author: {
        name: 'CZ',
        handle: '@crypto_analyst',
        avatar: '',
        verified: true,
      },
      date: 'Jun 22',
      content: 'Full disclosure. I just bought some Aster today, using my own money, on @Binance.',
    },
    poll: {
      yes: 65,
      no: 35,
    },
    volume: '$34m',
  },
  {
    id: '3',
    author: {
      name: 'Crypto Analyst',
      handle: '@crypto_analyst',
      avatar: '',
      verified: true,
    },
    question:
      "I'd like to ask — does this count as market manipulation? If I'm shorting right now, who's responsible if this causes a liquidation?",
    reply: {
      author: {
        name: 'CZ',
        handle: '@crypto_analyst',
        avatar: '',
        verified: true,
      },
      date: 'Jun 22',
      content: 'Full disclosure. I just bought some Aster today, using my own money, on @Binance.',
    },
    poll: {
      yes: 65,
      no: 35,
    },
    volume: '$34m',
  },
  {
    id: '4',
    author: {
      name: 'Crypto Analyst',
      handle: '@crypto_analyst',
      avatar: '',
      verified: true,
    },
    question:
      "I'd like to ask — does this count as market manipulation? If I'm shorting right now, who's responsible if this causes a liquidation?",
    reply: {
      author: {
        name: 'CZ',
        handle: '@crypto_analyst',
        avatar: '',
        verified: true,
      },
      date: 'Jun 22',
      content: 'Full disclosure. I just bought some Aster today, using my own money, on @Binance.',
    },
    poll: {
      yes: 65,
      no: 35,
    },
    volume: '$34m',
  },
];

function OpinionCard({ data }: { data: OpinionCardData }) {
  const t = useTranslations('common');
  const totalVotes = data.poll.yes + data.poll.no;
  const yesPercentage = totalVotes > 0 ? (data.poll.yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (data.poll.no / totalVotes) * 100 : 0;

  return (
    <Card className="border-border bg-card p-0 transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* Header: Author Info */}
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black dark:bg-gray-900">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 opacity-60 blur-sm"></div>
                <div className="relative h-6 w-6 rounded-full bg-gray-700 ring-1 ring-gray-500 dark:bg-gray-600 dark:ring-gray-400"></div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-base font-semibold">{data.author.name}</span>
                {data.author.verified && (
                  <Verified className="h-4 w-4 flex-shrink-0 text-blue-500" />
                )}
              </div>
              <div className="text-muted-foreground/60 text-md truncate">{data.author.handle}</div>
            </div>
          </div>
          <Gift className="h-5 w-5 flex-shrink-0 text-blue-500" />
        </div>

        {/* Question */}
        <div className="text-md text-muted-foreground/60 leading-relaxed">{data.question}</div>

        {/* Reply Section */}
        <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 shadow-sm"></div>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="truncate text-base font-semibold">{data.reply.author.name}</span>
                {data.reply.author.verified && (
                  <Verified className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                )}
                <span className="text-muted-foreground/60 text-md truncate">
                  {data.reply.author.handle}
                </span>
              </div>
              <span className="text-muted-foreground/60 text-md flex-shrink-0">
                {data.reply.date}
              </span>
            </div>
          </div>
          <div className="text-md text-muted-foreground/60 leading-relaxed">
            {data.reply.content}
          </div>
        </div>

        {/* Poll Results */}
        <div className="space-y-2">
          <div className="relative h-6 overflow-hidden rounded-2xl bg-foreground dark:bg-muted">
            {/* No 作为底部背景 */}
            <div className="absolute inset-0 flex items-center justify-end pr-4">
              <span className="text-xs font-medium text-white">No</span>
            </div>
            {/* Yes 作为绿色进度条覆盖在上面 */}
            <div
              className="absolute top-0 left-0 flex h-full items-center justify-start rounded-2xl bg-primary pl-4 transition-all"
              style={{ width: `${yesPercentage}%` }}
            >
              {yesPercentage > 15 && <span className="text-md font-medium text-white">Yes</span>}
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            {data.volume} {t('vol')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HotOpinions() {
  const t = useTranslations('common');

  return (
    <div className="bg-background box-border space-y-4 rounded-3xl p-4 backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">{t('hot_opinions')}</h2>
        <p className="text-primary text-base">{t('share_your_views_to_earn_usdt')}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mockOpinions.map((opinion) => (
          <OpinionCard key={opinion.id} data={opinion} />
        ))}
      </div>
    </div>
  );
}
