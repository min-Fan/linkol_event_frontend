'use client';

import { useTranslations } from 'next-intl';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn-ui/table';

import { useAppSelector } from '@store/hooks';
import { formatNumberKMB } from '@libs/utils';
import defaultAvatar from '@assets/image/avatar.png';
import { Link } from '@libs/i18n/navigation';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';

export default function SubmitOrderSelectedKOL(props: { KOLsCount: number }) {
  const { KOLsCount } = props;
  const t = useTranslations('common');
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const sortedKOLs = [...(selectedKOLs || [])].sort((a, b) => b.price_yuan - a.price_yuan);

  return (
    <div className="bg-background rounded-2xl px-4">
      <ScrollArea className="max-h-[300px] w-full overflow-auto">
        <Table className="text-muted-foreground text-center select-none">
          <TableHeader>
            <TableRow className="border-border capitalize">
              <TableHead>&nbsp;</TableHead>
              <TableHead className="text-muted-foreground text-center">{t('kol_name')}</TableHead>
              <TableHead className="text-muted-foreground text-center">{t('followers')}</TableHead>
              <TableHead className="text-muted-foreground text-center">{t('listed')}</TableHead>
              <TableHead className="text-muted-foreground text-center">{t('tweets')}</TableHead>
              <TableHead className="text-muted-foreground text-center">{t('likes')}</TableHead>
              <TableHead className="text-muted-foreground text-center">{t('hot_tags')}</TableHead>
              <TableHead className="text-muted-foreground text-center">
                {payTokenInfo?.symbol}/Tweets
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedKOLs?.map((kol, index) => (
              <TableRow className="border-border" key={kol.id}>
                <TableCell>
                  <Checkbox
                    checked={index < KOLsCount}
                    className="pointer-events-none cursor-default"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground max-w-40 text-center">
                  {/* <div className="size-4">
                  <Image
                    src={kol.profile_image_url}
                    alt={kol.name}
                    width={16}
                    height={16}
                    className="h-full w-full rounded-full object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div> */}
                  <Link
                    href={`https://x.com/${kol.name}`}
                    target="_blank"
                    className="hover:text-primary flex items-center justify-center gap-2"
                  >
                    <img
                      src={kol.profile_image_url || defaultAvatar.src}
                      alt={kol.name}
                      width={16}
                      height={16}
                      className="size-5 rounded-full object-cover"
                    />
                    <span className="block truncate transition-colors">{kol.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-center">
                  {formatNumberKMB(kol.followers)}
                </TableCell>
                <TableCell className="text-muted-foreground text-center">
                  {formatNumberKMB(kol.listed)}
                </TableCell>
                <TableCell className="text-muted-foreground text-center">
                  {formatNumberKMB(kol.tweets)}
                </TableCell>
                <TableCell className="text-muted-foreground text-center">
                  {formatNumberKMB(kol.likes)}
                </TableCell>
                <TableCell className="text-muted-foreground text-center">{kol.tags}</TableCell>
                <TableCell className="text-muted-foreground text-center">
                  <strong className="text-primary font-semibold">{kol.price_yuan}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
