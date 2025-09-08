'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import clsx from 'clsx';
import { CircleHelp, TextSearch, Loader2, Search } from 'lucide-react';

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
import { Button } from '@shadcn-ui/button';
import { ScrollArea } from '@shadcn-ui/scroll-area';

import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  updateFilter,
  updateSelectedKOLInfo,
  clearSelectedKOLInfo,
} from '@store/reducers/userSlice';
import {
  getKOLHomeOrderList,
  getKolOrderNoAuthList,
  getKOLInfo,
  IGetKOLHomeOrderListParams,
} from '@libs/request';
import { IKOLHomeOrderList } from 'app/@types/types';
import { cn } from '@shadcn/lib/utils';
import { usePathname } from 'next/navigation';
import OrderListItem from './OrderListItem';
import { Toggle } from '@shadcn/components/ui/toggle';

export enum TAB_VALUE {
  ALL,
  TOP_50,
  TOP_100,
}

export default function OrderList() {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const [orderList, setOrderList] = useState<IKOLHomeOrderList[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 每页显示数量
  const [orderType, setOrderType] = useState<string>('online');
  const [kolAuditStatus, setKolAuditStatus] = useState<string>('');
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  useEffect(() => {
    dispatch(clearSelectedKOLInfo());
  }, []);

  const getOrderListData = async (page = 1) => {
    try {
      setIsLoading(true);

      const requestParams: IGetKOLHomeOrderListParams = {
        page: page,
        size: pageSize,
        order_type: isLoggedIn ? '' : orderType,
        kol_audit_status: kolAuditStatus,
      };

      let res: any;
      if (isLoggedIn) {
        res = await getKOLHomeOrderList(requestParams);
      } else {
        res = await getKolOrderNoAuthList(requestParams);
      }

      setIsLoading(false);
      if (res.code === 200) {
        const data = res.data;
        setOrderList(data.list || []);
        setTotal(data.total);
        setTotalPages(data.page_range.length);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getOrderListData(page);
  };

  useEffect(() => {
    setCurrentPage(1); // 重置到第一页
    getOrderListData();
  }, [orderType, pageSize, kolAuditStatus, isLoggedIn]);

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

  const [live, setLive] = useState(true);
  const [past, setPast] = useState(false);
  const handleToggle = (id: string) => {
    if (id === 'live') {
      setLive(true);
      setPast(false);
      setOrderType('online');
    } else {
      setLive(false);
      setPast(true);
      setOrderType('expired');
    }
  };

  // 状态切换逻辑
  const handleStatusToggle = (status: string) => {
    setKolAuditStatus(status);
  };

  return (
    <Card className="h-full flex-1 rounded-3xl p-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] dark:shadow-[0px_4px_6px_0px_rgba(255,255,255,0.05)]">
      <CardContent className="p-0">
        <div className="box-border flex w-full items-center gap-2 p-2 px-4">
          <p className="text-base font-bold whitespace-nowrap">{t('all_tasks')}</p>
          <div className="relative h-9 w-full flex-1 overflow-auto">
            <div className="flex w-fit flex-nowrap items-center gap-x-2">
              {!isLoggedIn ? (
                <>
                  <Toggle
                    id={'live'}
                    aria-label={`Toggle live`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={live}
                    onPressedChange={() => handleToggle('live')}
                  >
                    <span>{t('live')}</span>
                  </Toggle>
                  <Toggle
                    id={'past'}
                    aria-label={`Toggle past`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={past}
                    onPressedChange={() => handleToggle('past')}
                  >
                    <span>{t('past')}</span>
                  </Toggle>
                </>
              ) : (
                <>
                  <Toggle
                    id={'all'}
                    aria-label={`Toggle all`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={kolAuditStatus === ''}
                    onPressedChange={() => handleStatusToggle('')}
                  >
                    <span>{t('all')}</span>
                  </Toggle>
                  <Toggle
                    id={'pending'}
                    aria-label={`Toggle pending`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={kolAuditStatus === 'pending'}
                    onPressedChange={() => handleStatusToggle('pending')}
                  >
                    <span>{t('awaiting_acceptance')}</span>
                  </Toggle>
                  <Toggle
                    id={'received'}
                    aria-label={`Toggle received`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={kolAuditStatus === 'received'}
                    onPressedChange={() => handleStatusToggle('received')}
                  >
                    <span>{t('executing')}</span>
                  </Toggle>
                  <Toggle
                    id={'executed'}
                    aria-label={`Toggle executed`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={kolAuditStatus === 'executed'}
                    onPressedChange={() => handleStatusToggle('executed')}
                  >
                    <span>{t('executed')}</span>
                  </Toggle>
                  <Toggle
                    id={'done'}
                    aria-label={`Toggle done`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={kolAuditStatus === 'done'}
                    onPressedChange={() => handleStatusToggle('done')}
                  >
                    <span>{t('completed')}</span>
                  </Toggle>
                  {/* <Toggle
                id={'reject'}
                aria-label={`Toggle reject`}
                className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                pressed={kolAuditStatus === 'reject'}
                onPressedChange={() => handleStatusToggle('reject')}
              >
                <span>{t('rejected')}</span>
              </Toggle> */}
                  <Toggle
                    id={'refunded'}
                    aria-label={`Toggle refunded`}
                    className="text-md text-muted-foreground h-auto w-fit gap-1 rounded-lg py-2"
                    pressed={kolAuditStatus === 'refunded'}
                    onPressedChange={() => handleStatusToggle('refunded')}
                  >
                    <span>{t('task_refunded')}</span>
                  </Toggle>
                </>
              )}
            </div>
          </div>
        </div>
        <Separator />

        <ScrollArea>
          <Table className="text-foreground text-center capitalize">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground text-center">
                  <span className="border-border flex w-full items-center justify-start border-r pr-2">
                    {t('project_name')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <span className="border-border flex w-full items-center justify-start border-r pr-2">
                    {t('remaining_amount')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <div className="border-border flex w-full items-center justify-start space-x-1 border-r pr-2">
                    <span>{t('estimate_earning')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <div className="border-border flex w-full items-center justify-start space-x-1 border-r pr-2">
                    <span>{t('promot_time')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center">
                  <div className="border-border flex w-full items-center justify-start space-x-1 border-r pr-2">
                    <span>{t('kol_availibility')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-foreground text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex items-center justify-center gap-1 py-20">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : orderList && orderList.length > 0 ? (
                orderList.map((item, index) => (
                  <OrderListItem key={item.id} kol={item.kol} orderItem={item} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
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
        <Separator />
        <div className="flex items-center justify-center p-4">
          {totalPages > 1 && (
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
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page as number);
                        }}
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
