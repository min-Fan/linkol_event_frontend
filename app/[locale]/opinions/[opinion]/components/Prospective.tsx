'use client';
import React, { useState } from 'react';
import DefaultAvatarImg from '@assets/image/avatar.png';
import OpinionActions from './OpinionActions';
import { ChevronDown } from 'lucide-react';
import { cn } from '@shadcn/lib/utils';

interface ProspectiveProps {
  agreePercentage: number;
  disagreePercentage: number;
}
export default function Prospective({ agreePercentage, disagreePercentage }: ProspectiveProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 生成模拟头像
  const generateMockAvatars = (count: number) => {
    return Array.from({ length: Math.min(count, 8) }, (_, i) => ({
      id: i,
      color: `hsl(${(i * 360) / count}, 70%, 60%)`,
    }));
  };

  const mockAgreeAvatars = generateMockAvatars(8);
  const mockDisagreeAvatars = generateMockAvatars(8);

  const handleAddPerspective = () => {
    console.log('Add perspective clicked');
  };

  const handleLetAgentComment = () => {
    console.log('Let agent comment clicked');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Agree Section */}
      <div className="border-border rounded-xl border p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              <span className="rounded-sm bg-green-500 px-1 text-sm font-semibold whitespace-nowrap">
                48 KOLs
              </span>
              <span className="text-foreground text-sm font-medium">agree with @CZ</span>
            </div>
            <div className="flex -space-x-3">
              {mockAgreeAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="border-background h-6 w-6 rounded-full border-1 sm:h-8 sm:w-8"
                  style={{ backgroundColor: avatar.color }}
                >
                  <img
                    src={DefaultAvatarImg.src}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DefaultAvatarImg.src;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-base text-green-600">YES</span>
            <span className="text-right text-base text-green-600">{agreePercentage}% • 89 pts</span>
          </div>
        </div>
      </div>

      {/* Disagree Section */}
      <div className="border-border rounded-lg border p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              <span className="rounded-sm bg-red-500 px-1 text-sm font-semibold whitespace-nowrap">
                192 KOLs
              </span>
              <span className="text-foreground text-sm font-medium">disagree with @CZ</span>
            </div>
            <div className="flex -space-x-2">
              {mockDisagreeAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="border-background h-6 w-6 rounded-full border-1 sm:h-8 sm:w-8"
                  style={{ backgroundColor: avatar.color }}
                >
                  <img
                    src={DefaultAvatarImg.src}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DefaultAvatarImg.src;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-base text-red-600">No</span>
            <span className="text-right text-base text-red-600">
              {disagreePercentage}% • 93 pts
            </span>
          </div>
        </div>
      </div>

      {/* 可展开内容区域 */}
      <div className='flex flex-col gap-2'>
        <h2 className="text-foreground text-base font-medium">Rules</h2>
        <span className="line-clamp-1 truncate text-sm">
          The interest rates are defined in this market by the upper bound of the target funds
          range. The decision on ...
        </span>
        <div className="border-border overflow-hidden rounded-xl border">
          {/* 展开/折叠按钮 */}
          <button
            onClick={toggleExpand}
            className="hover:bg-accent/50 flex w-full items-center justify-between p-4 transition-colors"
          >
            <span className="text-foreground text-sm font-medium">
              {isExpanded ? 'Show less' : 'Show more'}
            </span>
            <ChevronDown
              className={cn(
                'text-foreground h-4 w-4 transition-transform duration-300 ease-in-out',
                isExpanded && 'rotate-180'
              )}
            />
          </button>

          {/* 可展开内容 - 使用grid实现平滑滑动 */}
          <div
            className={cn(
              'grid transition-all duration-300 ease-in-out',
              isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden">
              <div className="border-t-border border-t p-4">
                {/* 这里可以添加更多内容 */}
                <div className="space-y-3">
                  <div className="text-foreground text-sm">
                    <p className="mb-2 font-medium">Additional Information</p>
                    <p className="text-muted-foreground text-xs">
                      This section contains more details about the opinions and perspectives shared
                      by KOLs.
                    </p>
                  </div>
                  {/* 可以添加更多内容，比如更多KOL列表、详细统计等 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <OpinionActions
        onAddPerspective={handleAddPerspective}
        onLetAgentComment={handleLetAgentComment}
      />
    </div>
  );
}
