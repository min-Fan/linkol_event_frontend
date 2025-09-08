'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { TableCell, TableRow } from '@shadcn-ui/table';
import { Checkbox } from '@shadcn-ui/checkbox';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@shadcn-ui/tooltip';

import { RankFirst, RankSecond, RankThird, View } from '@assets/svg';
import CompKOLInformation from './KOLInformation';
import { KolRankListItem } from 'app/@types/types';
import { formatNumberKMB, formatPrecision } from '@libs/utils';
import { useState, useEffect } from 'react';
import { updateChatView, updateSelectedKOLInfo } from '@store/reducers/userSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getKOLInfo } from '@libs/request';
import { Badge } from '@shadcn/components/ui/badge';
import { cn } from '@shadcn/lib/utils';
import { ChevronDown, MessageCircleQuestion, MessageSquareWarning } from 'lucide-react';
import CompKOLDetails from './KOLDetails';
import UIDialogFeedback from '@ui/dialog/Feedback';
import { Button } from '@shadcn-ui/button';
import ComparisonKOL from './ComparisonKOL';

export default function KOLSquareListItem(props: {
  rank: number;
  kol: KolRankListItem;
  onSelectChange?: (id: number, checked: boolean) => void;
  isSelectedFromParent?: boolean;
  shouldShowMessages?: boolean;
}) {
  const chat_comparison_view = useAppSelector((state) => state.userReducer?.chat_comparison_view);
  const chat_view = useAppSelector((state) => state.userReducer?.chat_view);
  const { rank, kol, onSelectChange, isSelectedFromParent, shouldShowMessages = true } = props;
  const t = useTranslations('common');
  const [isSelected, setIsSelected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const lang = useLocale();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleSelect = (checked: boolean) => {
    if (kol.price_yuan === 0) return;

    setIsSelected(checked);
    if (onSelectChange) {
      onSelectChange(kol.id, checked);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);
  const handleKOLInfo = async () => {
    try {
      if (selectedKOLInfo && selectedKOLInfo.id === kol.id) return;
      const res = await getKOLInfo(kol.id.toString(), { language: lang });
      if (res.code === 200) {
        dispatch(updateSelectedKOLInfo(res.data));
        dispatch(updateChatView('preview'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  useEffect(() => {
    if (selectedKOLs && kol.price_yuan !== 0) {
      setIsSelected(selectedKOLs.some((item) => item.id === kol.id));
    }
  }, [selectedKOLs, kol]);

  // 当从父组件传入的选择状态变化时，更新本地状态
  useEffect(() => {
    if (isSelectedFromParent !== undefined && kol.price_yuan !== 0) {
      setIsSelected(isSelectedFromParent);
    }
  }, [isSelectedFromParent]);

  return (
    <>
      <TableRow className="border-none">
        <TableCell>
          <div className="px-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              disabled={kol.price_yuan === 0}
            />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex h-full w-full items-center justify-center">
            {rank === 1 && <RankFirst className="mx-auto size-8" />}
            {rank === 2 && <RankSecond className="mx-auto size-8" />}
            {rank === 3 && <RankThird className="mx-auto size-8" />}
            {rank > 3 && rank}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <div className="cursor-pointer">
              <CompKOLInformation
                kol={kol}
                hasPartners={kol.projects && kol.projects.length > 0 && !isExpanded}
              />
            </div>
            {chat_view == 'chat' && chat_comparison_view == true && (
              <ComparisonKOL kol={kol}></ComparisonKOL>
            )}
          </div>
        </TableCell>
        <TableCell className="bg-primary/5 text-primary font-bold">
          ${formatPrecision(kol.price_yuan)}{' '}
          <span className="text-muted-foreground/60 text-xs font-medium">/tweet</span>
        </TableCell>
        <TableCell>{formatNumberKMB(kol.followers)}</TableCell>
        <TableCell>
          <div className={cn('flex items-center justify-center')}>
            <span
              className={cn(
                'p-2 text-sm',
                rank === 1 &&
                  'rounded-full bg-gradient-to-b from-[#FFD801] to-[#FFA201] text-white',
                rank === 2 &&
                  'rounded-full bg-gradient-to-b from-[#DEE4ED] to-[#77859A] text-white',
                rank === 3 && 'rounded-full bg-gradient-to-b from-[#BEE8E5] to-[#208CFB] text-white'
              )}
            >
              {formatNumberKMB(kol.score)}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {kol.tags
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
          <div className="flex items-center justify-center gap-x-2">
            <div
              onClick={toggleExpand}
              className="bg-muted-foreground/10 text-muted-foreground/80 hover:bg-muted-foreground/20 flex w-20 cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-all duration-300"
            >
              {/* <View className="size-5" /> */}
              <span>View</span>
              <ChevronDown
                className={cn(
                  'size-5 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )}
              />
            </div>
            <UIDialogFeedback
              isOpen={isFeedbackOpen}
              onOpenChange={setIsFeedbackOpen}
              kolId={kol.id}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={() => setIsFeedbackOpen(true)}>
                      <MessageSquareWarning className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('feedback_title')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </UIDialogFeedback>
          </div>
        </TableCell>
      </TableRow>
      <TableRow className="border-border hover:bg-transparent">
        <TableCell colSpan={9} className="overflow-hidden p-0">
          <div
            className={cn(
              'w-full transition-all duration-300 ease-in-out',
              isExpanded ? 'max-h-[400px] p-4 opacity-100' : 'max-h-0 p-0 opacity-0'
            )}
          >
            <CompKOLDetails kol={kol} isExpanded={isExpanded} />
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
