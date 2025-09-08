import { useTranslations, useLocale } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Card, CardContent } from '@shadcn/components/ui/card';
import { KolRankListItem } from 'app/@types/types';
import { formatNumberKMB } from '@libs/utils';
import { getKOLInfo } from '@libs/request';
import { updateSelectedKOLInfo } from '@store/reducers/userSlice';
import defaultAvatar from '@assets/image/avatar.png';

export default function SubmitOrderListItem({ kol }: { kol: KolRankListItem }) {
  const t = useTranslations('common');
  const lang = useLocale();
  const dispatch = useAppDispatch();
  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);
  const payTokenInfo = useAppSelector((state) => state.userReducer?.pay_token_info);
  const getKOL = async (id: string) => {
    try {
      if (selectedKOLInfo && selectedKOLInfo.id === Number(id)) return;
      const res: any = await getKOLInfo(id, { language: lang });
      if (res.code === 200 && res.data) {
        dispatch(updateSelectedKOLInfo(res.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="hover:bg-muted cursor-pointer p-4" onClick={() => getKOL(kol.id.toString())}>
      <CardContent className="flex h-full flex-col gap-4 p-0">
        <div className="flex items-center space-x-2">
          <div className="bg-secondary size-6 min-w-6 rounded-full">
            <img
              src={kol.profile_image_url}
              alt={kol.name}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatar.src;
              }}
            />
          </div>
          <h3 className="w-full flex-1 truncate text-base font-semibold">
            {kol.name} @{kol.screen_name}
          </h3>
        </div>
        <ul className="text-muted-foreground grid h-full grid-cols-2 gap-2 capitalize">
          <li>
            <span className="text-xs">
              {t('followers')} <strong className="text-md">{formatNumberKMB(kol.followers)}</strong>
            </span>
          </li>
          <li>
            <span className="text-xs">
              {t('listed')} <strong className="text-md">{formatNumberKMB(kol.listed)}</strong>
            </span>
          </li>
          <li>
            <span className="text-xs">
              {t('tweets')} <strong className="text-md">{formatNumberKMB(kol.tweets)}</strong>
            </span>
          </li>
          <li>
            <span className="text-xs">
              {t('likes')} <strong className="text-md">{formatNumberKMB(kol.likes)}</strong>
            </span>
          </li>
        </ul>
        <div className="mt-auto flex flex-col gap-2">
          <p className="text-muted-foreground">{kol.tags}</p>
          <div className="bg-border h-px"></div>
          <p className="text-muted-foreground text-center">
            <strong className="text-primary text-xl font-semibold">{kol.price_yuan}</strong>{' '}
            {payTokenInfo?.symbol}/Tweets
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
