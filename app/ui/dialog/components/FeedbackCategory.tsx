import { useTranslations } from 'next-intl';
import clsx from 'clsx';

export enum FeedbackCategoryType {
  KOL_PRICING = 1,
  AI_SCORE,
  KOL_TAGS,
  COMPLAINTS,
  KOL_COMPLAINTS,
  OPTIMIZATION_SUGGESTIONS,
}

export default function FeedbackCategory(props: {
  currentCategory: FeedbackCategoryType;
  onCategoryChange: (category: FeedbackCategoryType) => void;
  problemCategory: { id: number; name: string; code: string }[];
}) {
  const { currentCategory, onCategoryChange, problemCategory } = props;
  const t = useTranslations('common');

  return (
    <div className="space-y-1.5">
      <h4>{t('feedback_category_title')}</h4>
      <ul className="flex flex-wrap gap-2">
        {problemCategory.map((category) => (
          <li
            key={category.id}
            className={clsx(
              'border-secondary cursor-pointer rounded-xl border px-3 py-1.5',
              currentCategory === category.id && 'bg-secondary'
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            {t(`feedback_category_item_${category.id}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
