import { Like, Message, ReTwet, Share, Verified } from '@assets/svg';
import { ITweet } from '@hooks/marketEvents';
import { formatNumberKMB } from '@libs/utils';
import { MessageCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

function mapTweetLangToLocale(lang?: string): string {
  switch (lang) {
    case 'zh':
      return 'zh-CN';
    case 'en':
      return 'en-US';
    case 'ja':
      return 'ja-JP';
    case 'ko':
      return 'ko-KR';
    case 'es':
      return 'es-ES';
    case 'fr':
      return 'fr-FR';
    case 'de':
      return 'de-DE';
    case 'ru':
      return 'ru-RU';
    case 'ar':
      return 'ar';
    case 'pt':
      return 'pt-PT';
    case 'vi':
      return 'vi-VN';
    case 'th':
      return 'th-TH';
    case 'ms':
      return 'ms-MY';
    case 'in':
      return 'id-ID';
    default:
      return 'en-US';
  }
}

function formatMonthShortDay(input?: string, lang?: string): string {
  if (!input) return '';
  try {
    const normalized = input.replace(' ', 'T');
    let date = new Date(normalized);
    if (isNaN(date.getTime())) {
      const [datePart] = input.split(' ');
      const [y, m, d] = (datePart || '').split('-').map((v) => Number(v));
      if (m && d) {
        date = new Date(y || 0, m - 1, d);
      }
    }
    if (isNaN(date.getTime())) return '';
    const locale = mapTweetLangToLocale(lang);
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function Tweet(props: { data: ITweet }) {
  const { data } = props;
  const locale = useLocale();
  return (
    <div className="border-primary/15 bg-background flex h-full flex-col justify-between gap-y-3 rounded-2xl border-2 p-6">
      <div className="space-y-3">
        <div className="flex justify-between gap-x-3">
          <div className="flex flex-1 items-center gap-2">
            <img
              src={data.profile_image_url}
              alt={data.screen_name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <dl className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 items-center">
                <span className="truncate text-base font-medium">{data.name}</span>
                {data.is_verified && <Verified className="size-4 min-w-4" />}
              </div>
              <span className="text-muted-foreground cursor-pointer truncate text-sm">
                @{data.screen_name}
              </span>
            </dl>
          </div>
          <span className="text-md font-medium whitespace-nowrap">
            {formatMonthShortDay(data.tweet_created_at, locale)}
          </span>
        </div>
        <p className="text-muted-foreground sm:text-md line-clamp-4 text-sm">{data.tweet_text}</p>
      </div>
      <div className="text-muted-foreground border-border flex items-center justify-between gap-x-4 border-t pt-3 text-sm">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-1">
            <Like className="size-4" />
            <span>{formatNumberKMB(data.like_count)}</span>
          </div>
          <div className="flex items-center gap-x-1">
            <ReTwet className="size-4" />
            <span>{formatNumberKMB(data.retweet_count)}</span>
          </div>
          <div className="flex items-center gap-x-1">
            <MessageCircle className="size-4" />
            <span>{formatNumberKMB(data.reply_count)}</span>
          </div>
        </div>
        {/* <div className="flex items-center gap-x-1">
          <Share className="size-4" />
          <span>Share</span>
        </div> */}
      </div>
    </div>
  );
}
