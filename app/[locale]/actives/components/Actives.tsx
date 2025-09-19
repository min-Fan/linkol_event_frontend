'use client';

import React, { useState, useEffect } from 'react';

import CompActiveList from './ActiveList';
import { Button } from '@shadcn/components/ui/button';
import { Input } from '@shadcn/components/ui/input';
import { ArrowRight, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { Verified } from '@assets/svg';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import { cn } from '@shadcn/lib/utils';
import { useTranslations } from 'next-intl';
import { Label } from '@shadcn/components/ui/label';

export default function TweetRecord() {
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>(''); // 用于输入框的值
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [isVerify, setIsVerify] = useState<0 | 1>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const t = useTranslations('common');

  const onSearch = (searchValue: string) => {
    setSearch(searchValue);
    setSearchInput(searchValue); // 同步输入框的值
    setPage(1); // 搜索时重置到第一页
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 处理搜索框失焦时搜索
  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value !== search) {
      onSearch(value);
    }
  };

  // 处理回车键搜索
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      onSearch(value);
      // 失焦以触发blur事件
      e.currentTarget.blur();
    }
  };

  // 处理输入框变化（不触发搜索）
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 同步搜索状态到输入框
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // 清空搜索输入框
  const handleClearSearch = () => {
    setSearchInput('');
    onSearch(''); // 清空搜索并重新搜索
    setPage(1);
  };

  // 分页组件
  const Pagination = () => {
    const canPrev = page > 1;
    const canNext = page < totalPages;

    const getVisiblePages = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5; // 最多显示5个页码

      if (totalPages <= maxVisible) {
        // 如果总页数小于等于最大显示数，显示所有页码
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 否则需要智能显示
        if (page <= 3) {
          // 当前页在前面，显示 1,2,3,4,...,last
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (page >= totalPages - 2) {
          // 当前页在后面，显示 1,...,last-3,last-2,last-1,last
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          // 当前页在中间，显示 1,...,current-1,current,current+1,...,last
          pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
        }
      }

      return pages;
    };

    const visiblePages = getVisiblePages();

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 py-4">
        {/* 上一页按钮 */}
        <button
          onClick={() => canPrev && handlePageChange(page - 1)}
          disabled={!canPrev}
          className={cn(
            'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
            canPrev ? 'text-muted-foreground' : 'cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* 页码按钮 */}
        {visiblePages.map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm">
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(pageNum as number)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-all',
                  pageNum === page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 hover:text-muted-foreground'
                )}
              >
                {pageNum}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 下一页按钮 */}
        <button
          onClick={() => canNext && handlePageChange(page + 1)}
          disabled={!canNext}
          className={cn(
            'bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-sm backdrop-blur-sm transition-all',
            canNext ? 'text-muted-foreground' : 'cursor-not-allowed'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-background box-border space-y-4 rounded-3xl p-4 backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        {/* 搜索输入框 */}
        <div className="relative ml-auto">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t('search_active_keyword')}
            value={searchInput}
            onChange={handleSearchInputChange}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
            className={cn(
              'sm:text-md hover:border-primary rounded-full pl-8 text-sm',
              searchInput && 'pr-8'
            )}
          />
          {/* 清空按钮 */}
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="text-muted-foreground/80 hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 验证按钮 */}
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Label>
            <Checkbox
              id="verify"
              checked={isVerify === 1}
              onCheckedChange={(checked) => setIsVerify(checked ? 1 : 0)}
            />
            <Verified className="size-4" />
            <span className={cn('sm:text-md text-sm', isVerify === 1 && 'text-primary')}>
              {t('verified')}
            </span>
          </Label>
        </Button>
      </div>

      <CompActiveList
        search={search}
        page={page}
        size={pageSize}
        is_verify={isVerify}
        onTotalChange={setTotal}
        onTotalPagesChange={setTotalPages}
      />

      {/* 分页组件 */}
      <Pagination />
    </div>
  );
}
