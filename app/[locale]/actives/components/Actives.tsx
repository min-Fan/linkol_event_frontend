'use client';

import React, { useState, useEffect } from 'react';

import CompActiveList from './ActiveList';
import { Button } from '@shadcn/components/ui/button';
import { Input } from '@shadcn/components/ui/input';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Verified } from '@assets/svg';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import { cn } from '@shadcn/lib/utils';
import { useTranslations } from 'next-intl';
import { Label } from '@shadcn/components/ui/label';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';

export default function TweetRecord() {
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>(''); // 用于输入框的值
  const [pageSize] = useState<number>(9);
  const [isVerify, setIsVerify] = useState<0 | 1>(0);
  const [total, setTotal] = useState<number>(0);
  const t = useTranslations('common');

  const onSearch = (searchValue: string) => {
    setSearch(searchValue);
    setSearchInput(searchValue); // 同步输入框的值
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
  };

  return (
    <div className="bg-background box-border space-y-4 rounded-3xl p-2 backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <Link href={PagesRoute.HOME}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <span className="hidden text-sm sm:block sm:text-base">Back</span>
          </Button>
        </Link>
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
        size={pageSize}
        is_verify={isVerify}
        onTotalChange={setTotal}
      />
    </div>
  );
}
