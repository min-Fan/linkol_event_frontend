'use client';
import React from 'react';
import OpinionDetailHeader from './components/OpinionDetailHeader';
import OpinionContent from './components/OpinionContent';
import OpinionChart from './components/OpinionChart';
import OpinionVotes from './components/OpinionVotes';
import OpinionActions from './components/OpinionActions';
// import TradingPanel from './components/TradingPanel';

// 模拟数据 - 实际应从 API 获取
const mockData = {
  author: {
    name: 'Crypto Analyst',
    handle: '@crypto_analyst',
    verified: true,
  },
  volume: '$33,871,763',
  question:
    "I'd like to ask — does this count as market manipulation? If I'm shorting right now, who's responsible if this causes a liquidation?",
  reply: {
    author: {
      name: 'CZ',
      handle: '@crypto_analyst',
      verified: true,
    },
    date: 'Jun 22',
    content: 'Full disclosure. I just bought some Aster today, using my own money, on @Binance.',
  },
  votes: {
    agree: 20,
    disagree: 80,
  },
  trading: {
    dateRange: 'October 31-November 3',
    yesPrice: 0.5,
    noPrice: 99.5,
  },
};

export default function OpinionsPage() {
  const handleAddPerspective = () => {
    console.log('Add perspective clicked');
  };

  const handleLetAgentComment = () => {
    console.log('Let agent comment clicked');
  };

  return (
    <div className="mx-auto h-full w-full max-w-7xl p-4 sm:px-10 sm:py-6">
      <div className="bg-background border-border grid grid-cols-1 gap-6 rounded-2xl border p-4 sm:rounded-3xl sm:p-8 lg:grid-cols-3">
        {/* 左侧内容区 - 占据 2/3 宽度 */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6">
            {/* 头部信息 */}
            <OpinionDetailHeader author={mockData.author} volume={mockData.volume} />

            {/* 内容区 */}
            <OpinionContent question={mockData.question} reply={mockData.reply} />

            {/* 图表 */}
            <OpinionChart />

            {/* 投票结果 */}
            <OpinionVotes
              agreeVotes={mockData.votes.agree}
              disagreeVotes={mockData.votes.disagree}
              agreePercentage={mockData.votes.agree}
              disagreePercentage={mockData.votes.disagree}
            />

            {/* 操作按钮 */}
            <OpinionActions
              onAddPerspective={handleAddPerspective}
              onLetAgentComment={handleLetAgentComment}
            />
          </div>
        </div>

        {/* 右侧交易面板 - 占据 1/3 宽度 */}
        <div className="lg:col-span-1">
          <h1>Trading Card</h1>
          {/* <TradingPanel
            dateRange={mockData.trading.dateRange}
            yesPrice={mockData.trading.yesPrice}
            noPrice={mockData.trading.noPrice}
          /> */}
        </div>
      </div>
    </div>
  );
}
