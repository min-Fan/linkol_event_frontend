'use client';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@shadcn-ui/card';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { Skeleton } from '@shadcn-ui/skeleton';

import CompFilterItem from './FilterItem';
import { useEffect, useState } from 'react';
import { Tags } from '@store/reducers/types';
import { updateConfig, updateFilter, clearFilter } from '@store/reducers/userSlice';
import { getTags } from '@libs/request';
import { Input } from '@shadcn/components/ui/input';
import {
  RefreshCcw,
  DollarSign,
  Search,
  X,
  ChevronDown,
  CircleHelp,
  Paintbrush,
} from 'lucide-react';
import { cn } from '@shadcn/lib/utils';
import { Chains, Categories, Topic, Languages, Verified, Filters } from '@assets/svg';
import { Button } from '@shadcn-ui/button';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn/components/ui/tooltip';

export default function Filter() {
  const t = useTranslations('common');
  const chains = useAppSelector((state) => state.userReducer?.config.tags.chains);
  const categories = useAppSelector((state) => state.userReducer?.config.tags.categories);
  const topic = useAppSelector((state) => state.userReducer?.config.tags.topic);
  const languages = useAppSelector((state) => state.userReducer?.config.tags.languages);
  const filter = useAppSelector((state) => state.userReducer?.filter);

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [minPrice, setMinPrice] = useState(filter?.min_price || '');
  const [maxPrice, setMaxPrice] = useState(filter?.max_price || '');
  const [kw, setKw] = useState(filter?.kw || '');

  const [filterHidden, setfilterHidden] = useState(true); //默认隐藏

  // 获取标签名称的辅助函数
  const getTagName = (id: number) => {
    const allTags = [chains, categories, topic].filter(Boolean);
    for (const tag of allTags) {
      const found = tag?.children.find((child) => child.id === id);
      if (found) return found.name;
    }
    return '';
  };

  // 处理标签删除
  const handleRemoveTag = (id: number) => {
    const newTags = filter?.tags.filter((tagId) => tagId !== id) || [];
    dispatch(updateFilter({ key: 'tags', value: newTags }));
  };

  // 处理语言删除
  const handleRemoveLanguage = (lang: string) => {
    const newLanguages = filter?.language.filter((l) => l !== lang) || [];
    dispatch(updateFilter({ key: 'language', value: newLanguages }));
  };

  // 检查是否有任何一个分类有值
  const hasAnyData = chains || categories || topic || languages;

  const getTag = async () => {
    // 如果已经有数据，不显示加载状态
    if (!hasAnyData) {
      setIsLoading(true);
    }

    try {
      const res: any = await getTags();
      setIsLoading(false);
      if (res.code === 200 && res.data) {
        const { tags, language } = res.data;
        const tagsData: Tags = {
          categories: tags.find((item) => item.name === 'Categories'),
          chains: tags.find((item) => item.name === 'Chains'),
          topic: tags.find((item) => item.name === 'Topic'),
          languages: language,
        };
        // tagsData.categories?.children.unshift({
        //   id: 101,
        //   name: 'Verified',
        //   kol_count: 0,
        //   icon: <Verified className="size-4" />,
        //   children: [],
        //   level: 2,
        //   parent: 100,
        // });
        dispatch(updateConfig({ key: 'tags', value: tagsData }));
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // dispatch(clearFilter());
    getTag();
  }, []);

  // 只有在完全没有数据且正在加载时才显示骨架屏
  if (isLoading && !hasAnyData) {
    return <FilterSkeleton />;
  }

  const handleMinMax = (min: number, max: number) => {
    setMinPrice(min.toString());
    setMaxPrice(max.toString());
    dispatch(updateFilter({ key: 'min_price', value: min.toString() }));
    dispatch(updateFilter({ key: 'max_price', value: max.toString() }));
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    dispatch(clearFilter());
    setMinPrice('');
    setMaxPrice('');
    setKw('');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <>
      <Card className="relative hidden rounded-3xl p-2 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] sm:block dark:shadow-[0px_4px_6px_0px_rgba(255,255,255,0.05)]">
        {/* <div className="absolute top-2 right-2" onClick={() => handleRefresh()}>
        <RefreshCcw
          className={cn(
            'text-muted-foreground hover:text-primary h-4 w-4 cursor-pointer',
            isRefreshing && 'animate-spin',
          )}
        />
      </div> */}
        <CardContent className="p-2">
          <div className="capitalize">
            <div className="flex items-center justify-between">
              <div
                className="border-border hover:ring-primary box-border flex cursor-pointer items-center gap-1 rounded-[12px] border px-3 py-1.5 ring"
                onClick={() => setfilterHidden(!filterHidden)}
              >
                <Filters className="size-4"></Filters>
                <span className="font-medium">{t('Filters')}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="mr-auto flex flex-wrap items-center gap-2 p-2">
                  {[
                    ...(filter?.tags || []).map((id) => ({
                      type: 'tag' as const,
                      value: id,
                      name: getTagName(id),
                    })),
                    ...(filter?.language || []).map((lang) => ({
                      type: 'language' as const,
                      value: lang,
                      name: lang,
                    })),
                  ].map((item) => (
                    <div
                      key={`${item.type}-${item.value}`}
                      className="bg-accent hover:bg-accent/80 flex items-center gap-2 rounded-md px-1 py-1"
                    >
                      <span className="text-foreground text-sm">{item.name}</span>
                      <X
                        className="text-muted-foreground hover:text-foreground size-3 cursor-pointer"
                        onClick={() =>
                          item.type === 'tag'
                            ? handleRemoveTag(item.value as number)
                            : handleRemoveLanguage(item.value as string)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <Search
                      className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2 cursor-pointer"
                      onClick={() => dispatch(updateFilter({ key: 'kw', value: kw }))}
                    />
                    <Input
                      placeholder={t('btn_search')}
                      value={kw}
                      onChange={(e) => setKw(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          dispatch(updateFilter({ key: 'kw', value: kw }));
                        }
                      }}
                      className="w-60 rounded-full px-8"
                    />
                    {kw && (
                      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0"
                          onClick={() => {
                            setKw('');
                            dispatch(updateFilter({ key: 'kw', value: '' }));
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </Button>
                        {/* <Search
                    className="text-muted-foreground size-4 cursor-pointer"
                    onClick={() => dispatch(updateFilter({key: 'kw', value: kw}))}
                  /> */}
                      </div>
                    )}
                  </div>
                </div>
                <Paintbrush
                  onClick={() => handleRefresh()}
                  className={cn(
                    'text-muted-foreground hover:text-primary h-4 w-4 cursor-pointer',
                    isRefreshing && 'animate-pulse'
                  )}
                />
              </div>
            </div>

            <table className={filterHidden ? 'hidden' : ''}>
              <tbody>
                {chains && (
                  <tr>
                    <td className="text-muted-foreground text-md flex items-center gap-2 px-2 py-3 align-top font-semibold whitespace-nowrap">
                      <Chains className="size-4" />
                      {t('chains')}:
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {chains.children.map((item) => (
                          <CompFilterItem
                            key={item.id}
                            label={item.name}
                            value={item.id.toString()}
                            name="chains"
                            count={item.kol_count}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {categories && (
                  <tr>
                    <td className="text-muted-foreground text-md flex items-center gap-2 px-2 py-3 align-top font-semibold whitespace-nowrap">
                      <Categories className="size-4" />
                      {t('categories')}:
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {categories.children.map((item) => (
                          <CompFilterItem
                            key={item.id}
                            label={item.name}
                            value={item.id.toString()}
                            icon={item.icon}
                            name="categories"
                            count={item.kol_count}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {topic && (
                  <tr>
                    <td className="text-muted-foreground text-md flex items-center gap-2 px-2 py-3 align-top font-semibold whitespace-nowrap">
                      <Topic className="size-4" />
                      {t('topic')}:
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {topic.children.map((item) => (
                          <CompFilterItem
                            key={item.id}
                            label={item.name}
                            value={item.id.toString()}
                            name="topic"
                            count={item.kol_count}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {languages && (
                  <tr>
                    <td className="text-muted-foreground text-md flex items-center gap-2 px-2 py-3 align-top font-semibold whitespace-nowrap">
                      <Languages className="size-4" />
                      {t('languages')}:
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {languages.map((item) => (
                          <CompFilterItem
                            key={item.name}
                            label={item.name}
                            value={item.name}
                            name="language"
                            count={item.kol_count}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {/* <tr>
                <td className="text-muted-foreground text-md flex h-full items-center gap-2 p-2 align-top font-semibold whitespace-nowrap">
                  <DollarSign className="size-4" />
                  {t('price')}($):
                </td>
                <td className="px-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <span
                      className="hover:text-primary text-muted-foreground text-md cursor-pointer font-semibold"
                      onClick={() => handleMinMax(0, 1)}
                    >
                      0-1
                    </span>
                    <span
                      className="hover:text-primary text-muted-foreground text-md cursor-pointer font-semibold"
                      onClick={() => handleMinMax(1, 10)}
                    >
                      1-10
                    </span>
                    <span
                      className="hover:text-primary text-muted-foreground text-md cursor-pointer font-semibold"
                      onClick={() => handleMinMax(10, 50)}
                    >
                      10-50
                    </span>
                    <span
                      className="hover:text-primary text-muted-foreground text-md cursor-pointer font-semibold"
                      onClick={() => handleMinMax(50, 100)}
                    >
                      50-100
                    </span>
                    <span
                      className="hover:text-primary text-muted-foreground text-md cursor-pointer font-semibold"
                      onClick={() => handleMinMax(100, 500)}
                    >
                      100-500
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        value={minPrice}
                        onChange={e => {
                          // 输入阶段只更新值，不做检查
                          setMinPrice(e.target.value);
                        }}
                        onBlur={e => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 0) {
                            setMinPrice(value.toString());
                            // 如果最大值小于新的最小值，更新最大值
                            if (maxPrice !== '' && parseInt(maxPrice, 10) < value) {
                              setMaxPrice(value.toString());
                              // 更新 Store 中的最大值
                              dispatch(updateFilter({key: 'max_price', value: value.toString()}));
                            }
                            // 更新 Store 中的最小值
                            dispatch(updateFilter({key: 'min_price', value: value.toString()}));
                          } else if (e.target.value === '') {
                            setMinPrice('');
                            // 清空 Store 中的最小值
                            dispatch(updateFilter({key: 'min_price', value: ''}));
                          } else {
                            // 如果输入无效，重置为空或0
                            setMinPrice('0');
                            dispatch(updateFilter({key: 'min_price', value: '0'}));
                          }
                        }}
                        type="number"
                        placeholder="Min"
                        min={0}
                        className="h-auto w-16"
                      />
                      <span>-</span>
                      <Input
                        value={maxPrice}
                        onChange={e => {
                          // 输入阶段只更新值，不做检查
                          setMaxPrice(e.target.value);
                        }}
                        onBlur={e => {
                          const value = parseInt(e.target.value, 10);
                          const minVal = minPrice === '' ? 0 : parseInt(minPrice, 10);
                          if (!isNaN(value) && value >= minVal) {
                            setMaxPrice(value.toString());
                            // 更新 Store 中的最大值
                            dispatch(updateFilter({key: 'max_price', value: value.toString()}));
                          } else if (e.target.value === '') {
                            setMaxPrice('');
                            // 清空 Store 中的最大值
                            dispatch(updateFilter({key: 'max_price', value: ''}));
                          } else {
                            // 如果输入无效，设置为最小值
                            setMaxPrice(minVal.toString());
                            dispatch(updateFilter({key: 'max_price', value: minVal.toString()}));
                          }
                        }}
                        type="number"
                        placeholder="Max"
                        min={minPrice === '' ? 0 : minPrice}
                        className="h-auto w-16"
                      />
                    </div>
                  </div>
                </td>
              </tr> */}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="block px-2 sm:hidden">
        <div className="flex w-full flex-wrap items-center justify-start gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-1 cursor-pointer items-center justify-between">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground/60 text-sm capitalize',
                      filter?.tags?.filter((id) =>
                        chains?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) =>
                          chains?.children.some((item) => item.id === id)
                        ).length > 0 &&
                        'text-foreground'
                    )}
                  >
                    {t('chains')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn('text-sm')}>
                    {filter?.tags?.filter((id) => chains?.children.some((item) => item.id === id))
                      .length || ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground/60 size-3',
                      filter?.tags?.filter((id) =>
                        chains?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) =>
                          chains?.children.some((item) => item.id === id)
                        ).length > 0 &&
                        'text-foreground'
                    )}
                  />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <ScrollArea className="max-h-[300px]">
                <div className="p-2">
                  {chains?.children.map((item) => (
                    <div
                      key={item.id}
                      className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-md p-2"
                      onClick={() => {
                        const newTags = filter?.tags || [];
                        const tagId = item.id;
                        if (newTags.includes(tagId)) {
                          dispatch(
                            updateFilter({
                              key: 'tags',
                              value: newTags.filter((id) => id !== tagId),
                            })
                          );
                        } else {
                          dispatch(updateFilter({ key: 'tags', value: [...newTags, tagId] }));
                        }
                      }}
                    >
                      <span>{item.name}</span>
                      {filter?.tags?.includes(item.id) && <Check className="size-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-1 cursor-pointer items-center justify-between">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground/60 text-sm capitalize',
                      filter?.tags?.filter((id) =>
                        categories?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) =>
                          categories?.children.some((item) => item.id === id)
                        ).length > 0 &&
                        'text-foreground'
                    )}
                  >
                    {t('categories')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground',
                      filter?.tags?.filter((id) =>
                        categories?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) =>
                          categories?.children.some((item) => item.id === id)
                        ).length > 0 &&
                        'text-foreground'
                    )}
                  >
                    {filter?.tags?.filter((id) =>
                      categories?.children.some((item) => item.id === id)
                    ).length || ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground/60 size-3',
                      filter?.tags?.filter((id) =>
                        categories?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) =>
                          categories?.children.some((item) => item.id === id)
                        ).length > 0 &&
                        'text-foreground'
                    )}
                  />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <ScrollArea className="max-h-[300px]">
                <div className="p-2">
                  {categories?.children.map((item) => (
                    <div
                      key={item.id}
                      className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-md p-2"
                      onClick={() => {
                        const newTags = filter?.tags || [];
                        const tagId = item.id;
                        if (newTags.includes(tagId)) {
                          dispatch(
                            updateFilter({
                              key: 'tags',
                              value: newTags.filter((id) => id !== tagId),
                            })
                          );
                        } else {
                          dispatch(updateFilter({ key: 'tags', value: [...newTags, tagId] }));
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {filter?.tags?.includes(item.id) && <Check className="size-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-1 cursor-pointer items-center justify-between">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground/60 text-sm capitalize',
                      filter?.tags?.filter((id) =>
                        topic?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) => topic?.children.some((item) => item.id === id))
                          .length > 0 &&
                        'text-foreground'
                    )}
                  >
                    {t('topic')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground',
                      filter?.tags?.filter((id) =>
                        topic?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) => topic?.children.some((item) => item.id === id))
                          .length > 0 &&
                        'text-foreground'
                    )}
                  >
                    {filter?.tags?.filter((id) => topic?.children.some((item) => item.id === id))
                      .length || ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground/60 size-3',
                      filter?.tags?.filter((id) =>
                        topic?.children.some((item) => item.id === id)
                      ) &&
                        filter?.tags?.filter((id) => topic?.children.some((item) => item.id === id))
                          .length > 0 &&
                        'text-foreground'
                    )}
                  />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <ScrollArea className="max-h-[300px]">
                <div className="p-2">
                  {topic?.children.map((item) => (
                    <div
                      key={item.id}
                      className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-md p-2"
                      onClick={() => {
                        const newTags = filter?.tags || [];
                        const tagId = item.id;
                        if (newTags.includes(tagId)) {
                          dispatch(
                            updateFilter({
                              key: 'tags',
                              value: newTags.filter((id) => id !== tagId),
                            })
                          );
                        } else {
                          dispatch(updateFilter({ key: 'tags', value: [...newTags, tagId] }));
                        }
                      }}
                    >
                      <span>{item.name}</span>
                      {filter?.tags?.includes(item.id) && <Check className="size-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-1 cursor-pointer items-center justify-between">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground/60 text-sm capitalize',
                      filter?.language && filter?.language.length > 0 && 'text-foreground'
                    )}
                  >
                    {t('languages')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-muted-foreground',
                      filter?.language && filter?.language.length > 0 && 'text-foreground'
                    )}
                  >
                    {filter?.language?.length || ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground/60 size-3',
                      filter?.language && filter?.language.length > 0 && 'text-foreground'
                    )}
                  />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <ScrollArea className="max-h-[300px]">
                <div className="p-2">
                  {languages?.map((item) => (
                    <div
                      key={item.name}
                      className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-md p-2"
                      onClick={() => {
                        const newLanguages = filter?.language || [];
                        if (newLanguages.includes(item.name)) {
                          dispatch(
                            updateFilter({
                              key: 'language',
                              value: newLanguages.filter((lang) => lang !== item.name),
                            })
                          );
                        } else {
                          dispatch(
                            updateFilter({ key: 'language', value: [...newLanguages, item.name] })
                          );
                        }
                      }}
                    >
                      <span>{item.name}</span>
                      {filter?.language?.includes(item.name) && <Check className="size-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}

export function FilterSkeleton() {
  return (
    <Card className="p-4 px-2">
      <CardContent className="p-0">
        <Skeleton className="h-40 w-full" />
      </CardContent>
    </Card>
  );
}
