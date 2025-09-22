import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { TableCell, TableRow } from '@shadcn-ui/table';
import { Button } from '@shadcn-ui/button';
import { useAppSelector } from '@store/hooks';
import PagesRoute from '@constants/routes';
import { Link } from '@libs/i18n/navigation';

export interface OrderItemProps {
  /**
   * 已消费金额(
   */
  consumption_amount: number;
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 订单 id
   */
  id: number;
  /**
   * 已同意数量
   */
  kol_agree_count: number;
  /**
   * 购买kol数量
   */
  kol_count: number;
  /**
   * 订单金额(单位元)
   */
  order_amount: number;
  /**
   * 已消费金额(单位元)
   */
  payment_amount: number;
  /**
   * 项目名称
   */
  project_name: string;
  /**
   * 推广开始时间
   */
  promotional_start_at: string;
  /**
   * 推广结束时间
   */
  promotional_end_at: string;
}

export default function OrderListItem({ order }: { order: OrderItemProps }) {
  const t = useTranslations('common');
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

  return (
    <TableRow className="border-border">
      <TableCell>{order.id || '--'}</TableCell>
      <TableCell>{formatTime(order.promotional_end_at)}</TableCell>
      <TableCell>{order.project_name || '--'}</TableCell>
      <TableCell>
        <dl>
          <dt>{order.kol_count || 0}</dt>
          <dd>
            ({t('agreed')} <strong className="text-primary">{order.kol_agree_count || 0}</strong>)
          </dd>
        </dl>
      </TableCell>
      <TableCell>
        <dl>
          <dt>{order.payment_amount || 0}</dt>
          <dd>
            ({t('spent')} <strong className="text-primary">{order.consumption_amount || 0}</strong>{' '}
            )
          </dd>
        </dl>
      </TableCell>
      <TableCell>
        <Link href={`${PagesRoute.MY_ORDERS}/${order.id || ''}`}>
          <Button variant="outline">{t('btn_view_details')}</Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
