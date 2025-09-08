'use client';

import { useTranslations } from 'next-intl';
import { useMediaQuery } from 'react-responsive';
import clsx from 'clsx';
import { Edit, PanelRightClose, PanelRightOpen } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shadcn-ui/sheet';

import { AddChat } from '@assets/svg';
import CompChatHistory from './ChatHistory';

export default function ChatSidebar(props: {
  showHistory: boolean;
  isViewPage: boolean;
  onAddChat: () => void;
  onOpenCHange: (isOpen: boolean) => void;
  onStopCurrentAction: () => Promise<void>;
}) {
  const { showHistory, isViewPage, onAddChat, onOpenCHange, onStopCurrentAction } = props;
  const t = useTranslations('common');
  const isMobile = useMediaQuery({
    query: '(max-width: 768px)',
  });

  return (
    <>
      <div
        className={clsx(
          'border-border bg-background/50 relative z-10 hidden flex-col overflow-hidden border-r backdrop-blur-sm transition-all duration-300 ease-in-out md:flex',
          showHistory ? 'w-54 min-w-54' : isViewPage ? 'w-14 min-w-14' : 'w-0'
        )}
      >
        {isViewPage && !showHistory ? (
          // 缩小状态的侧边栏 - 只显示展开图标
          <div className="flex h-full w-full flex-col">
            <div className="border-border bg-background/95 flex flex-wrap items-center justify-center gap-4 p-3 backdrop-blur-sm">
              <button
                onClick={() => onOpenCHange(true)}
                className="hover:bg-accent rounded-lg p-2 transition-all duration-200 hover:shadow-sm"
                title={t('chat_history')}
              >
                {showHistory ? (
                  <PanelRightOpen className="text-muted-foreground/60 hover:text-foreground size-6" />
                ) : (
                  <PanelRightClose className="text-muted-foreground/60 hover:text-foreground size-6" />
                )}
              </button>
              <div className="hover:bg-accent flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:shadow-sm">
                <Edit
                  className="text-muted-foreground/60 hover:text-foreground size-6 cursor-pointer"
                  onClick={onAddChat}
                />
              </div>
            </div>
          </div>
        ) : (
          <CompChatHistory
            onClose={() => onOpenCHange(false)}
            isOpen={showHistory}
            isInline={true}
            onStopCurrentAction={onStopCurrentAction}
          />
        )}
      </div>
      {isMobile && (
        <Sheet open={showHistory} onOpenChange={onOpenCHange}>
          <SheetTitle className="sr-only">chat history</SheetTitle>
          <SheetContent side="left">
            <CompChatHistory
              onClose={() => onOpenCHange(false)}
              isOpen={showHistory}
              isInline={true}
              onStopCurrentAction={onStopCurrentAction}
              isSheet={true}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
