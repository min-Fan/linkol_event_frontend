'use client';

import { useState } from 'react';

import CompActiveTypeTab, { ACTIVE_TYPE } from './ActiveTypeTab';
import CompActiveSearch from './ActiveSearch';
import CompActiveList from './ActiveList';
import { Button } from '@shadcn/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { track } from '@vercel/analytics';

export default function TweetRecord() {
  const [type, setType] = useState<ACTIVE_TYPE>(ACTIVE_TYPE.ALL);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const onChangeType = (type: ACTIVE_TYPE) => {
    setType(type);
  };

  const onSearch = (search: string) => {
    setSearch(search);
  };

  return (
    <div className="bg-background box-border space-y-4 rounded-3xl p-4 backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between">
        <CompActiveTypeTab defaultType={type} onChangeAction={onChangeType} />
        {/* <CompActiveSearch onSearchAction={onSearch} /> */}
        <Link
          href={PagesRoute.ACTIVES}
          onClick={() => {
            track('Explore Button ==> ActivesList Page');
          }}
        >
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <span className="text-sm sm:text-base">Explore</span>
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
      <CompActiveList search={search} type={type} page={page} />
    </div>
  );
}
