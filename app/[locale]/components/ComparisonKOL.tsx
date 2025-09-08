import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  updateChatComparisonView,
  updateChatView,
  updateComparisonInfo,
} from '@store/reducers/userSlice';
import { KolRankListItem } from 'app/@types/types';
import { useTranslations } from 'next-intl';

export default function ComparisonKOL({ kol }: { kol: KolRankListItem }) {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const chat_comparison_info = useAppSelector((state) => state.userReducer?.chat_comparison_info);
  const comparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // dispatch(updateChatView('chat'));
    // dispatch(updateChatComparisonView(true));
    if (!chat_comparison_info?.kol1?.name.trim()) {
      dispatch(
        updateComparisonInfo({
          kol1: {
            name: kol.screen_name,
            avatar: kol.profile_image_url,
          },
          kol2: {
            name: chat_comparison_info?.kol2?.name || '',
            avatar: chat_comparison_info?.kol2?.avatar || '',
          },
        })
      );
    } else if (!chat_comparison_info?.kol2?.name.trim()) {
      dispatch(
        updateComparisonInfo({
          kol1: {
            name: chat_comparison_info?.kol1?.name || '',
            avatar: chat_comparison_info?.kol1?.avatar || '',
          },
          kol2: {
            name: kol.screen_name,
            avatar: kol.profile_image_url,
          },
        })
      );
    } else if (chat_comparison_info?.kol2?.name.trim() && chat_comparison_info?.kol1?.name.trim()) {
      dispatch(
        updateComparisonInfo({
          kol1: {
            name: chat_comparison_info?.kol1?.name || '',
            avatar: chat_comparison_info?.kol1?.avatar || '',
          },
          kol2: {
            name: kol.screen_name,
            avatar: kol.profile_image_url,
          },
        })
      );
    }
  };

  return (
    <div
      className="border-border hover:border-primary cursor-pointer rounded-md border px-3 py-1 text-sm"
      onClick={comparison}
    >
      + {t('keyword_kol_comparison')}
    </div>
  );
}
