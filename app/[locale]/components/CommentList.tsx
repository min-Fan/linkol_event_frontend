import React, { useState } from 'react';
import { Comment, PredictionSide } from '../opinions/[opinion]/types';
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
}

type FilterType = 'ALL' | 'YES' | 'NO' | 'OTHERS';

const ITEMS_PER_PAGE = 5;

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  const filteredComments = comments.filter((comment) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'YES') return comment.side === PredictionSide.YES;
    if (activeFilter === 'NO') return comment.side === PredictionSide.NO;
    if (activeFilter === 'OTHERS') return !comment.side; // Undefined side = Others
    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentComments = filteredComments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Counts for tabs
  const allCount = comments.length;
  const yesCount = comments.filter((c) => c.side === PredictionSide.YES).length;
  const noCount = comments.filter((c) => c.side === PredictionSide.NO).length;
  const othersCount = comments.filter((c) => !c.side).length;

  if (comments.length === 0) {
    return (
      <div className="text-textSecondary p-8 text-center">
        No comments yet. Be the first to speak!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('ALL')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'ALL'
              ? 'bg-textPrimary text-background'
              : 'bg-surfaceHighlight text-textSecondary hover:text-textPrimary'
          }`}
        >
          All {allCount}
        </button>
        <button
          onClick={() => handleFilterChange('YES')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'YES'
              ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500'
              : 'bg-surfaceHighlight text-textSecondary hover:text-green-500'
          }`}
        >
          Yes {yesCount}
        </button>
        <button
          onClick={() => handleFilterChange('NO')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'NO'
              ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500'
              : 'bg-surfaceHighlight text-textSecondary hover:text-red-500'
          }`}
        >
          No {noCount}
        </button>
        <button
          onClick={() => handleFilterChange('OTHERS')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === 'OTHERS'
              ? 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500'
              : 'bg-surfaceHighlight text-textSecondary hover:text-blue-500'
          }`}
        >
          Others {othersCount}
        </button>
      </div>

      {/* List */}
      <div className="min-h-[300px] space-y-4">
        {currentComments.length > 0 ? (
          currentComments.map((comment) => (
            <div
              key={comment.id}
              className="border-theme bg-surface animate-in fade-in rounded-xl border p-4 duration-300"
            >
              <div className="flex gap-3">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="bg-surfaceHighlight border-theme h-10 w-10 rounded-full border object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-textPrimary text-sm font-bold">
                        {comment.user.name}
                      </span>
                      {comment.user.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                      )}
                      <span className="text-textSecondary ml-1 text-sm">{comment.user.handle}</span>
                      <span className="text-textSecondary mx-1 text-xs">·</span>
                      <span className="text-textSecondary text-xs">{comment.timestamp}</span>
                    </div>
                    {comment.side && (
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                          comment.side === PredictionSide.YES
                            ? 'border-green-500/30 bg-green-500/10 text-green-500'
                            : 'border-red-500/30 bg-red-500/10 text-red-500'
                        }`}
                      >
                        {comment.side}
                      </span>
                    )}
                  </div>

                  <p className="text-textPrimary/90 mt-2 text-sm leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="text-textSecondary mt-3 flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-pink-500">
                      <Heart className="h-4 w-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-green-500">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border-theme text-textSecondary flex h-40 items-center justify-center rounded-xl border border-dashed">
            No comments found in this category.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="border-theme flex items-center justify-center gap-4 border-t pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="hover:bg-surfaceHighlight text-textPrimary rounded-lg p-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-textSecondary text-sm font-medium">
            Page <span className="text-textPrimary">{currentPage}</span> of{' '}
            <span className="text-textPrimary">{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="hover:bg-surfaceHighlight text-textPrimary rounded-lg p-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
