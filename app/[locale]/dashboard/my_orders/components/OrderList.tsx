'use client';

import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn-ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shadcn-ui/pagination';
import { ScrollArea } from '@shadcn-ui/scroll-area';
import { Separator } from '@shadcn-ui/separator';
import { TextSearch, Loader2 } from 'lucide-react';
import { cn } from '@shadcn/lib/utils';

import CompOrderListItem, { OrderItemProps } from './OrderListItem';
import { getOrderList } from '@libs/request';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export default function OrderList() {
  const t = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [orderList, setOrderList] = useState<OrderItemProps[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orderList', currentPage, pageSize],
    queryFn: () => getOrderList({ page: currentPage, limit: pageSize }),
  });

  useEffect(() => {
    if (data && data.data) {
      setOrderList(data.data.order_list || []);
      setTotal(data.data.total || 0);

      // 计算总页数
      const pages = data.data.page_range?.length || Math.ceil((data.data.total || 0) / pageSize);
      setTotalPages(pages > 0 ? pages : 1);
    }
  }, [data, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 获取要显示的页码
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

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          {t('order_total')} <strong className="text-primary">{total}</strong>
        </p>
      </div>
      <div className="border-border overflow-hidden rounded-lg border">
        <ScrollArea className="h-[calc(100vh-250px)] w-full">
          <Table className="text-foreground text-center capitalize">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground text-center">{t('order_id')}</TableHead>
                <TableHead className="text-foreground text-center">{t('time')}</TableHead>
                <TableHead className="text-foreground text-center">{t('project_name')}</TableHead>
                <TableHead className="text-foreground text-center">{t('kol_amount')}</TableHead>
                <TableHead className="text-foreground text-center">{t('payment_amount')}</TableHead>
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
                orderList.map((order, index) => (
                  <CompOrderListItem key={order.id || index} order={order} />
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
      </div>
      <Separator className="my-4" />
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
    </>
  );
}
