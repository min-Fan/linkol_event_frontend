import { useFormatter, useLocale, useNow, useTranslations } from 'next-intl';

import PagesRoute from '@constants/routes';
import { Link, useRouter } from '@libs/i18n/navigation';
import { IActive } from '@hooks/marketEvents';
import TokenIcon from 'app/components/TokenIcon';
import defaultAvatar from '@assets/image/avatar.png';
import defaultCover from '@assets/image/default-cover.png';
import { usePayTokenInfo } from '@hooks/usePayTokenInfo';

export default function Active(props: { data: IActive }) {
  const { data } = props;
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');
  const now = useNow();
  const format = useFormatter();
  const { tokenInfo } = usePayTokenInfo(data?.chain_type, data?.token_type);

  return (
    <Link
      href={`${PagesRoute.MARKET_EVENTS}/${data?.id}`}
      className="shadow-primary/10 hover:shadow-primary/20 flex cursor-pointer flex-col overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-lg"
    >
      <img
        className="h-36 w-full object-cover"
        src={data?.cover_img || defaultCover.src}
        alt={data?.title}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = defaultCover.src;
        }}
      />
      <div className="bg-background flex flex-1 flex-col justify-between gap-y-4 p-6">
        <div className="space-y-3">
          <dl className="flex items-center justify-between gap-x-3 text-base font-medium">
            <dt className="truncate">{data?.title}</dt>
            <dd className="bg-accent sm:text-md flex h-8 items-center gap-x-1 rounded-full px-2 text-sm">
              {data?.is_verified ? `$${data?.reward_amount}` : t('unverified')}
              {data?.is_verified && tokenInfo?.iconType && (
                <TokenIcon type={tokenInfo?.iconType as string} className="size-5" />
              )}
            </dd>
          </dl>
          <p className="text-md text-muted-foreground/60 line-clamp-3">{data?.description}</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-x-2">
            <p className="text-muted-foreground text-md">
              {format.relativeTime(new Date(data?.start), now)}
            </p>
            <div className="flex items-center gap-1">
              {data?.joins?.slice(0, 5).map((join: string, index) => (
                <div
                  className="border-background -ml-3 size-4 min-w-4 overflow-hidden rounded-full border-[1px] sm:size-7 sm:min-w-7"
                  key={index}
                >
                  <img
                    src={join || defaultAvatar.src}
                    alt="avatar"
                    className="size-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultAvatar.src;
                    }}
                  />
                </div>
              ))}
              {data?.join_count > 0 && (
                <span className="text-muted-foreground text-md">{data?.join_count}</span>
              )}
            </div>
          </div>
          <dl className="flex items-center justify-between gap-x-3 text-base font-medium">
            <dt className="flex flex-1 items-center gap-x-2 overflow-hidden">
              <img
                className="size-6 overflow-hidden rounded-full"
                src={data?.project?.logo}
                alt={data?.project?.name}
              />
              <span className="flex-1 truncate text-base">{data?.project?.name}</span>
            </dt>
            <dd className="text-primary text-md">
              {t('participate')}
              {/* {locale === 'en' ? data.active_type.en_name : data.active_type.zh_name} */}
            </dd>
          </dl>
        </div>
      </div>
    </Link>
  );
}
