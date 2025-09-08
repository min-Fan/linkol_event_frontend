'use client';
import React from 'react';
import { useAppDispatch } from 'app/store/hooks';
import { updateChatCid } from 'app/store/reducers/userSlice';
export default function ChatPageLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const handleAddChat = () => {
    // 清空当前对话的 cid
    dispatch(updateChatCid(null));
  };
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
