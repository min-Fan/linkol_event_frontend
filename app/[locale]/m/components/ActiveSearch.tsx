'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Search } from 'lucide-react';
import { Input } from '@shadcn-ui/input';

export default function ActiveSearch(props: { onSearchAction: (search: string) => void }) {
  const { onSearchAction } = props;
  const t = useTranslations('common');

  const [search, setSearch] = useState<string>('');
  const deferredSearch = useDeferredValue(search);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    onSearchAction(deferredSearch);
  };

  return (
    <div className="border-border box-border flex h-10 w-full items-center gap-x-2 rounded-full border px-4 lg:max-w-96">
      <Search className="text-muted-foreground/40 size-5" onClick={handleSearch} />
      <Input
        className="placeholder:text-muted-foreground/40 text-foreground w-full flex-1 !border-none px-0 !text-base !ring-0 !outline-none"
        value={deferredSearch}
        placeholder={t('search_campaign_keyword')}
        onChange={handleChange}
        onBlur={handleSearch}
      />
    </div>
  );
}
