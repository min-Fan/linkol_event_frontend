'use client';
import React, { useState } from 'react';
import TopVoice from './TopVoice';
import PostToEarn from './PostToEarn';
import Activity from './Activity';
import Prospective from './Prospective';
import Comments from './Comments';

interface OpinionVotesProps {
  agreeVotes: number;
  disagreeVotes: number;
  agreePercentage: number;
  disagreePercentage: number;
  agreeAvatars?: string[];
  disagreeAvatars?: string[];
}

const tabs = ['Prospective', 'Top Voice', 'Post to Earn', 'Comments (48)', 'Activity'];

export default function OpinionVotes({
  agreeVotes,
  disagreeVotes,
  agreePercentage,
  disagreePercentage,
  agreeAvatars = [],
  disagreeAvatars = [],
}: OpinionVotesProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-3">
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
          <Prospective agreePercentage={agreePercentage} disagreePercentage={disagreePercentage} />
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
