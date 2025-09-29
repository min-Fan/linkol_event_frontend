'use client';

import { useTranslations } from 'next-intl';
import { TextSearch } from 'lucide-react';
import { toast } from 'sonner';

import { RankFirst, RankSecond, RankThird } from '@assets/svg';
import { formatNumberKMB } from '@libs/utils';
import { useBanner, useLeadboard } from '@hooks/marketEvents';
import { Skeleton } from '@shadcn/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn/components/ui/table';

// 排行榜骨架屏组件
const LeadboardSkeleton = () => {
  const t = useTranslations('common');
  return (
    <div className="border-border bg-background box-border rounded-3xl border p-4 sm:p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">KOL</TableHead>
            <TableHead className="text-right">{t('followers')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, index) => (
            <TableRow key={index}>
              <TableCell className="flex items-center gap-2 p-3">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function Leadboard() {
  const { data, isLoading } = useLeadboard();
  const t = useTranslations('common');

  const handleCopy = async (text: string | undefined) => {
    try {
      if (text == undefined) return;

      await navigator.clipboard.writeText(text);
      toast.success(t('copy_success'));
    } catch (error) {
      toast.error(t('copy_failed'));
    }
  };

  if (isLoading) {
    return <LeadboardSkeleton />;
  }

  if (!Array.isArray(data) || data?.length === 0) {
    return (
      <div className="border-border bg-background box-border h-full rounded-3xl border p-4 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">KOL</TableHead>
              <TableHead className="text-right">{t('followers')}</TableHead>
              {/* <TableHead className="text-right">{t('brand_value')}</TableHead> */}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="text-md text-muted-foreground flex aspect-video items-center justify-center gap-1 font-medium md:aspect-auto md:h-full">
          <TextSearch className="h-6 w-6" />
          <span>{t('no_data')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-background box-border h-full rounded-3xl border p-4 sm:p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-md text-left">KOL</TableHead>
            <TableHead className="text-md text-right">{t('followers')}</TableHead>
            {/* <TableHead className="text-md text-right">{t('brand_value')}</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="flex items-center gap-2 p-3">
                <div className="flex size-8 items-center justify-center">
                  {index === 0 && <RankFirst className="size-full" />}
                  {index === 1 && <RankSecond className="size-full" />}
                  {index === 2 && <RankThird className="size-full" />}
                  {index > 2 && <span className="text-md font-medium">{index + 1}</span>}
                </div>
                <img
                  src={item.profile_image_url}
                  alt={item.screen_name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <dl className="flex max-w-[100px] flex-1 flex-col overflow-hidden">
                  <span className="text-md truncate font-medium">{item.name}</span>
                  {/* <span
                    className="cursor-pointer truncate text-sm"
                    onClick={() => handleCopy(item.screen_name)}
                  >
                    @{item.screen_name}
                  </span> */}
                </dl>
              </TableCell>
              <TableCell className="text-md text-right font-medium">
                {formatNumberKMB(item.followers)}
              </TableCell>
              {/* <TableCell className="text-right text-md font-medium">
                {formatNumberKMB(item.brand_value)}
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
