import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { TableCell, TableRow } from '@shadcn-ui/table';
import { Button } from '@shadcn-ui/button';
import { useAppSelector } from '@store/hooks';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';
import { ICampaignListItem } from '@libs/request';

export default function CampaignListItem({ campaign }: { campaign: ICampaignListItem }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);

  // 格式化时间
  const formatTime = (timestamp: string | number | undefined) => {
    if (!timestamp) return '--';
    try {
      return format(new Date(timestamp), 'yyyy/MM/dd HH:mm');
    } catch (error) {
      return '--';
    }
  };

  // 检查活动是否已经结束
  const isCampaignEnded = () => {
    if (!campaign.end) return false;
    try {
      const endDate = new Date(campaign.end);
      const now = new Date();
      return endDate < now;
    } catch (error) {
      return false;
    }
  };

  const campaignEnded = isCampaignEnded();

  return (
    <TableRow className="border-border">
      <TableCell>{campaign.id || '--'}</TableCell>
      <TableCell>{campaign.title || '--'}</TableCell>
      <TableCell>
        {locale === 'zh' ? campaign.active_type.zh_name : campaign.active_type.en_name || '--'}
      </TableCell>
      <TableCell>
        {campaign.start_bj} - {campaign.end_bj}
      </TableCell>
      <TableCell>{campaign.reward_amount_yuan || '--'}</TableCell>
      <TableCell>
        {locale === 'zh' ? campaign.reward_rule.zh_name : campaign.reward_rule.en_name || '--'}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Link href={`${PagesRoute.MARKET_EVENTS}/${campaign.id || ''}`}>
            <Button variant="outline">{t('btn_view_details')}</Button>
          </Link>
          {campaignEnded ? (
            <Button disabled title={t('campaign_ended')}>
              {t('btn_edit')}
            </Button>
          ) : (
            <Link href={`${PagesRoute.MY_POST_CAMPAIGNS}/${campaign.id || ''}`}>
              <Button>{t('btn_edit')}</Button>
            </Link>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
