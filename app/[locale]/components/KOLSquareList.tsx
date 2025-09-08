'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import clsx from 'clsx';
import {
  CircleHelp,
  TextSearch,
  Loader2,
  Search,
  DollarSign,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

import { Card, CardContent } from '@shadcn-ui/card';
import { Tabs, TabsList, TabsTrigger } from '@shadcn-ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn-ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn-ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shadcn-ui/pagination';
import { Separator } from '@shadcn-ui/separator';
import { Checkbox } from '@shadcn-ui/checkbox';
import { ScrollArea } from '@shadcn-ui/scroll-area';

import CompKOLSquareListItem from './KOLSquareListItem';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  updateFilter,
  updateSelectedKOLInfo,
  clearSelectedKOLInfo,
  updateSelectedKOLs,
  updateQuickOrder,
  updateViewQuoteExplanationModal,
} from '@store/reducers/userSlice';
import { getKol, getKOLInfo, getProblemCategory } from '@libs/request';
import { KolRankListData, KolRankListItem } from 'app/@types/types';
import { cn } from '@shadcn/lib/utils';
import { usePathname } from 'next/navigation';
import CompKOLPriceRange from './KOLPriceRange';
import { Verified } from '@assets/svg';
import watermark from '@assets/image/watermark.png';
import watermarkDark from '@assets/image/watermark_dark.png';

export enum TAB_VALUE {
  ALL,
  TOP_50,
  TOP_100,
}

export default function KOLSquareList() {
  const t = useTranslations('common');
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.userReducer?.filter);
  const [tabValue, setTabValue] = useState<string>('' + TAB_VALUE.TOP_50);

  // const handleTabChange = (value: string) => {
  //   setTabValue(value);
  //   dispatch(
  //     updateFilter({
  //       key: 'limit',
  //       value: value === '' + TAB_VALUE.TOP_50 ? 50 : value === '' + TAB_VALUE.TOP_100 ? 100 : 0,
  //     })
  //   );
  //   setPageSize(value === '' + TAB_VALUE.TOP_50 ? 50 : value === '' + TAB_VALUE.TOP_100 ? 100 : 0);
  // };

  const [kolList, setKolList] = useState<KolRankListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 每页显示数量
  const [kw, setKw] = useState<string>('');

  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);
  const pathname = usePathname();
  const [isLoadingKOL, setIsLoadingKOL] = useState<boolean>(false);
  const [lastRequestedKOLId, setLastRequestedKOLId] = useState<string | null>(null);

  const CACHE_KEY = 'feedback_problem_category';
  const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24小时缓存过期

  const getKOL = useCallback(
    async (id: string) => {
      try {
        // 如果正在加载或者请求的是同一个ID，则跳过
        if (isLoadingKOL || lastRequestedKOLId === id) return;

        setIsLoadingKOL(true);
        setLastRequestedKOLId(id);

        const locale = pathname.includes('/zh') ? 'zh' : 'en';
        const res: any = await getKOLInfo(id, { language: locale });
        if (res.code === 200 && res.data) {
          dispatch(updateSelectedKOLInfo(res.data));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingKOL(false);
      }
    },
    [isLoadingKOL, lastRequestedKOLId, pathname, dispatch]
  );

  useEffect(() => {
    dispatch(clearSelectedKOLInfo());
  }, []);

  const getKOLList = async (page = 1) => {
    try {
      if (!filter) return;
      setIsLoading(true);
      setKolList([]);

      // 当有搜索关键词时，忽略其他筛选条件
      const requestParams = filter.kw
        ? {
            kw: filter.kw,
            page: page,
            limit: pageSize,
            order: filter.order,
          }
        : {
            kw,
            page: page,
            limit: pageSize,
            tags: filter?.tags.length > 0 ? JSON.stringify(filter?.tags) : '',
            language: filter?.language.length > 0 ? JSON.stringify(filter?.language) : '',
            // min_price: filter?.min_price,
            // max_price: filter?.max_price,
            is_verified: filter?.is_verified || {},
            order: filter.order,
          };

      const res: any = await getKol(requestParams);
      setIsLoading(false);
      if (res.code === 200) {
        const data: KolRankListData = res.data;
        if (data.list && data.list.length > 0) {
          // 使用setTimeout来确保在列表渲染后再获取KOL信息
          setTimeout(() => {
            getKOL(data.list[0].id.toString());
          }, 0);
        }
        setKolList(data.list);
        setTotal(data.total);
        setTotalPages(data.page_range.length);
      }
    } catch (error) {
      console.error('获取KOL列表失败:', error);
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getKOLList(page);
  };

  useEffect(() => {
    // if (filter) {
    setCurrentPage(1); // 重置到第一页
    getKOLList();
    // }
  }, [filter]);

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5; // 最多显示5个页码

    if (totalPages <= maxVisiblePages) {
      // 总页数少于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数多于最大显示数，显示部分页码
      if (currentPage <= 3) {
        // 当前页靠前
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页靠后
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const [selectedKOLs, setSelectedKOLs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  // 获取全局已选择的KOL
  const globalSelectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs || []);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // 获取当前页面所有KOL的ID (排除price_yuan为0的项目)
      const currentPageKolIds = kolList.filter((kol) => kol.price_yuan !== 0).map((kol) => kol.id);

      // 合并当前页和已选择的KOL ID（去重）
      const allSelectedIds = Array.from(new Set([...selectedKOLs, ...currentPageKolIds]));
      setSelectedKOLs(allSelectedIds);

      // 同时更新Redux store
      // 首先获取已选择但不在当前页面上的KOL对象
      const previouslySelectedKols = globalSelectedKOLs.filter(
        (kol) => !currentPageKolIds.includes(kol.id)
      );

      // 合并已选择的和当前页面的KOL对象 (排除price_yuan为0的项目)
      const mergedKols = [
        ...previouslySelectedKols,
        ...kolList.filter((kol) => kol.price_yuan !== 0),
      ];

      // 更新Redux store，去重（根据id）
      const uniqueKols = Array.from(new Map(mergedKols.map((kol) => [kol.id, kol])).values());
      dispatch(updateSelectedKOLs(uniqueKols));
    } else {
      // 只取消当前页面上的选择
      const currentPageKolIds = kolList.map((kol) => kol.id);
      const remainingSelectedIds = selectedKOLs.filter((id) => !currentPageKolIds.includes(id));
      setSelectedKOLs(remainingSelectedIds);

      // 同时更新Redux store
      const remainingKols = globalSelectedKOLs.filter((kol) => !currentPageKolIds.includes(kol.id));
      dispatch(updateSelectedKOLs(remainingKols));
    }
  };

  const handleSelectKOL = (id: number, checked: boolean) => {
    if (checked) {
      // 更新本地选择状态
      const newSelectedKOLs = [...selectedKOLs, id];
      setSelectedKOLs(newSelectedKOLs);

      // 获取当前要添加的KOL完整信息
      const kolToAdd = kolList.find((kol) => kol.id === id);
      if (kolToAdd) {
        // 检查全局中是否已存在该KOL
        const isAlreadySelected = globalSelectedKOLs.some((kol) => kol.id === id);

        if (!isAlreadySelected) {
          // 如果全局中不存在，添加到全局
          dispatch(updateSelectedKOLs([...globalSelectedKOLs, kolToAdd]));
        }
      }
    } else {
      // 更新本地选择状态
      const newSelectedKOLs = selectedKOLs.filter((kolId) => kolId !== id);
      setSelectedKOLs(newSelectedKOLs);

      // 从Redux store中移除该KOL
      const updatedGlobalKOLs = globalSelectedKOLs.filter((kol) => kol.id !== id);
      dispatch(updateSelectedKOLs(updatedGlobalKOLs));
    }
  };

  const getProblem = async () => {
    try {
      // 检查缓存
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // 检查缓存是否过期
        if (Date.now() - timestamp < CACHE_EXPIRE_TIME) {
          return;
        }
      }

      const res = await getProblemCategory();
      if (res.code === 200 && res.data.feedback_classes) {
        const data = res.data.feedback_classes;
        // 更新缓存
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      console.log('problem category error', error);
    }
  };

  const handleVerifyChange = (checked: boolean) => {
    if (checked) {
      // 如果选中 verify，清空其他筛选条件
      dispatch(updateFilter({ key: 'tags', value: [] }));
      dispatch(updateFilter({ key: 'language', value: [] }));
      dispatch(updateFilter({ key: 'min_price', value: '' }));
      dispatch(updateFilter({ key: 'max_price', value: '' }));
      dispatch(updateFilter({ key: 'is_verified', value: 1 }));
    } else {
      // 如果取消选中，只清空 verify
      dispatch(updateFilter({ key: 'is_verified', value: 0 }));
    }
  };

  useEffect(() => {
    getProblem();
  }, []);

  // 当KOL列表变化时，更新本地选择状态以反映全局状态
  useEffect(() => {
    if (kolList.length > 0) {
      // 从全局已选KOL中找出当前页面上的KOL ID
      const selectedIdsOnCurrentPage = globalSelectedKOLs
        .filter((kol) => kolList.some((currentKol) => currentKol.id === kol.id))
        .map((kol) => kol.id);

      // 更新本地选择状态
      setSelectedKOLs(selectedIdsOnCurrentPage);

      // 计算可选择的项目数（排除price_yuan为0的项目）
      const selectableItems = kolList.filter((kol) => kol.price_yuan !== 0);

      // 更新全选状态 - 只比较可选择的项目
      setSelectAll(
        selectedIdsOnCurrentPage.length === selectableItems.length && selectableItems.length > 0
      );
    } else {
      setSelectedKOLs([]);
      setSelectAll(false);
    }
  }, [kolList, globalSelectedKOLs]);

  // 监控选中项，更新全选状态
  useEffect(() => {
    // 更新选择 重置订单
    dispatch(updateQuickOrder({ key: 'project_id', value: '' }));
    dispatch(updateQuickOrder({ key: 'order_id', value: '' }));
    dispatch(updateQuickOrder({ key: 'order_no', value: '' }));
    dispatch(clearSelectedKOLInfo());
    if (kolList.length > 0) {
      // 计算可选择的项目数（排除price_yuan为0的项目）
      const selectableItems = kolList.filter((kol) => kol.price_yuan !== 0);

      if (selectableItems.length > 0 && selectedKOLs.length === selectableItems.length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
    }
  }, [selectedKOLs, kolList]);

  // 批量操作函数
  const handleBatchOperation = () => {
    // 使用全局状态中的已选KOL，而不是本地状态
    console.log('批量操作已选KOL IDs', selectedKOLs);
    console.log('批量操作全局已选KOL对象', globalSelectedKOLs);

    // 这里可以实现您需要的具体操作，比如发送消息、导出数据等
    // 使用globalSelectedKOLs进行后续操作
  };

  const openQuoteExplanationModal = () => {
    dispatch(updateViewQuoteExplanationModal(false));
  };

  const changeOrder = () => {
    if (filter?.order == 'desc') {
      dispatch(updateFilter({ key: 'order', value: 'asc' }));
    } else if (filter?.order == 'asc') {
      dispatch(updateFilter({ key: 'order', value: 'desc' }));
    } else {
      dispatch(updateFilter({ key: 'order', value: 'desc' }));
    }
  };

  return (
    <Card className="rounded-lg p-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] sm:rounded-3xl dark:shadow-[0px_4px_6px_0px_rgba(255,255,255,0.05)]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-2 sm:p-4">
          <p className="text-muted-foreground text-sm">
            {t.rich('total_kol_agent', {
              count: (chunks) => <strong className="text-primary text-base">{total}</strong>,
            })}
          </p>
          <div className="flex items-center gap-2">
            {/* tips: 搜索框暂时隐藏 */}
            {/* <div className="relative">
              <Input
                placeholder={t('btn_search')}
                value={kw}
                onChange={e => setKw(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    dispatch(updateFilter({key: 'kw', value: kw}));
                  }
                }}
                className="rounded-full pr-8"
              />
              {kw ? (
                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={() => {
                      setKw('');
                      dispatch(updateFilter({key: 'kw', value: ''}));
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                      <path d="M18 6 6 18"/>
                      <path d="m6 6 12 12"/>
                    </svg>
                  </Button>
                  <Search 
                    className="text-muted-foreground size-4 cursor-pointer" 
                    onClick={() => dispatch(updateFilter({key: 'kw', value: kw}))}
                  />
                </div>
              ) : (
                <Search 
                  className="text-muted-foreground absolute top-1/2 right-2 size-4 -translate-y-1/2 cursor-pointer" 
                  onClick={() => dispatch(updateFilter({key: 'kw', value: kw}))}
                />
              )}
            </div> */}
            {/* <CompKOLPriceRange /> */}
            <div className="flex items-center gap-2 px-2 py-0 sm:px-3 sm:py-2">
              <Checkbox
                id="verify"
                checked={filter?.is_verified === 1}
                onCheckedChange={handleVerifyChange}
              />
              <label
                htmlFor="verify"
                className="flex cursor-pointer items-center gap-1 text-sm font-medium"
              >
                <span>{t('verified')}</span>
                <Verified className="size-4" />
              </label>
            </div>
            {/* <Tabs value={tabValue} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value={`${TAB_VALUE.TOP_50}`}>
                  <span
                    className={clsx('text-muted-foreground px-2', tabValue === '' + TAB_VALUE.TOP_50 && 'text-primary')}
                  >
                    {t('top_count', {count: 50})}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={`${TAB_VALUE.TOP_100}`}>
                  <span
                    className={clsx(
                      'text-muted-foreground px-2',
                      tabValue === '' + TAB_VALUE.TOP_100 && 'text-primary',
                    )}
                  >
                    {t('top_count', {count: 100})}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs> */}
          </div>
        </div>
        <Separator />
        <ScrollArea>
          <Table
            className={clsx(`text-foreground bg-left-top bg-repeat text-center capitalize`)}
            style={{
              backgroundImage: `url(${theme === 'dark' ? watermarkDark.src : watermark.src})`,
            }}
          >
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground my-2 text-center">
                  <div className="border-border flex items-center justify-center border-r px-3">
                    <Checkbox
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <span className="border-border flex w-full items-center justify-center border-r pr-3 pl-1">
                    {t('rank')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <span className="border-border flex w-full items-center justify-center border-r pr-2">
                    {t('kol_name')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground bg-primary/5 text-center">
                  <div className="border-border flex w-full items-center justify-center space-x-1 border-r pr-2">
                    <div className="flex items-center" onClick={changeOrder}>
                      {filter?.order == 'desc' ? (
                        <ArrowDown className="size-4" />
                      ) : (
                        <ArrowUp className="size-4" />
                      )}
                      <span>{t('price')}</span>
                    </div>

                    <CircleHelp
                      className="size-4 cursor-pointer"
                      onClick={openQuoteExplanationModal}
                    />
                    {/* <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                        
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t('price_tip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> */}
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <span className="border-border flex w-full items-center justify-center border-r pr-2">
                    {t('followers')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <div className="border-border flex w-full items-center justify-center space-x-1 border-r pr-2">
                    <span>{t('focus_score')}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CircleHelp className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t('focus_score_tip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <div className="border-border flex w-full items-center justify-center space-x-1 border-r pr-2">
                    <span>{t('hot_tags')}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CircleHelp className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {t.rich('tags_tip', {
                              count: (chunks) => <span>3</span>,
                            })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <div className="flex w-full items-center justify-center space-x-1">
                    <span>{t('interaction_value')}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CircleHelp className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t('interaction_value_tip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="flex items-center justify-center gap-1 py-20">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : kolList && kolList.length > 0 ? (
                kolList.map((item, index) => (
                  <CompKOLSquareListItem
                    key={item.id}
                    rank={(currentPage - 1) * pageSize + index + 1}
                    kol={item}
                    onSelectChange={handleSelectKOL}
                    isSelectedFromParent={selectedKOLs.includes(item.id)}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="flex items-center justify-center gap-1 py-20">
                      <TextSearch className="h-6 w-6" />
                      <span>{t('no_data')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-center p-2 sm:p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={cn(
                        'cursor-pointer',
                        currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                      )}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index} className="h-5 w-5 sm:h-9 sm:w-9">
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis className="h-5 w-5 sm:h-9 sm:w-9" />
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page as number);
                          }}
                          className="h-5 w-5 sm:h-9 sm:w-9"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={cn(
                        'cursor-pointer',
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
