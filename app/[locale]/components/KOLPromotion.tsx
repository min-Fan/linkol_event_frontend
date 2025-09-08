'use client';

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { CircleHelp, Loader2, TextSearch } from 'lucide-react';

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
import { toast } from 'sonner';

import { getOrderDetail, KOL_AUDIT_STATUS } from '@libs/request';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { OrderDetailItem } from 'app/@types/types';
import { updatePromotionData } from '@store/reducers/userSlice';
import CompKOLPromotionListItem from './KOLPromotionListItem';
import KOLPromotionPanel from './KOLPromotionPanel';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';

export default function KOLPromotion() {
  const t = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 每页显示10条数据
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState<KOL_AUDIT_STATUS>(KOL_AUDIT_STATUS.ALL);
  const dispatch = useAppDispatch();
  const handleTabChange = (value: KOL_AUDIT_STATUS) => {
    setTabValue(value);
  };

  const [details, setDetails] = useState<OrderDetailItem[]>([]);
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const getDetails = async () => {
    try {
      setIsLoading(true);
      if (!quickOrder?.order_id) return;
      const res = await getOrderDetail({
        order_id: Number(quickOrder?.order_id),
        kol_audit_status: tabValue,
      });
      setIsLoading(false);
      if (res.code === 200) {
        const data: OrderDetailItem[] = res.data.order_items;
        setDetails(data);
        if (tabValue === KOL_AUDIT_STATUS.ALL) {
          dispatch(updatePromotionData({ key: 'order_amount', value: res.data.order_amount }));
          dispatch(updatePromotionData({ key: 'payment_amount', value: res.data.payment_amount }));
          dispatch(
            updatePromotionData({ key: 'consumption_amount', value: res.data.consumption_amount })
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quickOrder?.order_id) {
      getDetails();
    }
  }, [quickOrder?.order_id, tabValue]);

  // 计算总页数
  const totalPages = Math.ceil(details.length / itemsPerPage);

  // 获取当前页的数据
  const currentPageData = details.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理上一页
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 处理下一页
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 生成页码按钮
  const renderPageNumbers = (): ReactElement[] => {
    const pageNumbers: ReactElement[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationItem key={i}>
          <PaginationLink href="#" isActive={i === currentPage} onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pageNumbers;
  };

  return (
    <>
      <KOLPromotionPanel />
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              {t.rich('total_kol_agent', {
                count: (chunks) => (
                  <strong className="text-primary text-base">{details.length}</strong>
                ),
              })}
            </p>
            <Tabs value={tabValue} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value={KOL_AUDIT_STATUS.ALL}>
                  <span
                    className={clsx(
                      'text-muted-foreground px-2',
                      tabValue === KOL_AUDIT_STATUS.ALL && 'text-primary'
                    )}
                  >
                    {t('all')}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={KOL_AUDIT_STATUS.PENDING}>
                  <span
                    className={clsx(
                      'text-muted-foreground px-2',
                      tabValue === KOL_AUDIT_STATUS.PENDING && 'text-primary'
                    )}
                  >
                    {t('pending')}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={KOL_AUDIT_STATUS.DOING}>
                  <span
                    className={clsx(
                      'text-muted-foreground px-2',
                      tabValue === KOL_AUDIT_STATUS.DOING && 'text-primary'
                    )}
                  >
                    {t('doing')}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={KOL_AUDIT_STATUS.FINISHED}>
                  <span
                    className={clsx(
                      'text-muted-foreground px-2',
                      tabValue === KOL_AUDIT_STATUS.FINISHED && 'text-primary'
                    )}
                  >
                    {t('finished')}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={KOL_AUDIT_STATUS.REJECT}>
                  <span
                    className={clsx(
                      'text-muted-foreground px-2',
                      tabValue === KOL_AUDIT_STATUS.REJECT && 'text-primary'
                    )}
                  >
                    {t('reject')}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Separator />
          <ScrollArea>
            <Table className="text-muted-foreground text-center capitalize">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground text-center">
                    {t('kol_name')}
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    {t('followers')}
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>{t('price')}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleHelp className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{t('price')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>{t('focus_score')}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleHelp className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{t('focus_score')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    <div className="flex items-center justify-center space-x-1">
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
                  <TableHead className="text-muted-foreground text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>{t('interaction_value')}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleHelp className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{t('interaction_value')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">{t('status')}</TableHead>
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
                ) : currentPageData && currentPageData.length > 0 ? (
                  currentPageData.map((item: OrderDetailItem) => (
                    <CompKOLPromotionListItem key={item.id} item={item} />
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
              <div className="flex items-center justify-center p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePreviousPage}
                        className={clsx(
                          'cursor-pointer',
                          currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                        )}
                      />
                    </PaginationItem>
                    {renderPageNumbers()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextPage}
                        className={clsx(
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
    </>
  );
}
