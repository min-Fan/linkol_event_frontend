'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CircleHelp, Loader2, TextSearch } from 'lucide-react';

import { Card, CardContent } from '@shadcn-ui/card';
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
import CompPromotionDataListItem from './PromotionDataListItem';
import { IOrderGainData } from 'app/@types/types';

export default function PromotionDataList(props: {
  isLoading: boolean;
  orderGain: IOrderGainData | undefined;
  currentPage: number;
  pageSize: number;
  changePage: (page: number) => void;
}) {
  const { isLoading, orderGain, currentPage, pageSize, changePage } = props;
  const t = useTranslations('common');

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <p className="text-muted-foreground">
            {t.rich('total_kol_agent_all', {
              count: (chunks) => (
                <strong className="text-primary text-base">{orderGain?.total || 0}</strong>
              ),
            })}
          </p>
        </div>
        <Separator />
        <div>
          <Table className="text-muted-foreground text-center capitalize">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground text-center">{t('kol_name')}</TableHead>
                <TableHead className="text-muted-foreground text-center">{t('views')}</TableHead>
                <TableHead className="text-muted-foreground text-center">{t('replies')}</TableHead>
                <TableHead className="text-muted-foreground text-center">{t('reposts')}</TableHead>
                <TableHead className="text-muted-foreground text-center">{t('likes')}</TableHead>
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
              ) : orderGain?.list && orderGain?.list.length > 0 ? (
                orderGain?.list.map((item, index) => (
                  <CompPromotionDataListItem key={index} item={item} />
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
        </div>
        {!!orderGain?.total && Math.ceil((orderGain?.total || 0) / pageSize) > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-center p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) changePage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil((orderGain?.total || 0) / pageSize) }).map(
                    (_, idx) => (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === idx + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            changePage(idx + 1);
                          }}
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < Math.ceil((orderGain?.total || 0) / pageSize))
                          changePage(currentPage + 1);
                      }}
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
