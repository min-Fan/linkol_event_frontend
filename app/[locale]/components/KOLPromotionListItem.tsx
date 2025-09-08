import { useTranslations } from 'next-intl';
import { TableCell, TableRow } from '@shadcn-ui/table';

import CompKOLInformation from './KOLInformation';
import { OrderDetailItem, KolRankListItem } from 'app/@types/types';
import { formatNumberKMB } from '@libs/utils';
import { KOL_AUDIT_STATUS } from '@libs/request';
import { Badge } from '@shadcn-ui/badge';
import { cn } from '@shadcn/lib/utils';
import { useAppSelector } from '@store/hooks';
export default function KOLPromotionListItem({ item }: { item: OrderDetailItem }) {
  const t = useTranslations('common');
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case KOL_AUDIT_STATUS.PENDING:
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case KOL_AUDIT_STATUS.DOING:
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case KOL_AUDIT_STATUS.FINISHED:
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case KOL_AUDIT_STATUS.REJECT:
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  return (
    <TableRow className="border-border">
      <TableCell>
        <CompKOLInformation hasPartners={false} kol={item.kol as KolRankListItem} />
      </TableCell>
      <TableCell>{formatNumberKMB(item.kol.followers)}</TableCell>
      <TableCell>
        {item.kol.price_yuan} {payTokenInfo?.symbol}/tweet
      </TableCell>
      <TableCell>{item.kol.score}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {item.kol.tags
            ?.split('/')
            .slice(0, 3)
            .map((tag) => (
              <Badge
                key={tag}
                className="bg-muted-foreground/10 text-muted-foreground/60 text-xs font-normal"
              >
                {tag.trim()}
              </Badge>
            ))}
        </div>
      </TableCell>
      <TableCell>
        <ul className="text-muted-foreground text-center text-xs capitalize">
          <li>
            {t('listed')}: {formatNumberKMB(item.kol.listed)}
          </li>
          <li>
            {t('tweets')}: {formatNumberKMB(item.kol.tweets)}
          </li>
          <li>
            {t('likes')}: {formatNumberKMB(item.kol.likes)}
          </li>
        </ul>
      </TableCell>
      <TableCell>
        <Badge className={cn('font-medium', getStatusStyle(item.kol_audit_status))}>
          {t(item.kol_audit_status)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
