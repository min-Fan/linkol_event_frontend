'use client';
import React, { useState } from 'react';
import TopVoice from './TopVoice';
import PostToEarn from './PostToEarn';
import Activity from './Activity';
import Prospective from './Prospective';
import Comments from './Comments';
import BrandVoiceComparison from './BrandVoiceComparison';

interface OpinionVotesProps {
  agreeVotes: number;
  disagreeVotes: number;
  agreePercentage: number;
  disagreePercentage: number;
  agreeAvatars?: string[];
  disagreeAvatars?: string[];
  prospectiveData?: any;
  issueScreenName?: string;
}

const tabs = ['Prospective', 'Top Voice', 'Post to Earn', 'Comments (48)', 'Activity'];

export default function OpinionVotes({
  agreeVotes,
  disagreeVotes,
  agreePercentage,
  disagreePercentage,
  agreeAvatars = [],
  disagreeAvatars = [],
  prospectiveData,
  issueScreenName,
}: OpinionVotesProps) {
  const [activeTab, setActiveTab] = useState(0);

  // 计算品牌价值（从 prospective 数据中获取，如果没有则使用详情数据）
  const yesVoice = prospectiveData?.[0]?.yes?.total_brand_value || agreeVotes;
  const noVoice = prospectiveData?.[0]?.no?.total_brand_value || disagreeVotes;
  const yesCount = prospectiveData?.[0]?.yes?.number || 0;
  const noCount = prospectiveData?.[0]?.no?.number || 0;

  return (
    <div className="space-y-3">
      {/* Brand Voice Comparison - 始终显示 */}
      <BrandVoiceComparison
        yesVoice={yesVoice}
        noVoice={noVoice}
        yesCount={yesCount}
        noCount={noCount}
      />

      {/* 标签页 */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === index
                ? 'border-primary text-foreground border-b-2'
                : 'text-muted-foreground/60 hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <>
          <Prospective data={prospectiveData} issueScreenName={issueScreenName} />
        </>
      )}

      {activeTab === 1 && (
        <>
          <TopVoice />
        </>
      )}

      {activeTab === 2 && (
        <>
          <PostToEarn />
        </>
      )}

      {activeTab === 3 && (
        <>
          <Comments />
        </>
      )}

      {activeTab === 4 && (
        <>
          <Activity />
        </>
      )}
    </div>
  );
}
