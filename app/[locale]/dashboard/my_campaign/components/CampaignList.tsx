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
import { TextSearch, Loader2, PlusIcon } from 'lucide-react';
import { cn } from '@shadcn/lib/utils';

import CompCampaignListItem from './CampaignListItem';
import { getDashboardActivityList } from '@libs/request';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@shadcn/components/ui/button';
import { Link } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
import { ICampaignListItem } from '@libs/request';

export default function CampaignList() {
  const t = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [campaignList, setCampaignList] = useState<ICampaignListItem[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaignList', currentPage, pageSize],
    queryFn: () => getDashboardActivityList({ page: currentPage, size: pageSize }),
  });

  useEffect(() => {
    if (data && data.data) {
      setCampaignList(data.data.list || []);
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
        <Button>
          <PlusIcon className="h-4 w-4" />
          <Link href={PagesRoute.MY_POST_CAMPAIGNS}>{t('post_campaign_title')}</Link>
        </Button>
      </div>
      <div className="border-border overflow-hidden rounded-lg border">
        <ScrollArea className="h-[calc(100vh-250px)] w-full">
          <Table className="text-foreground text-center capitalize">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground text-center">{t('campaign_id')}</TableHead>
                <TableHead className="text-foreground text-center">{t('campaign_name')}</TableHead>
                <TableHead className="text-foreground text-center">{t('campaign_type')}</TableHead>
                <TableHead className="text-foreground text-center">{t('campaign_time')}</TableHead>
                <TableHead className="text-foreground text-center">
                  {t('reward_quantity')}
                </TableHead>
                <TableHead className="text-foreground text-center">{t('reward_rules')}</TableHead>
                <TableHead className="text-foreground text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex items-center justify-center gap-1 py-20">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : campaignList && campaignList.length > 0 ? (
                campaignList.map((campaign, index) => (
                  <CompCampaignListItem key={campaign.id || index} campaign={campaign} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
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
