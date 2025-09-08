import { useTranslations } from 'next-intl';
import { TableCell, TableRow } from '@shadcn-ui/table';

import CompKOLInformation from './KOLInformation';
import { IOrderGainListItem, KolRankListItem } from 'app/@types/types';
import { formatNumberKMB } from '@libs/utils';
export default function PromotionDataListItem({ item }: { item: IOrderGainListItem }) {
  const t = useTranslations('common');

  return (
    <TableRow className="border-border">
      <TableCell>
        <CompKOLInformation hasPartners={false} kol={item.kol as KolRankListItem} />
      </TableCell>
      <TableCell>{formatNumberKMB(item.views)}</TableCell>
      <TableCell>{formatNumberKMB(item.replay)}</TableCell>
      <TableCell>{formatNumberKMB(item.repost)}</TableCell>
      <TableCell>{formatNumberKMB(item.likes)}</TableCell>
    </TableRow>
  );
}
