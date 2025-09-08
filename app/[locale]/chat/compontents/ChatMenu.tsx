'use client';

import { AlignJustify, History, Edit } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover';
import { Button } from '@shadcn/components/ui/button';
import { useState } from 'react';
import { useAppDispatch } from 'app/store/hooks';
import {
  updateChatCid,
  updateChatView,
  completeOrderProcessing,
} from 'app/store/reducers/userSlice';
import { useRouter } from '@libs/i18n/navigation';
import { MaximizeScreen } from 'app/assets/svg';
import Routes from 'app/constants/routes';
import { useTranslations } from 'next-intl';

interface ChatMenuProps {
  onOpenHistory?: () => void;
}

export default function ChatMenu({ onOpenHistory }: ChatMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const t = useTranslations('common');

  const handleNewChat = () => {
    dispatch(updateChatCid(null));
    dispatch(completeOrderProcessing());
    dispatch(updateChatView('chat'));
    setIsOpen(false);
  };

  const handleOpenHistory = () => {
    if (onOpenHistory) {
      onOpenHistory();
    }
    setIsOpen(false);
  };

  const handleGoToChatView = () => {
    router.push(Routes.CHAT_VIEW);
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: History,
      label: t('chat_menu_open_history'),
      onClick: handleOpenHistory,
    },
    {
      icon: Edit,
      label: t('chat_menu_new_chat'),
      onClick: handleNewChat,
    },
    {
      icon: MaximizeScreen,
      label: t('chat_menu_chat_view'),
      onClick: handleGoToChatView,
    },
  ];

  return (
    <div className="flex items-center justify-between">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 p-1">
            <AlignJustify className="text-primary size-5 cursor-pointer" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="!w-auto p-1" align="end" side="bottom" sideOffset={8}>
          <div className="flex flex-col gap-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto w-auto justify-start gap-2 p-2"
                  onClick={item.onClick}
                >
                  <IconComponent className="text-primary size-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
