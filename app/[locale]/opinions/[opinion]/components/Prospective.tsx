'use client';
import React from 'react';
import DefaultAvatarImg from '@assets/image/avatar.png';
import OpinionActions from './OpinionActions';

interface ProspectiveProps {
  agreePercentage: number;
  disagreePercentage: number;
}
export default function Prospective({ agreePercentage, disagreePercentage }: ProspectiveProps) {
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

  return (
    <div className="space-y-4">
      {/* Agree Section */}
      <div className="border-border rounded-xl border p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              <span className="rounded-sm bg-green-500 px-1 text-sm font-semibold whitespace-nowrap">48 KOLs</span>
              <span className="text-foreground text-sm font-medium">agree with @CZ</span>
            </div>
            <div className="flex -space-x-3">
              {mockAgreeAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="border-background sm:h-8 sm:w-8 h-6 w-6 rounded-full border-1"
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
            <span className="text-base text-green-600 text-right">{agreePercentage}% • 89 pts</span>
          </div>
        </div>
      </div>

      {/* Disagree Section */}
      <div className="border-border rounded-lg border p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              <span className="rounded-sm bg-red-500 px-1 text-sm font-semibold whitespace-nowrap">192 KOLs</span>
              <span className="text-foreground text-sm font-medium">disagree with @CZ</span>
            </div>
            <div className="flex -space-x-2">
              {mockDisagreeAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="border-background sm:h-8 sm:w-8 h-6 w-6 rounded-full border-1"
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
            <span className="text-base text-red-600 text-right">{disagreePercentage}% • 93 pts</span>
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
